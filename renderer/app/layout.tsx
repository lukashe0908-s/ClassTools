'use client';
import { useEffect, useState } from 'react';
import '@renderer/styles/globals.css';
import { HeroUIProvider, addToast } from '@heroui/react';
import { ToastProvider } from '@heroui/toast';
import 'overlayscrollbars/overlayscrollbars.css';
import * as Sentry from '@sentry/electron/renderer';
import * as SentryReact from '@sentry/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let sentryConfig = {
      dsn: 'https://6dca168d15f311911a41313d88e9ecd7@o4509214755782657.ingest.us.sentry.io/4510573802291200',
      sendDefaultPii: true,
      integrations: [],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      enableLogs: true,
    };
    if (window.ipc) {
      sentryConfig.integrations = [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ];
      Sentry.init(sentryConfig);
    } else {
      sentryConfig.integrations = [
        SentryReact.browserTracingIntegration(),
        SentryReact.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ];
      SentryReact.init(sentryConfig);
    }
  }, []);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    window.alert = function (...args: any[1]) {
      console.log('[Alert]', args[0]);
      addToast({
        hideIcon: false,
        color: 'primary',
        description: args[0],
        classNames: {
          description: 'whitespace-pre-wrap',
        },
      });
      return true;
    };
  }, []);
  useEffect(() => {
    const handleDragStart = event => {
      event.preventDefault();
    };
    document.body.addEventListener('drop', handleDragStart);
    return () => {
      document.body.removeEventListener('drop', handleDragStart);
    };
  }, []);
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(media.matches);
    const listener = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);
  return (
    <>
      <html lang='en' className='h-full overflow-hidden'>
        <head>
          <title>Class Tools</title>
          <meta charSet='UTF-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        </head>
        <body className='h-full'>
          <ToastProvider />
          <HeroUIProvider className={`h-full ${isDark && 'dark'} overflow-auto`}>{children}</HeroUIProvider>
        </body>
      </html>
    </>
  );
}
