import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// For web platform, we'll use the web-specific entry point
// This helps avoid MIME type issues and other web-specific problems
if (Platform.OS === 'web') {
  // Web-specific setup will be handled in web.index.js
  require('./web.index.js');
} else {
  // For native platforms, use the standard entry point
  // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
  // It also ensures that whether you load the app in Expo Go or in a native build,
  // the environment is set up appropriately
  registerRootComponent(App);
}
