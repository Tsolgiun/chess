import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { Chess } from 'chess.js';
import io, { Socket } from 'socket.io-client';

// Define API URLs directly to avoid import issues
const PRIMARY_API_URL = 'http://10.0.2.2:3001'; // Android emulator special IP
const FALLBACK_API_URL = 'http://localhost:3001'; // Fallback URL

// Define the shape of the game context
interface GameContextType {
  game: Chess;
  gameId: string | null;
  playerColor: 'white' | 'black' | null;
  isGameActive: boolean;
  status: string;
  gameOver: boolean;
  gameResult: string | null;
  isAIGame: boolean;
  isAIThinking: boolean;
  lastMove: { from: string; to: string } | null;
  opponentPlatform: string | null;
  createGame: () => void;
  joinGame: (id: string) => void;
  startAIGame: (playerColor?: 'white' | 'black') => void;
  makeMove: (move: { from: string; to: string; promotion?: string }) => boolean;
  resetGameState: () => void;
  resignGame: () => void;
}

// Create the context with a default value
const GameContext = createContext<GameContextType>({
  game: new Chess(),
  gameId: null,
  playerColor: null,
  isGameActive: false,
  status: 'Welcome to Chess App!',
  gameOver: false,
  gameResult: null,
  isAIGame: false,
  isAIThinking: false,
  lastMove: null,
  opponentPlatform: null,
  createGame: () => {},
  joinGame: () => {},
  startAIGame: () => {},
  makeMove: () => false,
  resetGameState: () => {},
  resignGame: () => {},
});

// Custom hook to use the game context
export const useGame = () => useContext(GameContext);

// Game provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State declarations
  const [socket, setSocket] = useState<Socket | null>(null);
  const [game, setGame] = useState<Chess>(() => new Chess());
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [status, setStatus] = useState('Welcome to Chess App!');
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [isAIGame, setIsAIGame] = useState(false);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [opponentPlatform, setOpponentPlatform] = useState<string | null>(null);

  // Utility functions
  const updateStatus = useCallback((currentGame: Chess) => {
    let statusText = '';
    
    if (currentGame.isGameOver()) {
      if (currentGame.isCheckmate()) {
        statusText = `Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
      } else if (currentGame.isDraw()) {
        if (currentGame.isStalemate()) {
          statusText = 'Game over! Stalemate!';
        } else if (currentGame.isThreefoldRepetition()) {
          statusText = 'Game over! Draw by threefold repetition!';
        } else if (currentGame.isInsufficientMaterial()) {
          statusText = 'Game over! Draw by insufficient material!';
        } else {
          statusText = 'Game over! Draw!';
        }
      }
      setGameOver(true);
      setGameResult(statusText);
    } else {
      statusText = `${currentGame.turn() === 'w' ? 'White' : 'Black'} to move`;
      if (currentGame.isCheck()) {
        statusText += ', Check!';
      }
    }
    
    setStatus(statusText);
  }, []);

  // Handle AI moves
  const handleAIMove = useCallback(async (currentGame: Chess) => {
    if (!isAIGame || !isGameActive || gameOver || isAIThinking) return;

    const isAITurn = currentGame.turn() === (playerColor === 'white' ? 'b' : 'w');
    if (!isAITurn) return;

    setIsAIThinking(true);
    try {
      // Simulate AI thinking time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all legal moves
      const moves = currentGame.moves({ verbose: true });
      
      if (moves.length > 0) {
        // Select a random move for now
        // In a real app, you would use a chess engine or API
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        
        // Create a new game instance to avoid state mutation issues
        const newGame = new Chess(currentGame.fen());
        const moveResult = newGame.move({
          from: randomMove.from,
          to: randomMove.to,
          promotion: randomMove.promotion
        });
        
        if (moveResult) {
          setGame(newGame);
          setLastMove({ from: randomMove.from, to: randomMove.to });
          updateStatus(newGame);
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsAIThinking(false);
    }
  }, [isAIGame, isGameActive, gameOver, isAIThinking, playerColor, updateStatus]);

  // Player move function
  const makeMove = useCallback((move: { from: string; to: string; promotion?: string }) => {
    if (!isGameActive || gameOver) return false;
    
    const newGame = new Chess(game.fen());
    const result = newGame.move(move);
    
    if (result) {
      setGame(newGame);
      setLastMove({ from: move.from, to: move.to });
      updateStatus(newGame);

      if (!isAIGame && socket) {
        socket.emit('move', move);
      }
      return true;
    }
    return false;
  }, [game, isGameActive, gameOver, isAIGame, socket, updateStatus]);

  // Game management functions
  const resetGameState = useCallback(() => {
    const newGame = new Chess();
    setGame(newGame);
    setGameId(null);
    setPlayerColor(null);
    setIsGameActive(false);
    setGameOver(false);
    setGameResult(null);
    setIsAIGame(false);
    setIsAIThinking(false);
    setLastMove(null);
    setOpponentPlatform(null);
    setStatus('Welcome to Chess App!');
  }, []);

  const startAIGame = useCallback((playerChosenColor: 'white' | 'black' = 'white') => {
    resetGameState();
    const newGame = new Chess();
    setGame(newGame);
    setIsAIGame(true);
    setIsGameActive(true);
    setPlayerColor(playerChosenColor);
    setStatus(`Game started! You are playing as ${playerChosenColor} against AI`);
  }, [resetGameState]);

  // Effect to trigger AI moves
  useEffect(() => {
    if (game && !isAIThinking && isAIGame) {
      handleAIMove(game);
    }
  }, [game, handleAIMove, isAIThinking, isAIGame]);

  // State to track if we need to use the fallback URL
  const [useFallback, setUseFallback] = useState(false);
  
  // Socket initialization and event handlers
  useEffect(() => {
    // Only connect to socket if not in AI game mode
    if (isAIGame) return;

    const serverUrl = useFallback ? FALLBACK_API_URL : PRIMARY_API_URL;

    console.log('Connecting to socket server at:', serverUrl);
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });
    
    // Log connection events for debugging
    newSocket.on('connect', () => {
      console.log('Socket connected successfully to', serverUrl);
      
      // Send platform information
      newSocket.emit('setPlatform', { platform: 'mobile' });
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      
      // If we're using the primary URL and get an error, try the fallback
      if (!useFallback) {
        console.log('Trying fallback URL...');
        setUseFallback(true);
      }
    });
    
    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
    
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      
      // Re-send platform information after reconnection
      newSocket.emit('setPlatform', { platform: 'mobile' });
    });
    
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAIGame, useFallback]);

  useEffect(() => {
    if (!socket) return;

    socket.on('gameCreated', ({ gameId, color }) => {
      setGameId(gameId);
      setPlayerColor(color === 'white' ? 'white' : 'black');
      setIsGameActive(true);
      setStatus('Waiting for an opponent to join...');
      const newGame = new Chess();
      setGame(newGame);
    });

    socket.on('gameJoined', ({ gameId, color, fen, opponentPlatform }) => {
      setGameId(gameId);
      setPlayerColor(color === 'white' ? 'white' : 'black');
      setIsGameActive(true);
      setOpponentPlatform(opponentPlatform);
      setStatus(`Game started! You are playing as ${color}.`);
      if (fen) {
        const newGame = new Chess(fen);
        setGame(newGame);
      }
    });

    socket.on('opponentJoined', ({ platform }) => {
      setStatus('Game started! Your opponent has joined.');
      setOpponentPlatform(platform);
    });

    socket.on('moveMade', ({ from, to, promotion, fen }) => {
      const newGame = new Chess(fen);
      setGame(newGame);
      setLastMove({ from, to });
      updateStatus(newGame);
    });

    socket.on('error', ({ message }) => {
      setStatus(`Error: ${message}`);
    });

    socket.on('gameOver', ({ result }) => {
      setGameOver(true);
      setGameResult(result);
      setStatus(result);
    });

    socket.on('opponentDisconnected', () => {
      setStatus('Your opponent has disconnected.');
      setIsGameActive(false);
    });

    return () => {
      if (socket) {
        socket.off('gameCreated');
        socket.off('gameJoined');
        socket.off('opponentJoined');
        socket.off('moveMade');
        socket.off('error');
        socket.off('gameOver');
        socket.off('opponentDisconnected');
      }
    };
  }, [socket, updateStatus]);

  // Create game function
  const createGame = useCallback(() => {
    if (socket) {
      resetGameState();
      socket.emit('createGame');
      setStatus('Creating a new game...');
    }
  }, [socket, resetGameState]);

  // Join game function
  const joinGame = useCallback((id: string) => {
    if (socket && id) {
      resetGameState();
      socket.emit('joinGame', { gameId: id.trim().toUpperCase() });
      setStatus('Joining game...');
    }
  }, [socket, resetGameState]);

  // Resign game function
  const resignGame = useCallback(() => {
    if (!isGameActive || gameOver) return;
    
    if (isAIGame) {
      setGameOver(true);
      setGameResult('Game Over - You resigned');
      setStatus('Game Over - You resigned');
    } else if (socket) {
      socket.emit('resign');
    }
  }, [isGameActive, gameOver, isAIGame, socket]);

  // Provide the game context to children components
  return (
    <GameContext.Provider value={{
      game,
      gameId,
      playerColor,
      isGameActive,
      status,
      gameOver,
      gameResult,
      isAIGame,
      isAIThinking,
      lastMove,
      opponentPlatform,
      createGame,
      joinGame,
      startAIGame,
      makeMove,
      resetGameState,
      resignGame,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
