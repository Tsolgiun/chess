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
  const { socket, isConnected, connectionStatus, queueMove, joinRoom } = useSocket();
  const { user } = useAuthStore();
  const [game, setGame] = useState<Game | null>(null);
  const [currentMove, setCurrentMove] = useState<Move | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socketJoined, setSocketJoined] = useState(false);
  
  // Track room membership state
  const [isInRoom, setIsInRoom] = useState(false);
  
  // Chess instance as the single source of truth for the board position
  const chessRef = useRef<Chess>(new Chess(DEFAULT_POSITION));
  
  // Track last received game state to prevent duplicates
  const lastGameStateRef = useRef<string>('');
  
  // State for tracking move status
  const [moveStatus, setMoveStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const moveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Room joining logic
  useEffect(() => {
    if (!socket || !gameId) return;
    
    // Join room when connected and not already in room
    if (isConnected && !isInRoom) {
      addDebugInfo(`Joining game room: ${gameId}`);
      joinRoom(gameId);
      setSocketJoined(true);
    }
    
    // Handle successful room join
    const handlePlayerJoined = (data: { userId: string; timestamp: Date }) => {
      addDebugInfo(`Player joined: ${data.userId}`);
      if (data.userId === user?._id) {
        setIsInRoom(true);
      }
    };
    
    // Re-join room on reconnection
    const handleReconnect = () => {
      addDebugInfo('Reconnected, rejoining game room');
      if (gameId) {
        joinRoom(gameId);
      }
    };
    
    socket.on('player-joined', handlePlayerJoined);
    socket.on('reconnect', handleReconnect);
    
    return () => {
      socket.off('player-joined', handlePlayerJoined);
      socket.off('reconnect', handleReconnect);
    };
  }, [socket, gameId, isConnected, isInRoom, user, addDebugInfo, joinRoom]);

  // Socket connection and game state handling
  useEffect(() => {
    // Always show the board even if socket isn't connected yet
    if (!socket) {
      return;
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
      
      // If we have a pending move and received a new game state, it was likely successful
      if (moveStatus === 'pending') {
        setMoveStatus('success');
        
        // Reset move status after a delay
        setTimeout(() => {
          setMoveStatus('idle');
        }, 1000);
        
        // Clear any pending timeout
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
          moveTimeoutRef.current = null;
        }
      }
      
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
      
      // If this is our move and it's pending, mark it as successful
      if (moveData.playerId === user?._id && moveStatus === 'pending') {
        setMoveStatus('success');
        
        // Reset move status after a delay
        setTimeout(() => {
          setMoveStatus('idle');
        }, 1000);
        
        // Clear any pending timeout
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
          moveTimeoutRef.current = null;
        }
      }
    };

    // Handle errors
    const handleError = (error: { message: string }) => {
      addDebugInfo(`Socket error: ${error.message}`);
      setError(error.message);
      
      // If we have a pending move, mark it as failed
      if (moveStatus === 'pending') {
        setMoveStatus('error');
        
        // Reset move status after a delay
        setTimeout(() => {
          setMoveStatus('idle');
        }, 1000);
        
        // Clear any pending timeout
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
          moveTimeoutRef.current = null;
        }
      }
    };

    // Handle player leaving
    const handlePlayerLeft = (data: { userId: string; timestamp: Date }) => {
      addDebugInfo(`Player left: ${data.userId}`);
      if (data.userId === user?._id) {
        setIsInRoom(false);
      }
    };

    // Set up event listeners
    socket.on('game-state', handleGameState);
    socket.on('move', handleMove);
    socket.on('error', handleError);
    socket.on('player-left', handlePlayerLeft);

    // Cleanup when component unmounts
    return () => {
      socket.off('game-state', handleGameState);
      socket.off('move', handleMove);
      socket.off('error', handleError);
      socket.off('player-left', handlePlayerLeft);
      
      if (moveTimeoutRef.current) {
        clearTimeout(moveTimeoutRef.current);
        moveTimeoutRef.current = null;
      }
      
      // Don't leave the room on unmount to maintain connection
    };
  }, [socket, gameId, addDebugInfo, moveStatus, user?._id]);

  // Determine if it's the player's turn
  const isPlayersTurn = game?.currentTurn === user?._id;

  // Create default player info if game state hasn't loaded yet
  const whitePlayer = game?.white || { _id: '', username: 'White Player', rating: 1200, email: '' };
  const blackPlayer = game?.black || { _id: '', username: 'Black Player', rating: 1200, email: '' };
  const gameState = game?.state || 'waiting';

  const handleMove = async (move: Partial<Move>) => {
    if (!gameId || !user) return;
    
    // Retry join room if needed
    if (!isInRoom && socket) {
      addDebugInfo('Not in room, attempting to join before move');
      joinRoom(gameId);
      
      // Wait for room join confirmation
      await new Promise<boolean>(resolve => {
        const timeout = setTimeout(() => resolve(false), 1000);
        
        const handleJoin = (data: { userId: string }) => {
          if (data.userId === user._id) {
            clearTimeout(timeout);
            socket.off('player-joined', handleJoin);
            setIsInRoom(true);
            resolve(true);
          }
        };
        
        socket.on('player-joined', handleJoin);
        
        // Clean up listener if promise resolves/rejects
        setTimeout(() => {
          socket.off('player-joined', handleJoin);
        }, 1100);
      });
    }
    
    // Set move status to pending immediately
    setMoveStatus('pending');
    
    // Create the full move object
    const fullMove: Move = {
      from: move.from!,
      to: move.to!,
      promotion: move.promotion,
      timestamp: new Date(),
      playerId: user._id
    };
    
    addDebugInfo(`Emitting move: ${JSON.stringify(fullMove)}`);
    
    // Use the queueMove function instead of direct socket emit
    if (isConnected && socket) {
      socket.emit('move', { gameId, move: fullMove });
    } else {
      // If not connected, queue the move for later
      queueMove(gameId, fullMove);
    }
    
    // Set a timeout to revert to server state if no response
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
    
    moveTimeoutRef.current = setTimeout(() => {
      if (moveStatus === 'pending') {
        setMoveStatus('error');
        
        // Reset move status after showing error
        setTimeout(() => {
          setMoveStatus('idle');
        }, 1000);
      }
    }, 5000); // 5 second timeout
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

  // Get the current position from the chess instance
  const currentPosition = chessRef.current ? chessRef.current.fen() : DEFAULT_POSITION;

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
            position={currentPosition}
            orientation={user?._id === whitePlayer._id ? 'white' : 'black'}
            isPlayersTurn={(isPlayersTurn || false) && connectionStatus === 'connected'}
            onMove={handleMove}
            moveStatus={moveStatus}
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
