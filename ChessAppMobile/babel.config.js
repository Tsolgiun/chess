module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      ['module-resolver', {
        alias: {
          'react-native': 'react-native-web',
          // Add any other aliases you might need
          '@components': './src/components',
          '@screens': './src/screens',
          '@context': './src/context',
          '@utils': './src/utils',
          '@navigation': './src/navigation',
        },
        extensions: ['.web.js', '.web.jsx', '.web.ts', '.web.tsx', '.js', '.jsx', '.ts', '.tsx']
      }]
    ],
  };
};
