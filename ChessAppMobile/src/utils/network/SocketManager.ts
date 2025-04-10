import { Socket, io } from 'socket.io-client';
import { Platform } from 'react-native';

// Define types for socket events
export interface GameCreatedEvent {
  gameId: string;
  color: 'white' | 'black';
}

export interface GameJoinedEvent {
  gameId: string;
  color: 'white' | 'black';
  fen?: string;
  opponentPlatform?: string;
}

export interface OpponentJoinedEvent {
  platform?: string;
}

export interface MoveMadeEvent {
  from: string;
  to: string;
  promotion?: string;
  fen: string;
}

export interface ErrorEvent {
  message: string;
}

export interface GameOverEvent {
  result: string;
}

export interface DrawOfferedEvent {
  from: 'white' | 'black';
}

export interface DrawDeclinedEvent {
  from: 'white' | 'black';
}

export interface MessageEvent {
  sender: 'white' | 'black';
  text: string;
}

export interface AIMoveCalculatedEvent {
  move: string;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

// Define the event handlers interface
export interface SocketEventHandlers {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onConnectError?: (error: Error) => void;
  onGameCreated?: (data: GameCreatedEvent) => void;
  onGameJoined?: (data: GameJoinedEvent) => void;
  onOpponentJoined?: (data: OpponentJoinedEvent) => void;
  onMoveMade?: (data: MoveMadeEvent) => void;
  onError?: (data: ErrorEvent) => void;
  onGameOver?: (data: GameOverEvent) => void;
  onDrawOffered?: (data: DrawOfferedEvent) => void;
  onDrawDeclined?: (data: DrawDeclinedEvent) => void;
  onOpponentDisconnected?: () => void;
  onAIMoveCalculated?: (data: AIMoveCalculatedEvent) => void;
  onMessage?: (data: MessageEvent) => void;
}

/**
 * SocketManager - Handles socket.io connections with automatic reconnection and fallback URLs
 */
export class SocketManager {
  private socket: Socket | null = null;
  private connectionUrls: string[] = [];
  private currentUrlIndex = 0;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private reconnectDelayMax = 5000;
  private eventHandlers: SocketEventHandlers = {};
  private isConnecting = false;
  private connectionPromise: Promise<Socket> | null = null;
  private platform: 'web' | 'mobile' = Platform.OS === 'web' ? 'web' : 'mobile';

  /**
   * Create a new SocketManager instance
   * @param urls Array of server URLs to try connecting to
   */
  constructor(urls: string[]) {
    if (!urls || urls.length === 0) {
      throw new Error('At least one server URL must be provided');
    }
    this.connectionUrls = urls;
  }

  /**
   * Connect to the socket server
   * @returns Promise that resolves with the socket when connected
   */
  public connect(): Promise<Socket> {
    // If already connecting, return the existing promise
    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    // If already connected, return the socket
    if (this.socket?.connected) {
      return Promise.resolve(this.socket);
    }

    // Start connecting
    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      const tryConnect = () => {
        const url = this.connectionUrls[this.currentUrlIndex];
        console.log(`Attempting to connect to ${url}...`);

        // Close existing socket if any
        if (this.socket) {
          this.socket.close();
          this.socket = null;
        }

        // Create new socket
        this.socket = io(url, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
          reconnectionDelayMax: this.reconnectDelayMax,
          timeout: 20000
        });

        // Set up event handlers
        this.socket.on('connect', () => {
          console.log(`Connected to ${url}`);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          
          // Send platform information
          if (this.socket) {
            this.socket.emit('setPlatform', { platform: this.platform });
          }
          
          if (this.eventHandlers.onConnect) {
            this.eventHandlers.onConnect();
          }
          
          if (this.socket) {
            resolve(this.socket);
          } else {
            reject(new Error('Socket is null after connection'));
          }
        });

        this.socket.on('connect_error', (error) => {
          console.error(`Connection error to ${url}:`, error);
          
          if (this.eventHandlers.onConnectError) {
            this.eventHandlers.onConnectError(error);
          }
          
          this.reconnectAttempts++;
          
          // Try the next URL if we've reached max attempts for this one
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            this.currentUrlIndex = (this.currentUrlIndex + 1) % this.connectionUrls.length;
            this.reconnectAttempts = 0;
            
            // If we've tried all URLs, reject the promise
            if (this.currentUrlIndex === 0) {
              this.isConnecting = false;
              reject(new Error('Failed to connect to any server'));
              return;
            }
            
            // Try the next URL
            setTimeout(tryConnect, this.reconnectDelay);
          }
        });

        this.socket.on('disconnect', (reason) => {
          console.log(`Disconnected: ${reason}`);
          
          if (this.eventHandlers.onDisconnect) {
            this.eventHandlers.onDisconnect(reason);
          }
          
          // If the disconnection was initiated by the server, try to reconnect
          if (reason === 'io server disconnect') {
            this.socket?.connect();
          }
        });

        this.socket.on('reconnect', (attemptNumber) => {
          console.log(`Reconnected after ${attemptNumber} attempts`);
          
          // Re-send platform information after reconnection
          this.socket?.emit('setPlatform', { platform: this.platform });
        });

        // Set up game event handlers
        this.setupGameEventHandlers();
      };

      // Start connection attempt
      tryConnect();
    });

    return this.connectionPromise;
  }

  /**
   * Set up event handlers for game events
   */
  private setupGameEventHandlers(): void {
    if (!this.socket) return;

    // Game events
    this.socket.on('gameCreated', (data: GameCreatedEvent) => {
      if (this.eventHandlers.onGameCreated) {
        this.eventHandlers.onGameCreated(data);
      }
    });

    this.socket.on('gameJoined', (data: GameJoinedEvent) => {
      if (this.eventHandlers.onGameJoined) {
        this.eventHandlers.onGameJoined(data);
      }
    });

    this.socket.on('opponentJoined', (data: OpponentJoinedEvent) => {
      if (this.eventHandlers.onOpponentJoined) {
        this.eventHandlers.onOpponentJoined(data);
      }
    });

    this.socket.on('moveMade', (data: MoveMadeEvent) => {
      if (this.eventHandlers.onMoveMade) {
        this.eventHandlers.onMoveMade(data);
      }
    });

    this.socket.on('error', (data: ErrorEvent) => {
      if (this.eventHandlers.onError) {
        this.eventHandlers.onError(data);
      }
    });

    this.socket.on('gameOver', (data: GameOverEvent) => {
      if (this.eventHandlers.onGameOver) {
        this.eventHandlers.onGameOver(data);
      }
    });

    this.socket.on('drawOffered', (data: DrawOfferedEvent) => {
      if (this.eventHandlers.onDrawOffered) {
        this.eventHandlers.onDrawOffered(data);
      }
    });

    this.socket.on('drawDeclined', (data: DrawDeclinedEvent) => {
      if (this.eventHandlers.onDrawDeclined) {
        this.eventHandlers.onDrawDeclined(data);
      }
    });

    this.socket.on('opponentDisconnected', () => {
      if (this.eventHandlers.onOpponentDisconnected) {
        this.eventHandlers.onOpponentDisconnected();
      }
    });

    this.socket.on('aiMoveCalculated', (data: AIMoveCalculatedEvent) => {
      if (this.eventHandlers.onAIMoveCalculated) {
        this.eventHandlers.onAIMoveCalculated(data);
      }
    });

    this.socket.on('message', (data: MessageEvent) => {
      if (this.eventHandlers.onMessage) {
        this.eventHandlers.onMessage(data);
      }
    });
  }

  /**
   * Set event handlers
   * @param handlers Object containing event handler functions
   */
  public setEventHandlers(handlers: SocketEventHandlers): void {
    this.eventHandlers = { ...this.eventHandlers, ...handlers };
  }

  /**
   * Check if socket is connected
   * @returns True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Disconnect from the server
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  /**
   * Create a new game
   */
  public createGame(): void {
    if (!this.isConnected()) {
      console.error('Cannot create game: not connected');
      return;
    }
    this.socket?.emit('createGame');
  }

  /**
   * Join an existing game
   * @param gameId ID of the game to join
   */
  public joinGame(gameId: string): void {
    if (!this.isConnected()) {
      console.error('Cannot join game: not connected');
      return;
    }
    this.socket?.emit('joinGame', { gameId: gameId.trim().toUpperCase() });
  }

  /**
   * Make a move
   * @param move Move object with from, to, and optional promotion
   */
  public makeMove(move: Move): void {
    if (!this.isConnected()) {
      console.error('Cannot make move: not connected');
      return;
    }
    this.socket?.emit('move', move);
  }

  /**
   * Resign the current game
   */
  public resignGame(): void {
    if (!this.isConnected()) {
      console.error('Cannot resign game: not connected');
      return;
    }
    this.socket?.emit('resign');
  }

  /**
   * Offer a draw to the opponent
   */
  public offerDraw(): void {
    if (!this.isConnected()) {
      console.error('Cannot offer draw: not connected');
      return;
    }
    this.socket?.emit('offerDraw');
  }

  /**
   * Accept a draw offer
   */
  public acceptDraw(): void {
    if (!this.isConnected()) {
      console.error('Cannot accept draw: not connected');
      return;
    }
    this.socket?.emit('acceptDraw');
  }

  /**
   * Decline a draw offer
   */
  public declineDraw(): void {
    if (!this.isConnected()) {
      console.error('Cannot decline draw: not connected');
      return;
    }
    this.socket?.emit('declineDraw');
  }

  /**
   * Send a chat message
   * @param text Message text
   */
  public sendMessage(text: string): void {
    if (!this.isConnected()) {
      console.error('Cannot send message: not connected');
      return;
    }
    this.socket?.emit('sendMessage', { text });
  }

  /**
   * Request an AI move
   * @param fen FEN string representing the current board position
   */
  public requestAIMove(fen: string): void {
    if (!this.isConnected()) {
      console.error('Cannot request AI move: not connected');
      return;
    }
    this.socket?.emit('requestAIMove', { fen });
  }

  /**
   * Stop the AI engine
   */
  public stopEngine(): void {
    if (!this.isConnected()) {
      console.error('Cannot stop engine: not connected');
      return;
    }
    this.socket?.emit('stopEngine');
  }
}

// Create a singleton instance with default URLs
const DEFAULT_URLS = [
  'http://100.65.144.222:3001', // Your Wi-Fi IP
  'http://192.168.56.1:3001',   // Your Ethernet IP (backup)
  'http://10.0.2.2:3001',       // Keep for emulator support
  'http://localhost:3001',      // Keep for local testing
];

export const socketManager = new SocketManager(DEFAULT_URLS);
