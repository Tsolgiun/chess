// This is a custom webpack configuration for Expo web
// It's designed to work with Expo 52+ without requiring @expo/webpack-config
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
  // Use development mode for better debugging
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Entry point for the application
  entry: {
    app: path.resolve(__dirname, 'index.web.js'),
  },
  
  // Set the target environment
  target: 'web',
  
  // Output configuration
  output: {
    path: path.resolve(__dirname, 'web-build'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  
  // Enable source maps for debugging
  devtool: 'source-map',
  
  // Module resolution configuration
  resolve: {
    extensions: [
      '.web.js', '.web.jsx', '.web.ts', '.web.tsx',
      '.js', '.jsx', '.ts', '.tsx', '.json'
    ],
    alias: {
      'react-native$': 'react-native-web',
      '@components': path.resolve(__dirname, 'src/components'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@navigation': path.resolve(__dirname, 'src/navigation'),
    },
    // Handle ECMAScript module resolution issues
    fallback: {
      'react-native': 'react-native-web',
    },
    // Allow importing without file extensions
    extensionAlias: {
      '.js': ['.js', '.ts', '.tsx'],
      '.jsx': ['.jsx', '.tsx'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  
  // Module loaders
  module: {
    rules: [
      // JavaScript/TypeScript files
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules\/(?!(@react-navigation|@react-native-async-storage|react-native-reanimated|react-native-screens|react-native-safe-area-context|react-native-gesture-handler)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
            plugins: [
              ['@babel/plugin-transform-runtime', { regenerator: true }],
              'react-native-reanimated/plugin',
            ],
          },
        },
      },
      // Handle node_modules packages that use ECMAScript modules
      {
        test: /\.js$/,
        include: [
          /node_modules\/@react-navigation/,
          /node_modules\/@react-native-async-storage/,
          /node_modules\/react-native-reanimated/,
          /node_modules\/react-native-screens/,
          /node_modules\/react-native-safe-area-context/,
          /node_modules\/react-native-gesture-handler/,
        ],
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: [
              ['@babel/plugin-transform-runtime', { regenerator: true }],
            ],
          },
        },
      },
      // Image files
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/images',
              publicPath: '/assets/images',
              esModule: false, // This is important for React Native's require() syntax
            },
          },
        ],
      },
      // Font files
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'assets/fonts',
            },
          },
        ],
      },
    ],
  },
  
  // Development server configuration
  devServer: {
    static: {
      directory: path.join(__dirname, 'web'),
      publicPath: '/',
      // Set MIME types for all assets
      serveIndex: true,
      watch: true,
    },
    compress: true,
    port: 19006,
    historyApiFallback: true,
    hot: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    // Set MIME types for specific file extensions
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.get('*.bundle', (req, res, next) => {
        res.set('Content-Type', 'application/javascript');
        next();
      });

      devServer.app.get('*.js', (req, res, next) => {
        res.set('Content-Type', 'application/javascript');
        next();
      });

      devServer.app.get('*.png', (req, res, next) => {
        res.set('Content-Type', 'image/png');
        next();
      });

      devServer.app.get('*.jpg', (req, res, next) => {
        res.set('Content-Type', 'image/jpeg');
        next();
      });

      return middlewares;
    },
  },
  
  // Plugins
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'web/index.html'),
      filename: 'index.html',
      inject: 'body',
    }),
    // Handle ECMAScript module resolution issues
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    // Define environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      __DEV__: process.env.NODE_ENV !== 'production' || true,
    }),
    // Fix module resolution issues
    new webpack.NormalModuleReplacementPlugin(
      /node_modules\/@react-navigation\/.*\/node_modules\/react-native-reanimated\//,
      (resource) => {
        resource.request = resource.request.replace(/\.js$/, '');
      }
    ),
  ],
};
