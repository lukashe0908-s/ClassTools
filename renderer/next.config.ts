const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  trailingSlash: true,
  distDir: process.env.NODE_ENV === 'production' ? '../build/app' : '.next',
  // outputFileTracing: false,
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!isServer) {
      config.plugins.push(
        new MonacoWebpackPlugin({
          languages: ['javascript', 'typescript'],
          filename: 'static/[name].worker.js',
        })
      );
    }
    // Important: return the modified config
    return config;
  },
};
