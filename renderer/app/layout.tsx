'use client';
import { useEffect } from 'react';
import '../styles/globals.css';
import { HeroUIProvider } from '@heroui/react';
import { LicenseInfo, muiXTelemetrySettings } from '@mui/x-license';
import { Snackbar, Fade } from '@mui/material';
import { createRoot } from 'react-dom/client';
import 'overlayscrollbars/overlayscrollbars.css';

muiXTelemetrySettings.disableTelemetry();
LicenseInfo.setLicenseKey(
  'a6cd63f803393a33165ef9d2b180b307Tz0sRT05OTk5OTk5OTk5OTk5OTk5OTk5OSxTPXByZW1pdW0sTE09cGVycGV0dWFsLEtWPTI='
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // useEffect(() => {
  //   const serviceWorkerScope = `/sw.js`;
  //   navigator.serviceWorker &&
  //     location.protocol === 'https:' &&
  //     navigator.serviceWorker
  //       .register(serviceWorkerScope)
  //       .then(() => {
  //         // console.info(`Service worker registered at ${serviceWorkerScope}`);
  //       })
  //       .catch(error => {
  //         console.error('Error in serviceWorker registration: ', error);
  //       });
  // },[]);
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
  return (
    <>
      <html lang='en' className='h-full overflow-hidden'>
        <head>
          <title>Class Tools</title>
          <meta charSet='UTF-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        </head>
        <body className='h-full !scrollbar-hide'>
          <HeroUIProvider className='h-full !scrollbar-hide'>{children}</HeroUIProvider>
        </body>
      </html>
    </>
  );
}
