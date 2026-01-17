// File to generate the service worker.
require('dotenv').config();
const workboxBuild = require('workbox-build');
const path = require('path');
const fs = require('fs-extra');
const { NODE_ENV } = process.env;
const urlPattern = new RegExp(`/.*`);

// https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.generateSW
const buildSW = () => {
  return workboxBuild.generateSW({
    swDest: 'renderer/public/workbox-sw.js',
    clientsClaim: true,
    mode: NODE_ENV,
    skipWaiting: true,
    sourcemap: false,
    runtimeCaching: [
      {
        urlPattern: new RegExp(String.raw`/(static)/.*`),
        handler: 'CacheFirst',
        options: {
          cacheName: 'class-tools',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          },
        },
      },
      {
        urlPattern: urlPattern,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'class-tools',
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          },
        },
      },
    ],
  });
};

buildSW();

// Add Web Build Time
fs.writeFile(path.resolve(process.cwd(), 'renderer/public/buildArtifacts/UIVersion'), Date.now().toString());
