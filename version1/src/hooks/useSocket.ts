import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, Move } from '../types/game';

type SocketType = Socket & {
  emit: <T extends keyof ClientToServerEvents>(event: T, ...args: Parameters<ClientToServerEvents[T]>) => void;
  on: <T extends keyof ServerToClientEvents>(event: T, listener: ServerToClientEvents[T]) => void;
};

export type GameSocket = SocketType;

const SOCKET_URL = 'http://localhost:5000';
const PING_INTERVAL = 25000; // 25 seconds
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 5000;
const CONNECTION_TIMEOUT = 20000;

interface QueuedMove {
  gameId: string;
  move: Move;
  timestamp: Date;
  retries: number;
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [lastPingTime, setLastPingTime] = useState<number>(Date.now());
  const [latency, setLatency] = useState<number | null>(null);
  const [lastConnectedRoom, setLastConnectedRoom] = useState<string | null>(null);
  
  const socketRef = useRef<GameSocket | null>(null);
  const moveQueueRef = useRef<QueuedMove[]>([]);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Join a game room and track it for reconnection
  const joinRoom = useCallback((roomId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-game', roomId);
      setLastConnectedRoom(roomId);
    }
  }, []);

  // Add a move to the queue
  const queueMove = useCallback((gameId: string, move: Move) => {
    const queuedMove: QueuedMove = {
      gameId,
      move,
      timestamp: new Date(),
      retries: 0
    };
    moveQueueRef.current.push(queuedMove);
    
    // Track the room for reconnection
    setLastConnectedRoom(gameId);
    
    // If connected, try to send immediately
    if (socketRef.current?.connected) {
      processQueue();
    }
  }, []);

  // Process the move queue
  const processQueue = useCallback(() => {
    if (!socketRef.current?.connected || moveQueueRef.current.length === 0) return;
    
    // Process all moves in the queue
    const currentQueue = [...moveQueueRef.current];
    moveQueueRef.current = [];
    
    currentQueue.forEach(queuedMove => {
      try {
        socketRef.current?.emit('move', { 
          gameId: queuedMove.gameId, 
          move: queuedMove.move 
        });
        console.log(`Sent queued move: ${JSON.stringify(queuedMove.move)}`);
      } catch (error) {
        console.error('Error sending queued move:', error);
        // If failed, put back in queue with increased retry count
        if (queuedMove.retries < 3) {
          moveQueueRef.current.push({
            ...queuedMove,
            retries: queuedMove.retries + 1
          });
        }
      }
    });
  }, []);

  // Send a ping to the server
  const sendPing = useCallback(() => {
    if (socketRef.current?.connected) {
      const pingTime = Date.now();
      setLastPingTime(pingTime);
      socketRef.current.emit('ping');
      
      // Set a timeout to detect ping failures
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }
      
      pingTimeoutRef.current = setTimeout(() => {
        // If we haven't received a pong in 5 seconds, consider connection unstable
        if (Date.now() - lastPingTime > 5000) {
          setConnectionStatus('disconnected');
        }
      }, 5000);
    }
  }, [lastPingTime]);

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
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionDelayMax: MAX_RECONNECT_DELAY,
      timeout: CONNECTION_TIMEOUT
    }) as GameSocket;

    socketRef.current = socket;

    // Set up connection event handlers
    const handleConnect = () => {
      console.log('Socket connected');
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Rejoin last room if we were in one
      if (lastConnectedRoom) {
        console.log(`Rejoining room after connection: ${lastConnectedRoom}`);
        socket.emit('join-game', lastConnectedRoom);
      }
      
      // Process any queued moves
      processQueue();
    };

    const handleDisconnect = (reason: string) => {
      console.log(`Socket disconnected: ${reason}`);
      setIsConnected(false);
      setConnectionStatus('disconnected');
      
      // Clear ping interval on disconnect
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
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

    // Handle pong response
    const handlePong = () => {
      // Calculate latency
      const pongTime = Date.now();
      const currentLatency = pongTime - lastPingTime;
      setLatency(currentLatency);
      
      // Connection is alive
      if (connectionStatus !== 'connected') {
        setConnectionStatus('connected');
        setIsConnected(true);
      }
      
      // Clear ping timeout
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
        pingTimeoutRef.current = null;
      }
    };

    // Set up ping interval
    pingIntervalRef.current = setInterval(sendPing, PING_INTERVAL);

    // Add all event listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);
    socket.on('pong', handlePong);

    // If already connected, set state immediately
    if (socket.connected) {
      setIsConnected(true);
      setConnectionStatus('connected');
      // Send initial ping
      sendPing();
    }

    // Cleanup function - remove event listeners but don't disconnect
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }
      
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
  }, [lastPingTime, processQueue, sendPing, lastConnectedRoom]);

  return { 
    socket: socketRef.current, 
    isConnected,
    connectionStatus,
    latency,
    queueMove,
    joinRoom
  };
};

// Function to disconnect the socket (only use when app is shutting down)
export const disconnectSocket = () => {
  // This function would be called from app shutdown logic
  // For example, in a useEffect cleanup in the main App component
};
