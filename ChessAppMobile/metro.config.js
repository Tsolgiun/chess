const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for image formats and ensure they're properly handled
config.resolver.assetExts.push(
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg',
  'webp'
);

// Ensure proper asset resolution for web platform
config.resolver.platforms = ['ios', 'android', 'web'];

// Add support for web-specific file extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json', 'web.js', 'web.jsx', 'web.ts', 'web.tsx'];

// Configure the Metro bundler for proper web support
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Ensure proper MIME types for web bundles
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Ensure JavaScript bundles have the correct MIME type
      if (req.url.endsWith('.bundle')) {
        res.setHeader('Content-Type', 'application/javascript');
      }
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
