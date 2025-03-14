import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents } from '../types/game';

type SocketType = Socket & {
  emit: <T extends keyof ClientToServerEvents>(event: T, ...args: Parameters<ClientToServerEvents[T]>) => void;
  on: <T extends keyof ServerToClientEvents>(event: T, listener: ServerToClientEvents[T]) => void;
};

export type GameSocket = SocketType;

const SOCKET_URL = 'http://localhost:5000';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const socketRef = useRef<GameSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setConnectionStatus('error');
      return;
    }

    // Create new socket connection with improved settings
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    }) as GameSocket;

    socketRef.current = socket;

    // Set up connection event handlers
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const handleDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleConnectError = (error: Error) => {
      console.error('Socket connection error:', error);
      setConnectionStatus('error');
    };

    const handleReconnect = (attemptNumber: number) => {
      console.log(`Socket reconnecting: attempt ${attemptNumber}`);
      setConnectionStatus('connecting');
    };

    const handleReconnectError = (error: Error) => {
      console.error('Socket reconnect error:', error);
    };

    // Add ping/pong for keeping connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 25000);

    socket.on('pong', () => {
      // Connection is alive
      if (connectionStatus !== 'connected') {
        setConnectionStatus('connected');
        setIsConnected(true);
      }
    });

    // Add all event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);

    // If already connected, set state immediately
    if (socket.connected) {
      setIsConnected(true);
      setConnectionStatus('connected');
    }

    // Cleanup function - remove event listeners but don't disconnect
    return () => {
      clearInterval(pingInterval);
      
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('reconnect');
        socket.off('reconnect_error');
        socket.off('pong');
        // Don't disconnect on unmount to maintain connection
      }
    };
  }, []);

  return { 
    socket: socketRef.current, 
    isConnected,
    connectionStatus
  };
};

// Function to disconnect the socket (only use when app is shutting down)
export const disconnectSocket = () => {
  // This function would be called from app shutdown logic
  // For example, in a useEffect cleanup in the main App component
};
