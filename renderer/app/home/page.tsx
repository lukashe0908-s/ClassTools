'use client';
import { useEffect, useState, useRef } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Cog6ToothIcon, ArrowPathIcon, ArrowTopRightOnSquareIcon, XMarkIcon } from '@heroicons/react/24/solid';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import PlayIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from '@mui/icons-material/PauseRounded';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import UpdateModal from './updateModal';
import ClassList from './classList';
import { Weather } from './weather';
import { generateConfig, getConfigSync } from '../../components/p_function';

export default function HomePage() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  useEffect(() => {
    const serviceWorkerScope = `/sw.js`;
    navigator.serviceWorker &&
      location.protocol === 'https:' &&
      navigator.serviceWorker
        .register(serviceWorkerScope)
        .then(() => {
          // console.info(`Service worker registered at ${serviceWorkerScope}`);
        })
        .catch(error => {
          console.error('Error in serviceWorker registration: ', error);
        });
  }, []);
  return (
    <>
      <title>Class Tools</title>
      <Modal isOpen={isOpen} placement={'bottom'} onOpenChange={onOpenChange}>
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>确认关机</ModalHeader>
              <ModalBody>
                <p className='text-neutral-500 text-sm'>关闭所有应用，然后关闭电脑。</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color='default'
                  variant='light'
                  onPress={onClose}
                  className='min-w-1'
                  radius='full'
                  fullWidth={true}>
                  <CloseIcon></CloseIcon>取消
                </Button>
                <Button
                  color='danger'
                  className='min-w-1'
                  radius='full'
                  fullWidth={true}
                  onPress={() => {
                    window.ipc?.send('sys-shutdown');
                  }}>
                  <CheckIcon></CheckIcon>确认
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <FloatWindow onShutdownModalOpen={onOpen}></FloatWindow>
      <UpdateModal></UpdateModal>
    </>
  );
}
function FloatWindow({ onShutdownModalOpen }) {
  const [wallpapers, setWallpapers] = useState([]);
  const [currentWallpaper, setCurrentWallpaper] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const wallpaperListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedIndex = localStorage.getItem('default_wallpaper_select');
    if (savedIndex) {
      setSelectedIndex(parseInt(savedIndex, 10));
    }
  }, []);
  const updateWallpaper = (newWallpaper: string, index: number) => {
    localStorage.setItem('default_wallpaper_select', index.toString());
    setSelectedIndex(index);
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setCurrentWallpaper(newWallpaper ?? '');
      });
    } else {
      setCurrentWallpaper(newWallpaper ?? '');
    }
    // 使用 requestAnimationFrame 确保在 DOM 更新后再滚动
    requestAnimationFrame(() => {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[index] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  };

  useEffect(() => {
    const CACHE_KEY = 'default_wallpaper';
    const EXPIRES_KEY = 'default_wallpaper_expires';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 mins
    const DISABLE_CACHE = false;

    const now = Date.now();
    const cached = localStorage.getItem(CACHE_KEY);
    const expires = parseInt(localStorage.getItem(EXPIRES_KEY) || '0', 10);

    interface WallpaperItem {
      type: 'image' | 'video' | 'mixed';
      video_url?: string;
      image_url?: string;
    }

    (async () => {
      const useGameBgs = await getConfigSync('display.background.useGameBgs');
      const useGame = await getConfigSync('display.background.useGame');
      const useAllowType = await getConfigSync('display.background.useGameBgsAllowType');
      let gameBg_object: any = { type: 'image' };
      // 新逻辑：尝试拉取游戏背景，如果失败则回退为不使用游戏背景（不把 gameBg_object 加到列表前置）
      let useGameBgsEffective = useGameBgs && useGame;
      if (useGameBgs && useGame) {
        try {
          const res = await fetch(
            `https://hyp-api.mihoyo.com/hyp/hyp-connect/api/getAllGameBasicInfo?launcher_id=jGHBHlcOq1&game_id=${useGame}`
          );
          const data = await res.json();
          const info = data?.data?.game_info_list?.[0];
          if (info && info.backgrounds?.length > 0) {
            const bg = info.backgrounds[0];
            if (bg.video?.url) {
              gameBg_object.video_url = bg.video.url;
              if (useAllowType === 'video-image') {
                gameBg_object.type = 'video';
              } else if (useAllowType !== 'image-only') {
                gameBg_object.type = 'mixed';
              }
            }
            if (bg.background?.url) gameBg_object.image_url = bg.background.url;
          }
          // 如果没有拿到有效的 image/video，则认为拉取无效
          if (!gameBg_object.video_url && !gameBg_object.image_url) {
            useGameBgsEffective = false;
          }
        } catch (err) {
          console.error('Failed to fetch game backgrounds, disabling useGameBgs:', err);
          // 拉取失败则不使用游戏背景
          useGameBgsEffective = false;
        }
      }

      // 缓存读取
      if (!DISABLE_CACHE && cached && now < expires) {
        try {
          const cachedData: WallpaperItem[] = JSON.parse(cached);
          let wallpaperList: WallpaperItem[] = useGameBgsEffective ? [gameBg_object, ...cachedData] : cachedData;
          setWallpapers(wallpaperList);
          const savedIndex = parseInt(localStorage.getItem('default_wallpaper_select') || '0', 10);
          const validIndex = savedIndex < wallpaperList.length ? savedIndex : 0;
          updateWallpaper(wallpaperList[validIndex].image_url, validIndex);
        } catch (err) {
          console.error('Failed to parse json for wallpaper:', err);
        }
        return;
      }

      fetchDnsWallpaper(useGameBgsEffective ? [gameBg_object] : []);
    })();

    // 优先使用 dns.pub，再回退到 alidns，再回退到 cloudflare DoH，最后回退到原有的 window.ipc 解析方式
    async function fetchDnsWallpaper(addBefore?: WallpaperItem[]) {
      const domain = 'default-bgs.class-tools.app.lukas1.eu.org';

      // 封装：尝试通过一个 DoH 提供者获取 TXT 记录，返回字符串数组或 null
      async function tryDoH(url: string, headers?: Record<string, string>) {
        try {
          const res = await fetch(url, { headers: headers || {} , cache: 'no-store' });
          if (!res.ok) {
            throw new Error(`HTTP ${res.status} from ${url}`);
          }
          const json = await res.json();
          // 常见 JSON 结构：{ Answer: [ { data: "..." }, ... ] }
          if (json && Array.isArray(json.Answer) && json.Answer.length > 0) {
            const joined = json.Answer.map((a: any) => {
              // TXT 记录通常以引号包裹，如: "\"BASE64...\"" 或 "BASE64..."
              let d = a.data;
              if (typeof d === 'string') {
                // 移除外层引号
                d = d.replace(/^"|"$/g, '');
              }
              return d;
            });
            return joined;
          }
          // 某些服务可能返回 { Answer: "..." } 或其他形式，尝试宽松处理
          if (json && json.Answer && typeof json.Answer === 'string') {
            return [json.Answer.replace(/^"|"$/g, '')];
          }
          return null;
        } catch (err) {
          console.warn('tryDoH failed for', url, err);
          return null;
        }
      }

      let base64String = '';

      // 1) dns.pub
      try {
        const url = `https://dns.pub/resolve?name=${encodeURIComponent(domain)}&type=TXT`;
        const ans = await tryDoH(url);
        if (ans && ans.length > 0) {
          base64String = ans[0].replace(/^"|"$/g, '');
        }
      } catch (err) {
        console.warn('dns.pub attempt failed', err);
      }

      // 2) alidns
      if (!base64String) {
        try {
          const url = `https://dns.alidns.com/resolve?name=${encodeURIComponent(domain)}&type=TXT`;
          const ans = await tryDoH(url);
          if (ans && ans.length > 0) {
            base64String = ans[0].replace(/^"|"$/g, '');
          }
        } catch (err) {
          console.warn('alidns attempt failed', err);
        }
      }

      // 3) cloudflare DoH (application/dns-json)
      if (!base64String) {
        try {
          const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=TXT`;
          const ans = await tryDoH(url, { Accept: 'application/dns-json' });
          if (ans && ans.length > 0) {
            base64String = ans[0].replace(/^"|"$/g, '');
          }
        } catch (err) {
          console.warn('cloudflare doh attempt failed', err);
        }
      }

      // 4) 最后回退到 window.ipc 原有解析方式
      if (!base64String) {
        try {
          const txtRecords: string[][] = await window.ipc?.invoke('resolveDns', domain, 'TXT');
          base64String = Array.isArray(txtRecords) ? txtRecords[0].join('') : '';
        } catch (err) {
          console.error('ipc resolveDns fallback failed', err);
        }
      }

      if (!base64String) {
        console.error('No valid TXT record found from any DNS provider');
        return;
      }

      try {
        const decodedUrls_json = atob(base64String);
        const rawList = JSON.parse(decodedUrls_json);

        // 清洗列表，兼容旧列表格式
        const normalizedList = rawList.map((data: string | any) => {
          if (typeof data === 'object') {
            if (
              (data.type === 'image' || data.type === 'video' || data.type === 'mixed') &&
              (data.video_url || data.image_url)
            ) {
              return data;
            }
          }
          return { type: 'image', image_url: data };
        });

        localStorage.setItem(CACHE_KEY, JSON.stringify(normalizedList));
        localStorage.setItem(EXPIRES_KEY, (now + CACHE_DURATION).toString());

        let wallpaperList: WallpaperItem[] = [...(addBefore || []), ...normalizedList];

        setWallpapers(wallpaperList);
        const savedIndex = parseInt(localStorage.getItem('default_wallpaper_select') || '0', 10);
        const validIndex = savedIndex < wallpaperList.length ? savedIndex : 0;
        updateWallpaper(wallpaperList[validIndex].image_url, validIndex);
      } catch (err) {
        console.error('Failed to decode/parse wallpaper TXT record payload:', err);
      }
    }
  }, []);

  const [classSchedule, setClassSchedule] = useState(null);
  const [slidingPosition, setSlidingPosition] = useState('center');
  const [progressDisplay, setProgressDisplay] = useState('always');
  const [hiddenCloseWindow, setHiddenCloseWindow] = useState(false);
  const [hiddenRefreshWindow, setHiddenRefreshWindow] = useState(false);
  const [hiddenJumpto, setHiddenJumpto] = useState(false);
  const [playingMixed, setPlayingMixed] = useState(true);

  // 处理初始滚动到选中的壁纸
  useEffect(() => {
    if (wallpapers.length > 0) {
      const container = wallpaperListRef.current;
      if (container) {
        const imageElement = container.children[selectedIndex] as HTMLElement;
        if (imageElement) {
          imageElement.scrollIntoView({ behavior: 'instant', block: 'center' });
          // setTimeout(() => {
          //   document.getElementById('mainContentHeadPosition').scrollIntoView({ behavior: 'smooth', block: 'start' });
          // }, 100);
        }
      }
    }
  }, [wallpapers]);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await generateConfig();
      const pos = ((await getConfigSync('display.slidingPosition')) as any) || 'center';
      const prog = ((await getConfigSync('display.progressDisplay')) as any) || 'always';
      const hiddenClose = ((await getConfigSync('display.hidden.closeWindow')) as any) || false;
      const hiddenRefresh = ((await getConfigSync('display.hidden.refreshWindow')) as any) || false;
      const hiddenJump = ((await getConfigSync('display.hidden.jumpto')) as any) || false;

      setClassSchedule(config);
      setSlidingPosition(pos);
      setProgressDisplay(prog);
      setHiddenCloseWindow(hiddenClose);
      setHiddenRefreshWindow(hiddenRefresh);
      setHiddenJumpto(hiddenJump);
    };

    loadConfig();

    const handler = () => {
      loadConfig();
    };

    window.ipc?.on('sync-config', handler);

    return () => {
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, []);

  return (
    <div className={`flex flex-col gap-0 p-0 h-full ${currentWallpaper ? '' : 'bg-neutral-100/80 dark:bg-neutral-800/80'}`}>
      {/* Toolbar */}
      <div className='flex gap-2 items-center bg-white/40 dark:bg-black/20 p-2 rounded-lg'>
        <Button
          isIconOnly
          onPress={() => {
            try {
              window.ipc?.send('settings-window');
            } catch {
              window.location.href = '/settings';
            }
          }}
          title='设置'
          aria-label='Settings'>
          <Cog6ToothIcon className='w-5 h-5' />
        </Button>
        {!hiddenRefreshWindow && (
          <Button
            isIconOnly
            onPress={() => {
              window.location.reload();
            }}
            title='刷新'
            aria-label='Refresh'>
            <ArrowPathIcon className='w-5 h-5' />
          </Button>
        )}
        {!hiddenJumpto && (
          <Button
            isIconOnly
            onPress={() => {
              window.location.href = '/float/index.html';
            }}
            title='跳转'
            aria-label='JumpTo'>
            <ArrowTopRightOnSquareIcon className='w-5 h-5' />
          </Button>
        )}
        {!hiddenCloseWindow && (
          <Button
            isIconOnly
            variant='faded'
            onPress={() => {
              window.ipc?.send('close-window');
            }}
            title='关闭'
            aria-label='Close'
            className='ml-auto'>
            <XMarkIcon className='w-5 h-5' />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className='flex flex-col gap-4 py-2 grow overflow-y-auto scrollbar-hide'>
        <div id='mainContentHeadPosition'></div>
        <ClassList
          schedule={classSchedule}
          slidingPosition={slidingPosition}
          progressDisplay={progressDisplay}></ClassList>
        {/* Background Picture List */}
        <div className='flex justify-center px-2'>
          <div
            ref={wallpaperListRef}
            className='flex flex-col gap-4 overflow-auto max-h-[40vh] aspect-video scrollbar-hide rounded-lg shadow-md snap-y snap-proximity'>
            {wallpapers.map((wallpaper, index) => {
              const { type, image_url, video_url } = wallpaper;
              const key = `wallpaper-${index}`;
              const handleClick = () => updateWallpaper(image_url, index);

              // mixed 模式的特殊处理
              if (type === 'mixed') {
                return (
                  <div
                    key={key}
                    className='relative max-w-full aspect-video rounded-lg snap-center select-none object-contain'
                    onClick={handleClick}>
                    {playingMixed ? (
                      <video
                        src={video_url}
                        className='w-full h-full rounded-lg object-contain'
                        muted
                        loop
                        autoPlay
                        playsInline
                      />
                    ) : (
                      <img
                        src={image_url}
                        alt={`Wallpaper ${index}`}
                        className='w-full h-full rounded-lg object-contain'
                        draggable='false'
                        referrerPolicy='no-referrer'
                      />
                    )}

                    <button
                      onClick={() => {
                        setPlayingMixed(!playingMixed);
                      }}
                      className='absolute bottom-1 left-1 bg-black/30 text-white/60 text-sm p-1 rounded-full hover:bg-black/40 hover:text-white/80 transition-colors'>
                      {playingMixed ? <PauseIcon></PauseIcon> : <PlayIcon></PlayIcon>}
                    </button>
                  </div>
                );
              }

              if (type === 'video') {
                return (
                  <video
                    key={key}
                    src={video_url}
                    className='max-w-full aspect-video rounded-lg snap-center select-none object-contain'
                    onClick={handleClick}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                );
              }

              return (
                <img
                  key={key}
                  src={image_url ?? ''}
                  alt={`Wallpaper ${index}`}
                  className='max-w-full aspect-video rounded-lg snap-center select-none object-contain'
                  onClick={handleClick}
                  draggable='true'
                  referrerPolicy='no-referrer'
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className='flex gap-1 items-center bg-white/40 dark:bg-black/10 p-1 rounded-lg'>
        <Button className='font-bold' fullWidth onPress={onShutdownModalOpen}>
          关机
        </Button>
        <Weather />
      </div>
      {/* Background */}
      <div className='absolute top-0 z-[-1] w-full h-full'>
        <img
          style={{
            zIndex: -1,
            top: 0,
            left: '50%',
            position: 'absolute',
            objectFit: 'cover',
            minWidth: '100%',
            width: 'auto',
            height: '100%',
            transform: 'translate(-50%, 0)',
            opacity: 0.5,
            // filter: 'blur(30px)',
            userSelect: 'none',
          }}
          className='Experimental-blur-filter'
          referrerPolicy='no-referrer'
          draggable='false'
          src={currentWallpaper || null}
        />
      </div>
    </div>
  );
}
