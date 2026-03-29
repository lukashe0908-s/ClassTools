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
      try {
        const raw = await getConfigSync('display.theme', null, false);
        const nextTheme = normalizeTheme(raw) ?? 'system';
        if (!active) return;
        setTheme(nextTheme);
      } catch (error) {}
    };

    syncTheme();
    return () => {
      active = false;
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
