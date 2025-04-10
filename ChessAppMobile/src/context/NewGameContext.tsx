import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { gameManager } from '../utils/game/GameManager';
import { GameState, PlayerColor } from '../utils/game/GameState';

// Define the shape of the context
interface GameContextType {
  // Game state
  gameState: GameState;
  isAIThinking: boolean;
  opponentPlatform: string | null;
  
  // Game actions
  createGame: () => void;
  joinGame: (id: string) => void;
  startAIGame: (playerColor?: PlayerColor) => void;
  makeMove: (from: string, to: string, promotion?: string) => boolean;
  resetGameState: () => void;
  resignGame: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
  declineDraw: () => void;
  
  // Utility functions
  getLegalMoves: (square: string) => string[];
  getPiece: (square: string) => { type: string; color: string } | null;
}

// Create the context with a default value
const NewGameContext = createContext<GameContextType>({
  // Game state
  gameState: gameManager.getGameState(),
  isAIThinking: false,
  opponentPlatform: null,
  
  // Game actions
  createGame: () => {},
  joinGame: () => {},
  startAIGame: () => {},
  makeMove: () => false,
  resetGameState: () => {},
  resignGame: () => {},
  offerDraw: () => {},
  acceptDraw: () => {},
  declineDraw: () => {},
  
  // Utility functions
  getLegalMoves: () => [],
  getPiece: () => null,
});

// Custom hook to use the game context
export const useGame = () => useContext(NewGameContext);

// Game provider component
export const NewGameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State to track the game state and trigger re-renders
  const [gameState, setGameState] = useState<GameState>(gameManager.getGameState());
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [opponentPlatform, setOpponentPlatform] = useState<string | null>(null);
  
  // Update the game state periodically to trigger re-renders
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(gameManager.getGameState().clone());
      setIsAIThinking(gameManager.isAIProcessing());
    }, 100);
    
    return () => clearInterval(interval);
  }, []);
  
  // Connect to the server on component mount
  useEffect(() => {
    const connectToServer = async () => {
      try {
        await gameManager.connect();
      } catch (error) {
        console.error('Failed to connect to server:', error);
      }
    };
    
    connectToServer();
  }, []);
  
  // Game actions
  const createGame = useCallback(() => {
    gameManager.createOnlineGame();
  }, []);
  
  const joinGame = useCallback((id: string) => {
    gameManager.joinOnlineGame(id);
  }, []);
  
  const startAIGame = useCallback((playerColor: PlayerColor = 'white') => {
    gameManager.startAIGame(playerColor);
  }, []);
  
  const makeMove = useCallback((from: string, to: string, promotion?: string) => {
    return gameManager.makeMove(from, to, promotion);
  }, []);
  
  const resetGameState = useCallback(() => {
    gameManager.resetGame();
  }, []);
  
  const resignGame = useCallback(() => {
    gameManager.resignGame();
  }, []);
  
  const offerDraw = useCallback(() => {
    gameManager.offerDraw();
  }, []);
  
  const acceptDraw = useCallback(() => {
    gameManager.acceptDraw();
  }, []);
  
  const declineDraw = useCallback(() => {
    gameManager.declineDraw();
  }, []);
  
  // Utility functions
  const getLegalMoves = useCallback((square: string) => {
    return gameManager.getLegalMoves(square);
  }, []);
  
  const getPiece = useCallback((square: string) => {
    return gameManager.getPiece(square);
  }, []);
  
  // Create the context value
  const contextValue: GameContextType = {
    // Game state
    gameState,
    isAIThinking,
    opponentPlatform,
    
    // Game actions
    createGame,
    joinGame,
    startAIGame,
    makeMove,
    resetGameState,
    resignGame,
    offerDraw,
    acceptDraw,
    declineDraw,
    
    // Utility functions
    getLegalMoves,
    getPiece,
  };
  
  return (
    <NewGameContext.Provider value={contextValue}>
      {children}
    </NewGameContext.Provider>
  );
};

export default NewGameContext;
