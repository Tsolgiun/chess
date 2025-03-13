import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Chess, Move } from 'chess.js';
import { GameState, GameAction, PlayerInfo, GameStatus } from '../types/game.types';

const createNewChessInstance = () => {
  try {
    return new Chess();
  } catch (error) {
    console.error('Failed to create chess instance:', error);
    return new Chess(); // Fallback to new instance
  }
};

const initialPlayerInfo: PlayerInfo = {
  username: 'Player',
  rating: 1200,
  timeLeft: 600, // 10 minutes in seconds
};

const initialState: GameState = {
  gameInstance: createNewChessInstance(),
  status: 'waiting',
  playerWhite: { ...initialPlayerInfo, username: 'Player 1' },
  playerBlack: { ...initialPlayerInfo, username: 'Player 2' },
  currentPlayer: 'w',
  moveHistory: [],
  timeControl: {
    initial: 600,
    increment: 5,
  },
  startTime: null
};

const getGameStatus = (chess: Chess): GameStatus => {
  if (chess.isGameOver()) {
    if (chess.isCheckmate()) return 'checkmate';
    if (chess.isDraw()) return 'draw';
    return 'stalemate';
  }
  return 'playing';
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'MAKE_MOVE': {
      try {
        const newGame = new Chess(state.gameInstance.fen());
        const result = newGame.move({
          from: action.move.from,
          to: action.move.to,
          promotion: action.move.promotion || undefined
        });

        if (!result) return state;

        // If this is the first move, set status to playing
        const newStatus = state.status === 'waiting' 
          ? 'playing' 
          : getGameStatus(newGame);

        return {
          ...state,
          gameInstance: newGame,
          currentPlayer: newGame.turn(),
          status: newStatus,
          startTime: state.startTime || new Date(),
          lastMove: {
            from: action.move.from,
            to: action.move.to
          },
          moveHistory: [...state.moveHistory, result.san]
        };
      } catch (error) {
        console.error('Move execution error:', error);
        return state;
      }
    }

    case 'UPDATE_TIME':
      return {
        ...state,
        [action.color === 'w' ? 'playerWhite' : 'playerBlack']: {
          ...state[action.color === 'w' ? 'playerWhite' : 'playerBlack'],
          timeLeft: action.timeLeft,
        },
      };

    case 'GAME_OVER':
      return {
        ...state,
        status: action.result,
      };

    case 'NEW_GAME':
      return {
        ...initialState,
        gameInstance: createNewChessInstance(),
      };

    case 'RESIGN':
      return {
        ...state,
        status: 'checkmate',
      };

    default:
      return state;
  }
}

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
