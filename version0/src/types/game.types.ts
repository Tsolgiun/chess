import { Chess, Move } from 'chess.js';

export type GameStatus = 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate';

export interface PlayerInfo {
  username: string;
  rating: number;
  timeLeft?: number;
}

export interface TimeControl {
  initial: number;
  increment: number;
  lastTickTime?: number;
}

export interface GameState {
  gameInstance: Chess;
  status: GameStatus;
  playerWhite: PlayerInfo;
  playerBlack: PlayerInfo;
  currentPlayer: 'w' | 'b';
  moveHistory: string[];
  timeControl: TimeControl;
  lastMove?: { from: string; to: string };
  startTime: Date | null;
}

export type GameAction =
  | { type: 'MAKE_MOVE'; move: { from: string; to: string; promotion?: string } }
  | { type: 'UPDATE_TIME'; color: 'w' | 'b'; timeLeft: number }
  | { type: 'GAME_OVER'; result: GameStatus }
  | { type: 'NEW_GAME' }
  | { type: 'RESIGN' };
