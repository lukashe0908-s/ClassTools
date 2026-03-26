'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme } from 'next-themes';
import { getConfigSync } from '@renderer/features/ipc/config';

type AppTheme = 'system' | 'light' | 'dark';

function normalizeTheme(value: unknown): AppTheme | null {
  if (value === 'system' || value === 'light' || value === 'dark') return value;
  return null;
}

function ThemeConfigSync() {
  const { setTheme } = useTheme();

  useEffect(() => {
    let active = true;

    const syncTheme = async () => {
      const raw = await getConfigSync('display.theme');
      const nextTheme = normalizeTheme(raw) ?? 'system';
      if (!active) return;
      setTheme(nextTheme);
    };

    syncTheme();
    const handler = (name: string) => {
      if (name === 'display.theme') {
        syncTheme();
      }
    };
    window.ipc?.on('sync-config', handler);

    return () => {
      active = false;
      window.ipc?.removeListener?.('sync-config', handler);
    };
  }, [setTheme]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute='class' defaultTheme='system'>
      <ThemeConfigSync />
      {children}
    </NextThemesProvider>
  );
}
