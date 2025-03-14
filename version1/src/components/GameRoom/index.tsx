import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { useAuthStore } from '../../store';
import { Game, GameState, Move, isValidGameState } from '../../types/game';
import { Chess } from 'chess.js';
import Chessboard from '../Chessboard';
import MoveHistory from '../MoveHistory';
import GameControls from '../GameControls';
import PlayerInfo from '../PlayerInfo';
import Chat from '../Chat';
import { ErrorBoundary } from '../ErrorBoundary';
import './GameRoom.css';

// Default starting position in FEN notation
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const GameRoom: React.FC = () => {
  const params = useParams();
  const gameId = params.gameId;
  const { socket, isConnected, connectionStatus } = useSocket();
  const { user } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketJoined, setSocketJoined] = useState(false);
  
  // Chess instance as the single source of truth for the board position
  const chessRef = useRef<Chess>(new Chess(DEFAULT_POSITION));
  
  // Track last received game state to prevent duplicates
  const lastGameStateRef = useRef<string>('');
  
  // Track if we've already joined the room
  const roomJoinedRef = useRef<boolean>(false);

  // Add debug info (only in development)
  const addDebugInfo = useCallback((info: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(info);
    }
  }, []);

  // Update chess instance when game position changes
  useEffect(() => {
    if (game?.position) {
      try {
        chessRef.current.load(game.position);
        setIsLoading(false);
      } catch (error) {
        addDebugInfo(`Error loading position: ${error}`);
      }
    }
  }, [game?.position, addDebugInfo]);

  // Socket connection and game room joining
  useEffect(() => {
    // Always show the board even if socket isn't connected yet
    if (!socket) {
      return;
    }
    
    // Only join the room once when connected
    if (isConnected && !roomJoinedRef.current && gameId) {
      addDebugInfo(`Joining game room: ${gameId}`);
      socket.emit('join-game', gameId);
      roomJoinedRef.current = true;
      setSocketJoined(true);
    }

    // Handle game state updates
    const handleGameState = (gameState: GameState) => {
      // Validate game state
      if (!isValidGameState(gameState)) {
        addDebugInfo("Received invalid game state");
        return;
      }
      
      // Create a hash of the game state to detect duplicates
      const gameStateHash = JSON.stringify({
        position: gameState.position,
        moves: gameState.moves.length,
        state: gameState.state,
        currentTurn: gameState.currentTurn
      });
      
      // Skip if this is a duplicate game state
      if (gameStateHash === lastGameStateRef.current) {
        addDebugInfo("Skipping duplicate game state");
        return;
      }
      
      // Update the last game state hash
      lastGameStateRef.current = gameStateHash;
      
      addDebugInfo(`Received game state: ${JSON.stringify(gameState).substring(0, 100)}...`);
      
      setGame(prev => ({
        ...prev,
        ...gameState,
        _id: gameId || '',
        createdAt: prev?.createdAt || new Date()
      }));
      
      setIsLoading(false);
    };

    // Handle moves
    const handleMove = (moveData: Move) => {
      addDebugInfo(`Received move: ${JSON.stringify(moveData)}`);
      setCurrentMove(moveData);
    };

    // Handle errors
    const handleError = (error: { message: string }) => {
      addDebugInfo(`Socket error: ${error.message}`);
      setError(error.message);
    };

    // Handle reconnection
    const handleReconnect = () => {
      // Reset joined flag to rejoin the room
      if (roomJoinedRef.current) {
        addDebugInfo('Reconnected, rejoining game room');
        socket.emit('join-game', gameId);
      }
    };

    // Set up event listeners
    socket.on('game-state', handleGameState);
    socket.on('move', handleMove);
    socket.on('error', handleError);
    socket.on('reconnect', handleReconnect);

    // Ping/pong to keep connection alive
    const pingInterval = setInterval(() => {
      if (socket.connected) {
        socket.emit('ping');
      }
    }, 25000);

    // Cleanup when component unmounts
    return () => {
      clearInterval(pingInterval);
      socket.off('game-state', handleGameState);
      socket.off('move', handleMove);
      socket.off('error', handleError);
      socket.off('reconnect', handleReconnect);
      
      // Don't leave the room on unmount to maintain connection
    };
  }, [socket, gameId, isConnected, addDebugInfo]);

  // Determine if it's the player's turn
  const isPlayersTurn = game?.currentTurn === user?._id;

  // Create default player info if game state hasn't loaded yet
  const whitePlayer = game?.white || { _id: '', username: 'White Player', rating: 1200, email: '' };
  const blackPlayer = game?.black || { _id: '', username: 'Black Player', rating: 1200, email: '' };
  const gameState = game?.state || 'waiting';

  const handleMove = (move: Partial<Move>) => {
    if (!socket || !gameId || !user || !isConnected) return;
    
    // Validate move using chess.js
    try {
      const chessMove = chessRef.current.move({
        from: move.from!,
        to: move.to!,
        promotion: move.promotion
      });
      
      if (chessMove) {
        const fullMove: Move = {
          from: move.from!,
          to: move.to!,
          promotion: move.promotion,
          timestamp: new Date(),
          playerId: user._id
        };

        addDebugInfo(`Emitting move: ${JSON.stringify(fullMove)}`);
        socket.emit('move', { gameId, move: fullMove });
      } else {
        addDebugInfo("Invalid move");
      }
    } catch (error) {
      addDebugInfo(`Move error: ${error}`);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="game-room error">
        <div className="error-message">Error: {error}</div>
        <button 
          className="retry-button"
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="game-room">
      <div className={`game-container ${isLoading && socketJoined ? 'loading' : ''}`}>
        {connectionStatus !== 'connected' && (
          <div className="connection-overlay">
            {connectionStatus === 'connecting' ? 'Connecting to server...' : 
             connectionStatus === 'disconnected' ? 'Disconnected from server. Reconnecting...' : 
             'Connection error. Please refresh the page.'}
          </div>
        )}
        
        <div className="game-info">
          <PlayerInfo
            player={whitePlayer}
            color="white"
            isCurrentTurn={game?.currentTurn === whitePlayer._id}
          />
          <GameControls
            gameState={gameState}
            isPlayersTurn={isPlayersTurn || false}
            onResign={() => socket?.emit('resign', { gameId })}
            onDrawOffer={() => socket?.emit('offer-draw', { gameId })}
            onDrawAccept={() => socket?.emit('accept-draw', { gameId })}
            onDrawDecline={() => socket?.emit('decline-draw', { gameId })}
          />
          <PlayerInfo
            player={blackPlayer}
            color="black"
            isCurrentTurn={game?.currentTurn === blackPlayer._id}
          />
        </div>

        <div className="game-board">
          <Chessboard
            position={chessRef.current.fen()}
            orientation={user?._id === whitePlayer._id ? 'white' : 'black'}
            isPlayersTurn={(isPlayersTurn || false) && connectionStatus === 'connected'}
            onMove={handleMove}
          />
        </div>

        <div className="game-sidebar">
          <MoveHistory moves={game?.moves || []} currentMove={currentMove} />
          {gameId && socket && <Chat gameId={gameId} socket={socket} />}
        </div>
      </div>
      
      {isLoading && !socketJoined && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">Loading game...</div>
        </div>
      )}
    </div>
  );
};

const GameRoomWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary>
      <GameRoom />
    </ErrorBoundary>
  );
};

export default GameRoomWithErrorBoundary;
