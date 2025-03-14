import { Server, Socket } from 'socket.io';
import { Types } from 'mongoose';
import { Game } from '../models/Game';
import jwt from 'jsonwebtoken';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { getChessInstance, applyMoves, determineGameState, cleanupChessInstance } from '../utils/gameStateManager';

interface AuthenticatedSocket extends Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap> {
  userId: string;
  currentRoom?: string; // Track current room
}

interface GameMove {
  from: string;
  to: string;
  promotion?: string;
}

// Map to track which game room each socket is in
const socketRooms = new Map<string, string>();

// Map to track last game state sent to each room to prevent duplicates
const lastGameStates = new Map<string, string>();

// Helper function to convert MongoDB game to client game state
const convertGameToGameState = async (game: any) => {
  try {
    await game.populate('whitePlayer blackPlayer', 'username rating');
    
    // Get or create chess instance for this game
    const gameId = game._id.toString();
    const chessInstance = getChessInstance(gameId);
    
    // Apply all moves to get current position
    applyMoves(chessInstance, game.moves);
    
    // Determine game state based on status and players
    let gameStateStr = 'playing';
    if (!game.blackPlayer || game.status === 'pending') {
      gameStateStr = 'waiting';
      
      // If both players are present, update status to active
      if (game.whitePlayer && game.blackPlayer && game.status === 'pending') {
        game.status = 'active';
        await game.save();
        gameStateStr = 'playing';
      }
    } else if (game.status === 'completed') {
      if (chessInstance.isCheckmate()) {
        gameStateStr = 'checkmate';
      } else if (chessInstance.isDraw() || chessInstance.isStalemate()) {
        gameStateStr = 'draw';
      } else {
        gameStateStr = 'resigned';
      }
    }
    
    const blackPlayer = game.blackPlayer ? {
      _id: game.blackPlayer._id.toString(),
      username: game.blackPlayer.username,
      rating: game.blackPlayer.rating || 1200,
      email: ''
    } : null;
    
    const gameState = {
      position: chessInstance.fen(),
      currentTurn: game.moves.length % 2 === 0 ? 
        game.whitePlayer._id.toString() : 
        game.blackPlayer?._id?.toString() || game.whitePlayer._id.toString(),
      moves: game.moves.map((moveStr: string) => {
        try {
          const move = JSON.parse(moveStr);
          return {
            ...move,
            timestamp: move.timestamp || new Date(),
            playerId: move.playerId || (game.moves.indexOf(moveStr) % 2 === 0 ? game.whitePlayer._id.toString() : game.blackPlayer?._id?.toString() || game.whitePlayer._id.toString())
          };
        } catch (e) {
          return {
            from: 'e2',
            to: 'e4',
            timestamp: new Date(),
            playerId: game.whitePlayer._id.toString()
          };
        }
      }),
      state: gameStateStr,
      drawOfferedBy: game.drawOfferedBy ? game.drawOfferedBy.toString() : null,
      white: {
        _id: game.whitePlayer._id.toString(),
        username: game.whitePlayer.username,
        rating: game.whitePlayer.rating || 1200,
        email: ''
      },
      black: blackPlayer,
      winner: game.winner ? game.winner.toString() : undefined,
      timeControl: {
        initial: game.timeControl.initial,
        increment: game.timeControl.increment
      },
      timers: {
        white: game.timeControl.initial,
        black: game.timeControl.initial
      }
    };
    
    return gameState;
  } catch (error) {
    console.error('Error converting game to game state:', error);
    // Return a minimal game state to avoid breaking the client
    return {
      position: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      currentTurn: game.whitePlayer.toString(),
      moves: [],
      state: 'waiting',
      drawOfferedBy: null,
      white: {
        _id: game.whitePlayer.toString(),
        username: 'Player 1',
        rating: 1200,
        email: ''
      },
      black: game.blackPlayer ? {
        _id: game.blackPlayer.toString(),
        username: 'Player 2',
        rating: 1200,
        email: ''
      } : null,
      timeControl: {
        initial: 600,
        increment: 5
      },
      timers: {
        white: 600,
        black: 600
      }
    };
  }
};

// Helper function to check if game state is a duplicate
const isDuplicateGameState = (gameId: string, gameState: any): boolean => {
  const gameStateHash = JSON.stringify({
    position: gameState.position,
    moves: gameState.moves.length,
    state: gameState.state,
    currentTurn: gameState.currentTurn
  });
  
  const lastState = lastGameStates.get(gameId);
  if (lastState === gameStateHash) {
    console.log(`Skipping duplicate game state for game: ${gameId}`);
    return true;
  }
  
  // Update last game state
  lastGameStates.set(gameId, gameStateHash);
  return false;
};

export const initializeSocketHandlers = (io: Server): void => {
  // Middleware to authenticate socket connections
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token not provided'));
      }

      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string };
        (socket as AuthenticatedSocket).userId = decoded.userId;
        next();
      } catch (jwtError) {
        next(new Error('Authentication failed - invalid token'));
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const authSocket = socket as AuthenticatedSocket;
    
    // Add ping/pong handling to keep connection alive
    const pingInterval = setInterval(() => {
      socket.emit('pong');
    }, 25000);

    socket.on('ping', () => {
      // Respond with pong to keep connection alive
      socket.emit('pong');
    });
    
    // Join game room
    socket.on('join-game', async (gameId: string) => {
      try {
        // Leave current room if in one
        if (authSocket.currentRoom) {
          socket.leave(authSocket.currentRoom);
          
          // Remove from socket rooms map
          socketRooms.delete(socket.id);
          
          // Notify other players in the old room
          io.to(authSocket.currentRoom).emit('player-left', {
            userId: authSocket.userId,
            timestamp: new Date()
          });
        }
        
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        // Check if this is the user's own game and they're white player
        const isWhitePlayer = game.whitePlayer.toString() === authSocket.userId;
        
        // If user is not the white player and game is pending, try to join as black
        if (!isWhitePlayer && game.status === 'pending' && !game.blackPlayer) {
          // Join as black player
          game.blackPlayer = new Types.ObjectId(authSocket.userId);
          game.status = 'active';
          await game.save();
        }
        
        // Join the new room
        socket.join(gameId);
        authSocket.currentRoom = gameId;
        
        // Update socket rooms map
        socketRooms.set(socket.id, gameId);
        
        // Convert MongoDB game to client game state
        const gameState = await convertGameToGameState(game);
        
        // Emit game state to the player who just joined
        socket.emit('game-state', gameState);
        
        // Notify all players in the room that someone joined
        io.to(gameId).emit('player-joined', {
          userId: authSocket.userId,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error joining game room:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    // Leave game room
    socket.on('leave-game', (gameId: string) => {
      // Only leave if this is the current room
      if (authSocket.currentRoom === gameId) {
        socket.leave(gameId);
        authSocket.currentRoom = undefined;
        
        // Remove from socket rooms map
        socketRooms.delete(socket.id);
        
        // Notify other players
        io.to(gameId).emit('player-left', {
          userId: authSocket.userId,
          timestamp: new Date()
        });
      }
    });

    // Make move
    socket.on('move', async (data: { gameId: string; move: GameMove }) => {
      try {
        const { gameId, move } = data;
        
        // Verify this is the current room
        if (authSocket.currentRoom !== gameId) {
          socket.emit('error', { message: 'Not in this game room' });
          return;
        }
        
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        // Validate that it's the player's turn
        const isWhite = game.whitePlayer.toString() === authSocket.userId;
        
        // Check if black player exists
        if (!game.blackPlayer) {
          socket.emit('error', { message: 'Waiting for opponent' });
          return;
        }
        
        const isBlack = game.blackPlayer.toString() === authSocket.userId;

        if (!isWhite && !isBlack) {
          socket.emit('error', { message: 'Not a player in this game' });
          return;
        }

        // Check if it's the player's turn
        const isPlayersTurn = (game.moves.length % 2 === 0 && isWhite) || (game.moves.length % 2 === 1 && isBlack);
        if (!isPlayersTurn) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }

        // Validate move with chess.js
        const chessInstance = getChessInstance(gameId);
        applyMoves(chessInstance, game.moves);
        
        // Try to make the move
        const moveResult = chessInstance.move({
          from: move.from,
          to: move.to,
          promotion: move.promotion
        });

        if (!moveResult) {
          socket.emit('error', { message: 'Invalid move' });
          return;
        }

        // Move is valid, save it to the database
        const moveWithPlayerId = {
          ...move,
          playerId: authSocket.userId,
          timestamp: new Date()
        };
        
        // Add move to game
        game.moves.push(JSON.stringify(moveWithPlayerId));
        
        // Check if game is over
        if (chessInstance.isGameOver()) {
          if (chessInstance.isCheckmate()) {
            game.status = 'completed';
            game.winner = new Types.ObjectId(authSocket.userId);
          } else if (chessInstance.isDraw()) {
            game.status = 'completed';
          }
        }
        
        // Save game
        await game.save();
        
        // Get updated game state
        const updatedGameState = await convertGameToGameState(game);
        
        // Broadcast move to all players in the room
        io.to(gameId).emit('move', moveWithPlayerId);
        
        // Broadcast updated game state to all players
        io.to(gameId).emit('game-state', updatedGameState);
      } catch (error: any) {
        console.error('Error making move:', error);
        socket.emit('error', { message: 'Failed to make move' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      // Clear ping interval
      clearInterval(pingInterval);
      
      // If user was in a room, notify others
      if (authSocket.currentRoom) {
        io.to(authSocket.currentRoom).emit('player-left', {
          userId: authSocket.userId,
          timestamp: new Date(),
          reason: 'disconnected'
        });
        
        // Remove from socket rooms map
        socketRooms.delete(socket.id);
      }
    });

    // Send chat message
    socket.on('send-message', async (data: { gameId: string; content: string }) => {
      try {
        const { gameId, content } = data;
        
        // Verify this is the current room
        if (authSocket.currentRoom !== gameId) {
          socket.emit('error', { message: 'Not in this game room' });
          return;
        }
        
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        const message = {
          author: new Types.ObjectId(authSocket.userId),
          content,
          timestamp: new Date()
        };

        game.chat.push(message);
        await game.save();

        io.to(gameId).emit('new-message', {
          ...message,
          authorId: authSocket.userId
        });
      } catch (error: any) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Game ended
    socket.on('game-ended', async (data: { gameId: string; result: string; winner?: string }) => {
      try {
        const { gameId, result, winner } = data;
        
        // Verify this is the current room
        if (authSocket.currentRoom !== gameId) {
          socket.emit('error', { message: 'Not in this game room' });
          return;
        }
        
        const game = await Game.findById(gameId);
        
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }

        game.status = 'completed';
        game.result = result as 'white' | 'black' | 'draw';
        game.endTime = new Date();
        
        if (winner) {
          game.winner = new Types.ObjectId(winner);
        }

        await game.save();

        // Convert updated game to game state
        const gameState = await convertGameToGameState(game);
        
        // Broadcast final game state to all players
        io.to(gameId).emit('game-state', gameState);

        io.to(gameId).emit('game-over', {
          result,
          winner,
          timestamp: new Date()
        });
      } catch (error: any) {
        console.error('Error ending game:', error);
        socket.emit('error', { message: 'Failed to end game' });
      }
    });
  });
};
