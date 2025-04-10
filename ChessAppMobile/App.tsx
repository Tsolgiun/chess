import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { NewGameProvider } from './src/context/NewGameContext';
import AppNavigator from './src/navigation/AppNavigator';
import { socketManager } from './src/utils/network/SocketManager';

export default function App() {
  // Initialize socket connection on app start
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        await socketManager.connect();
        console.log('Socket connection initialized');
      } catch (error) {
        console.error('Failed to initialize socket connection:', error);
      }
    };
    
    initializeSocket();
    
    // Clean up socket connection on app unmount
    return () => {
      socketManager.disconnect();
    };
  }, []);
  
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <NewGameProvider>
          <AppNavigator />
        </NewGameProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
