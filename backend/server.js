const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');

// Initialize Express and Socket.io
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Store active games
const games = {};

// Generate a random game ID
function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Create a new game
    socket.on('createGame', () => {
        const gameId = generateGameId();
        games[gameId] = {
            chess: new Chess(),
            players: {
                white: socket.id,
                black: null
            }
        };
        
        socket.join(gameId);
        socket.data.color = 'white';
        socket.data.gameId = gameId;
        socket.emit('gameCreated', { gameId, color: 'white' });
    });

    // Join an existing game
    socket.on('joinGame', (data) => {
        const gameId = data.gameId;
        
        if (!games[gameId]) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        
        if (games[gameId].players.black) {
            socket.emit('error', { message: 'Game is full' });
            return;
        }
        
        socket.join(gameId);
        socket.data.color = 'black';
        socket.data.gameId = gameId;
        games[gameId].players.black = socket.id;
        
        socket.emit('gameJoined', { 
            gameId, 
            color: 'black',
            fen: games[gameId].chess.fen()
        });
        
        socket.to(gameId).emit('opponentJoined');
    });

    // Handle a move
    socket.on('move', (data) => {
        const gameId = socket.data.gameId;
        
        if (!games[gameId]) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }
        
        const game = games[gameId].chess;
        const turn = game.turn();
        const playerColor = socket.data.color;
        
        if ((turn === 'w' && playerColor !== 'white') || 
            (turn === 'b' && playerColor !== 'black')) {
            socket.emit('error', { message: 'Not your turn' });
            return;
        }
        
        try {
            const move = game.move({
                from: data.from,
                to: data.to,
                promotion: data.promotion
            });

            if (move) {
                // Broadcast the move and current FEN to all players
                const fen = game.fen();
                io.to(gameId).emit('moveMade', {
                    from: data.from,
                    to: data.to,
                    promotion: data.promotion,
                    fen: fen
                });
                
                // Check for game over conditions
                if (game.isGameOver()) {
                    let result;
                    if (game.isCheckmate()) {
                        result = `Checkmate! ${playerColor === 'white' ? 'White' : 'Black'} wins!`;
                    } else if (game.isDraw()) {
                        if (game.isStalemate()) {
                            result = 'Draw by stalemate!';
                        } else if (game.isThreefoldRepetition()) {
                            result = 'Draw by threefold repetition!';
                        } else if (game.isInsufficientMaterial()) {
                            result = 'Draw by insufficient material!';
                        } else {
                            result = 'Draw!';
                        }
                    }
                    io.to(gameId).emit('gameOver', { result });
                }
            }
        } catch (error) {
            socket.emit('error', { message: 'Invalid move' });
        }
    });

    // Handle chat messages
    socket.on('sendMessage', (data) => {
        const gameId = socket.data.gameId;
        const playerColor = socket.data.color;
        
        if (gameId) {
            io.to(gameId).emit('message', {
                sender: playerColor,
                text: data.text
            });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        const gameId = socket.data.gameId;
        
        if (gameId && games[gameId]) {
            socket.to(gameId).emit('opponentDisconnected');
            
            // Remove the game after a delay if no one is connected
            setTimeout(() => {
                if (games[gameId] && io.sockets.adapter.rooms.get(gameId)?.size === 0) {
                    delete games[gameId];
                    console.log(`Game removed: ${gameId}`);
                }
            }, 60000); // 1 minute
        }
        
        console.log('Client disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
