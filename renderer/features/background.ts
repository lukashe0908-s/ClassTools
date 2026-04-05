import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getConfigSync } from '@renderer/features/ipc/config';

export type WallpaperType = 'image' | 'video' | 'mixed';

export type WallpaperItem = {
  type: WallpaperType;
  video_url?: string;
  image_url?: string;
};

export const BING_RESOLUTION_OPTIONS = [
  'UHD',
  '1920x1200',
  '1920x1080',
  '1366x768',
  '1280x768',
  '1024x768',
  '800x600',
  '800x480',
  '768x1280',
  '720x1280',
  '640x480',
  '480x800',
  '400x240',
  '320x240',
  '240x320',
] as const;

export type BingResolution = (typeof BING_RESOLUTION_OPTIONS)[number];

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const BING_QUERY_KEY = ['wallpaper', 'bing'] as const;
const NORMAL_QUERY_KEY = ['wallpaper', 'normal'] as const;

type BackgroundConfig = {
  useGameBgs: boolean;
  useGame?: string;
  useAllowType?: string;
  useBingBgs: boolean;
  useNormalBgs: boolean;
  bingResolution: BingResolution;
};

const DEFAULT_BACKGROUND_CONFIG: BackgroundConfig = {
  useGameBgs: false,
  useBingBgs: true,
  useNormalBgs: true,
  bingResolution: 'UHD',
};

function isNextDay(updatedAt: number): boolean {
  const updated = new Date(updatedAt);
  const now = new Date();
  return (
    updated.getFullYear() !== now.getFullYear() ||
    updated.getMonth() !== now.getMonth() ||
    updated.getDate() !== now.getDate()
  );
}

function msUntilNextDay(updatedAt: number): number {
  const nextDay = new Date(updatedAt);
  nextDay.setHours(24, 0, 0, 0);
  return Math.max(0, nextDay.getTime() - Date.now());
}

async function loadBackgroundConfig(): Promise<BackgroundConfig> {
  const useGameBgsRaw = await getConfigSync('display.background.useGameBgs');
  const useGame = String((await getConfigSync('display.background.useGame')) ?? '');
  const useAllowType = String((await getConfigSync('display.background.useGameBgsAllowType')) ?? 'mixed-video-image');
  const useBingBgsRaw = await getConfigSync('display.background.useBingBgs');
  const useNormalBgsRaw = await getConfigSync('display.background.useNormalBgs');
  const bingResolutionRaw = String((await getConfigSync('display.background.bingResolution')) ?? 'UHD');

  return {
    useGameBgs: typeof useGameBgsRaw === 'boolean' ? useGameBgsRaw : DEFAULT_BACKGROUND_CONFIG.useGameBgs,
    useGame,
    useAllowType,
    useBingBgs: typeof useBingBgsRaw === 'boolean' ? useBingBgsRaw : DEFAULT_BACKGROUND_CONFIG.useBingBgs,
    useNormalBgs: typeof useNormalBgsRaw === 'boolean' ? useNormalBgsRaw : DEFAULT_BACKGROUND_CONFIG.useNormalBgs,
    bingResolution: isBingResolution(bingResolutionRaw) ? bingResolutionRaw : DEFAULT_BACKGROUND_CONFIG.bingResolution,
  };
}

export function useWallpapersQuery() {
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig | null>(null);
  const queryClient = useQueryClient();
  const gameQueryKey = useMemo(
    () => ['wallpaper', 'game', backgroundConfig?.useGame] as const,
    [backgroundConfig?.useGame],
  );

  useEffect(() => {
    const syncConfig = async () => {
      try {
        setBackgroundConfig(await loadBackgroundConfig());
      } catch (error) {
        console.error('Failed to load background config:', error);
      }
    };

    syncConfig();

    const handler = (name: string) => {
      if (name.startsWith('display.background.')) {
        syncConfig();
        queryClient.invalidateQueries({ queryKey: ['wallpaper'] });
      }
    };

    window.ipc?.on('sync-config', handler);
    return () => {
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, [queryClient]);

  const configLoaded = !!backgroundConfig;

  const bingQuery = useQuery<WallpaperItem | null>({
    queryKey: BING_QUERY_KEY,
    queryFn: () => fetchBingBackground(backgroundConfig.bingResolution),
    enabled: configLoaded && backgroundConfig.useBingBgs,
    placeholderData: prev => prev,
    staleTime: Infinity,
  });

  const gameQuery = useQuery<WallpaperItem | null>({
    queryKey: gameQueryKey,
    queryFn: () => fetchGameBackground(backgroundConfig.useGame, backgroundConfig.useAllowType),
    enabled: configLoaded && backgroundConfig.useGameBgs && !!backgroundConfig.useGame,
    placeholderData: prev => prev,
    staleTime: 4 * HOUR,
    refetchInterval: 4 * HOUR,
    refetchIntervalInBackground: true,
  });

  const normalQuery = useQuery<WallpaperItem[]>({
    queryKey: NORMAL_QUERY_KEY,
    queryFn: fetchDefaultWallpapersFromDns,
    enabled: configLoaded && backgroundConfig.useNormalBgs,
    placeholderData: prev => prev,
    staleTime: 30 * MINUTE,
    refetchInterval: 30 * MINUTE,
    refetchIntervalInBackground: true,
  });

  // 定时刷新 Bing
  useEffect(() => {
    if (!bingQuery.dataUpdatedAt) return;

    const delay = msUntilNextDay(bingQuery.dataUpdatedAt);
    const id = window.setTimeout(() => {
      if (isNextDay(bingQuery.dataUpdatedAt)) {
        queryClient.invalidateQueries({ queryKey: BING_QUERY_KEY });
      }
    }, delay);

    return () => clearTimeout(id);
  }, [bingQuery.dataUpdatedAt, queryClient]);

  // 只显示启用的 query 数据
  const wallpapers = useMemo(() => {
    const arr: WallpaperItem[] = [];
    if (configLoaded) {
      if (backgroundConfig!.useGameBgs && gameQuery.data) arr.push(gameQuery.data);
      if (backgroundConfig!.useBingBgs && bingQuery.data) arr.push(bingQuery.data);
      if (backgroundConfig!.useNormalBgs && normalQuery.data) arr.push(...normalQuery.data);
    }
    return arr;
  }, [
    configLoaded,
    backgroundConfig?.useGameBgs,
    backgroundConfig?.useBingBgs,
    backgroundConfig?.useNormalBgs,
    gameQuery.data,
    bingQuery.data,
    normalQuery.data,
  ]);

  const wallpapersLoading =
    (backgroundConfig?.useBingBgs && bingQuery.isPending) ||
    (backgroundConfig?.useGameBgs && !!backgroundConfig.useGame && gameQuery.isPending) ||
    (backgroundConfig?.useNormalBgs && normalQuery.isPending);

  return { wallpapers, wallpapersLoading };
}

export function isBingResolution(value: string): value is BingResolution {
  return (BING_RESOLUTION_OPTIONS as readonly string[]).includes(value);
}

export function normalizeWallpapers(rawList: unknown[]): WallpaperItem[] {
  return rawList
    .map(data => {
      if (data && typeof data === 'object') {
        const typed = data as WallpaperItem;
        if (
          (typed.type === 'image' || typed.type === 'video' || typed.type === 'mixed') &&
          (typed.video_url || typed.image_url)
        ) {
          return typed;
        }
      }

      if (typeof data === 'string' && data.trim()) {
        return { type: 'image', image_url: data };
      }
      return null;
    })
    .filter((item): item is WallpaperItem => item !== null);
}

export async function fetchGameBackground(gameId: string, allowType: string): Promise<WallpaperItem | null> {
  if (!gameId) return null;
  try {
    const res = await fetch(
      `https://hyp-api.mihoyo.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=jGHBHlcOq1&game_id=${gameId}`,
      { referrerPolicy: 'no-referrer' },
    );
    const data = await res.json();
    const info = data?.data?.game_info_list?.[0];
    const bg = info?.backgrounds?.[0];
    if (!bg) return null;

    const out: WallpaperItem = { type: 'image' };
    if (bg.video?.url) {
      out.video_url = bg.video.url;
      if (allowType === 'video-image') {
        out.type = 'video';
      } else if (allowType !== 'image-only') {
        out.type = 'mixed';
      }
    }
    if (bg.background?.url) {
      out.image_url = bg.background.url;
    }
    if (!out.video_url && !out.image_url) return null;
    return out;
  } catch (error) {
    console.error('Failed to fetch game backgrounds:', error);
    return null;
  }
}

export async function fetchBingBackground(resolution: BingResolution): Promise<WallpaperItem | null> {
  try {
    const res = await fetch('https://www.bing.com/HPImageArchive.aspx?idx=0&n=1&format=js&mkt=zh-cn', {
      // cache: 'no-store',
      referrerPolicy: 'no-referrer',
    });
    if (!res.ok) return null;

    const json = await res.json();
    const urlbase = json?.images?.[0]?.urlbase;
    if (!urlbase) return null;

    return {
      type: 'image',
      image_url: `https://www.bing.com${urlbase}_${resolution}.jpg`,
    };
  } catch (error) {
    console.error('Failed to fetch Bing background:', error);
    return null;
  }
}

async function tryDoH(url: string, headers?: Record<string, string>): Promise<string[] | null> {
  try {
    const res = await fetch(url, { headers: headers || {}, cache: 'no-store' });
    if (!res.ok) return null;

    const json = await res.json();
    if (json && Array.isArray(json.Answer) && json.Answer.length > 0) {
      return json.Answer.map((a: any) => {
        const data = typeof a?.data === 'string' ? a.data : '';
        return data.replace(/"| /g, '');
      }).filter(Boolean);
    }
    if (json && typeof json.Answer === 'string') {
      return [json.Answer.replace(/"| /g, '')];
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchDefaultWallpapersFromDns(): Promise<WallpaperItem[]> {
  const domain = 'default-bgs.class-tools.app.lukas1.eu.org';
  let base64String = '';

  if (!base64String) {
    const ans = await tryDoH(`https://dns.alidns.com/resolve?name=${encodeURIComponent(domain)}&type=TXT`);
    if (ans?.length) base64String = ans[0].replace(/^"|"$/g, '');
  }

  if (!base64String) {
    const ans = await tryDoH(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`, {
      Accept: 'application/dns-json',
    });
    if (ans?.length) base64String = ans[0].replace(/"| /g, '');
  }

  if (!base64String) {
    try {
      const txtRecords: string[][] = await window.ipc?.invoke('resolveDns', domain, 'TXT');
      base64String = Array.isArray(txtRecords) ? txtRecords[0].join('') : '';
    } catch (error) {
      console.error('ipc resolveDns fallback failed', error);
    }
  }

  if (!base64String) return [];

  try {
    const decoded = atob(base64String);
    const rawList = JSON.parse(decoded);
    if (!Array.isArray(rawList)) return [];
    return normalizeWallpapers(rawList);
  } catch (error) {
    console.error('Failed to decode/parse wallpaper TXT record payload:', error);
    return [];
  }
}
