import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';
import App from './App';

// Set up process.browser for react-native-web
if (Platform.OS === 'web') {
  if (typeof process === 'undefined') {
    global.process = {};
  }
  if (typeof process.browser === 'undefined') {
    process.browser = true;
  }
}

// Register the app component
registerRootComponent(App);
