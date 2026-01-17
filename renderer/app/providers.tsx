'use client';

import { HeroUIProvider } from '@heroui/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeroUIProvider className='h-full'>
      <NextThemesProvider attribute='class' defaultTheme='system'>
        {children}
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
