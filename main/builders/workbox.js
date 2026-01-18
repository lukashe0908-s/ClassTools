// File to generate the service worker.
require('dotenv').config();
const workboxBuild = require('workbox-build');
const path = require('path');
const fs = require('fs-extra');
const { NODE_ENV } = process.env;

// https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW
const buildSW = () => {
  return workboxBuild.generateSW({
    swDest: 'renderer/public/workbox-sw.js',
    clientsClaim: true,
    mode: NODE_ENV,
    skipWaiting: true,
    sourcemap: false,
    runtimeCaching: [
      // Next.js Chunks
      {
        urlPattern: /^\/_next\/static\/.+$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'next-static',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      // Static Files
      {
        urlPattern: /^\/static\/.*/,
        handler: 'CacheFirst',
        options: {
          cacheName: 'public-static',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 14 * 24 * 60 * 60,
          },
        },
      },
      // Next.js Pages
      {
        urlPattern: ({ request }) => request.destination === 'document' || request.url.includes('/_next/data/'),
        handler: 'NetworkFirst',
        options: {
          cacheName: 'next-pages',
          networkTimeoutSeconds: 3,
        },
      },
    ],
  });
};

buildSW();

// Add Build Time
(async () => {
  const dirPath = path.resolve(process.cwd(), 'renderer/public/buildArtifacts');
  if (!fs.pathExistsSync(dirPath)) {
    fs.mkdirsSync(dirPath);
  }
  fs.writeFileSync(path.resolve(dirPath, 'UIVersion'), Date.now().toString());
})();
