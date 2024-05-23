'use client';
import { useEffect } from 'react';
import '../styles/globals.css';
import { NextUIProvider } from '@nextui-org/react';
import { LicenseInfo } from '@mui/x-license-pro';
import { Snackbar, Fade } from '@mui/material';
import { createRoot } from 'react-dom/client';

LicenseInfo.setLicenseKey('a6cd63f803393a33165ef9d2b180b307Tz0sRT05OTk5OTk5OTk5OTk5OTk5OTk5OSxTPXByZW1pdW0sTE09cGVycGV0dWFsLEtWPTI=');

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
  });
  useEffect(() => {
    window.alert = function (...args: any[]) {
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
          message={args}
          autoHideDuration={3000}
          TransitionComponent={Fade}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      );
      body?.appendChild(container);
      return true;
    };
  }, []);
  return (
    <>
      <html lang='en'>
        <head>
          <title>Desktop Tool</title>
          <meta charSet='UTF-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        </head>
        <body>
          <NextUIProvider className='h-full'>{children}</NextUIProvider>
        </body>
      </html>
    </>
  );
}
