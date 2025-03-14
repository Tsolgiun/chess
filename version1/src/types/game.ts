export interface User {
  _id: string;
  username: string;
  email: string;
  rating: number;
}

export interface ChatMessage {
  content: string;
  timestamp: Date;
  authorId: string;
}

export interface Move {
  from: string;
  to: string;
  promotion?: string;
  timestamp: Date;
  playerId: string;
}

export interface GameState {
  position: string; // FEN string
  currentTurn: string; // player ID
  moves: Move[];
  state: 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'resigned';
  drawOfferedBy: string | null;
  white: User;
  black: User;
  winner?: string; // player ID
  timeControl: {
    initial: number;
    increment: number;
  };
  timers: {
    white: number;
    black: number;
  };
}

export interface Game extends GameState {
  _id: string;
  createdAt: Date;
}

// Socket.io Events
export interface ServerToClientEvents {
  'game-state': (state: GameState) => void;
  'move': (move: Move) => void;
  'new-message': (message: ChatMessage & { authorId: string }) => void;
  'player-joined': (data: { userId: string; timestamp: Date }) => void;
  'player-left': (data: { userId: string; timestamp: Date }) => void;
  'game-over': (data: { result: string; winner?: string; timestamp: Date }) => void;
  'connect_error': (error: Error) => void;
  'error': (error: { message: string }) => void;
}

export interface ClientToServerEvents {
  'join-game': (gameId: string) => void;
  'leave-game': (gameId: string) => void;
  'move': (data: { gameId: string; move: Move }) => void;
  'resign': (data: { gameId: string }) => void;
  'offer-draw': (data: { gameId: string }) => void;
  'accept-draw': (data: { gameId: string }) => void;
  'decline-draw': (data: { gameId: string }) => void;
  'send-message': (data: { gameId: string; content: string }) => void;
  'game-ended': (data: { gameId: string; result: string; winner?: string }) => void;
}

export type SocketEvents = ServerToClientEvents & ClientToServerEvents;

/**
 * Validates if an object is a proper GameState
 * @param state The object to validate
 * @returns True if the object is a valid GameState
 */
export const isValidGameState = (state: any): state is GameState => {
  return (
    state &&
    typeof state.position === 'string' &&
    typeof state.currentTurn === 'string' &&
    Array.isArray(state.moves) &&
    typeof state.state === 'string' &&
    state.white && typeof state.white._id === 'string' &&
    (!state.black || typeof state.black._id === 'string') &&
    state.timeControl && typeof state.timeControl.initial === 'number'
  );
};
