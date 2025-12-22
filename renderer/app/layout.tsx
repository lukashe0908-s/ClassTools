'use client';
import { useEffect, useState } from 'react';
import '../styles/globals.css';
import { HeroUIProvider } from '@heroui/react';
import { LicenseInfo, muiXTelemetrySettings } from '@mui/x-license';
import { Snackbar, Fade } from '@mui/material';
import { createRoot } from 'react-dom/client';
import 'overlayscrollbars/overlayscrollbars.css';
import * as Sentry from '@sentry/electron/renderer';

muiXTelemetrySettings.disableTelemetry();
LicenseInfo.setLicenseKey(
  'a6cd63f803393a33165ef9d2b180b307Tz0sRT05OTk5OTk5OTk5OTk5OTk5OTk5OSxTPXByZW1pdW0sTE09cGVycGV0dWFsLEtWPTI='
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    Sentry.init({
      // Adds request headers and IP for users, for more info visit:
      // https://docs.sentry.io/platforms/javascript/guides/electron/configuration/options/#sendDefaultPii
      sendDefaultPii: true,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      // Learn more at
      // https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
      tracesSampleRate: 1.0,

      // Capture Replay for 10% of all sessions,
      // plus for 100% of sessions with an error
      // Learn more at
      // https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,

      // Enable logs to be sent to Sentry
      enableLogs: true,
    });
  }, []);

  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    window.alert = function (...args: any[1]) {
      console.log('[Alert]', args[0]);
      function handleClose() {
        container.remove();
      }
      const body = document.body;
      const container = document.createElement('div');
      const root = createRoot(container);
      root.render(
        <Snackbar
          open
          onClose={handleClose}
          message={args[0].toString()}
          autoHideDuration={2000}
          TransitionComponent={Fade}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      );
      body?.appendChild(container);
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
          <HeroUIProvider className={`h-full ${isDark && 'dark'} overflow-auto`}>{children}</HeroUIProvider>
        </body>
      </html>
    </>
  );
}
