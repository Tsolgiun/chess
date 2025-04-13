require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { Chess } = require('chess.js');
const connectDB = require('./config/database');
const auth = require('./middleware/auth');
const AuthController = require('./controllers/AuthController');
const Game = require('./models/Game');
const stockfishController = require('./controllers/StockfishController');

async function startServer() {
    try {
        // Initialize Stockfish engine
        console.log('Initializing Stockfish...');
        await stockfishController.initialize();
        console.log('Stockfish initialized successfully');

        // Connect to MongoDB
        await connectDB();

        // Initialize Express and Socket.io
        const app = express();

// Enable CORS
app.use((req, res, next) => {
    // Allow multiple origins
    const allowedOrigins = [
        'http://localhost:3000',         // Web app local
        'http://100.65.144.222:3000',    // Web app from other devices
        'http://100.65.144.222:3001',    // For mobile devices
        'http://192.168.56.1:3000',      // Backup IP for web app
        'http://192.168.56.1:3001',      // Backup IP for mobile devices
        'http://10.0.2.2:3001',          // Android emulator
        'http://localhost:3001'          // Additional local testing
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());  // Add JSON body parser

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: [
            "http://localhost:3000", 
            "http://100.65.144.222:3000",
            "http://100.65.144.222:3001",
            "http://192.168.56.1:3000",
            "http://192.168.56.1:3001",
            "http://10.0.2.2:3001", 
            "http://localhost:3001"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
    }
});

// Auth routes
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);
app.get('/api/profile', auth, AuthController.getProfile);
app.put('/api/profile', auth, AuthController.updateProfile);

// Move calculation endpoint for Stockfish
app.post('/api/stockfish/move', async (req, res) => {
    const { fen } = req.body;
    
    if (!fen) {
        return res.status(400).json({ error: 'FEN string is required' });
    }

    try {
        if (!stockfishController.isReady) {
            throw new Error('Stockfish engine not ready');
        }
        
        const move = await stockfishController.getMove(fen);
        res.json({ move });
    } catch (error) {
        console.error('Stockfish error:', error);
        res.status(500).json({ error: 'Failed to calculate move: ' + error.message });
    }
});

// Analysis endpoint for Stockfish
app.post('/api/stockfish/analyze', async (req, res) => {
    const { fen, depth } = req.body;
    
    if (!fen) {
        return res.status(400).json({ error: 'FEN string is required' });
    }

    try {
        if (!stockfishController.isReady) {
            throw new Error('Stockfish engine not ready');
        }
        
        const analysisLines = await stockfishController.analyze(fen, depth || 20);
        res.json({ analysisLines });
    } catch (error) {
        console.error('Stockfish analysis error:', error);
        res.status(500).json({ error: 'Failed to analyze position: ' + error.message });
    }
});

// In-memory cache for active games
const games = {};

// Cleanup old games periodically (every hour)
setInterval(async () => {
    try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        await Game.updateMany(
            { lastActivity: { $lt: oneHourAgo }, status: 'active' },
            { $set: { status: 'abandoned' } }
        );
    } catch (error) {
        console.error('Cleanup error:', error);
    }
}, 60 * 60 * 1000);

// Generate a random game ID
function generateGameId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Store platform information
    socket.on('setPlatform', (data) => {
        socket.data.platform = data.platform;
        console.log(`Client ${socket.id} is using ${data.platform} platform`);
    });

    // Create a new game
    socket.on('createGame', async () => {
        try {
            const gameId = generateGameId();
            const chess = new Chess();
            
            // Create game in database
            const game = await Game.create({
                gameId,
                fen: chess.fen(),
                players: [{ 
                    socketId: socket.id, 
                    color: 'white',
                    platform: socket.data.platform || 'unknown'
                }],
                status: 'waiting'
            });
            
            // Cache game in memory
            games[gameId] = {
                chess,
                players: {
                    white: socket.id,
                    black: null
                }
            };
            
            socket.join(gameId);
            socket.data.color = 'white';
            socket.data.gameId = gameId;
            socket.emit('gameCreated', { 
                gameId, 
                color: 'white',
                platform: socket.data.platform || 'unknown'
            });
        } catch (error) {
            console.error('Create game error:', error);
            socket.emit('error', { message: 'Failed to create game' });
        }
    });

    // Join an existing game
    socket.on('joinGame', async (data) => {
        try {
            const gameId = data.gameId;
            let dbGame = await Game.findOne({ gameId });
            
            if (!dbGame) {
                socket.emit('error', { message: 'Game not found' });
                return;
            }
            
            if (dbGame.players.length >= 2) {
                socket.emit('error', { message: 'Game is full' });
                return;
            }
            
            // Initialize game in memory if not exists
            if (!games[gameId]) {
                const chess = new Chess(dbGame.fen);
                games[gameId] = {
                    chess,
                    players: {
                        white: dbGame.players.find(p => p.color === 'white')?.socketId,
                        black: null
                    }
                };
            }
            
            // Update database
            dbGame.players.push({ 
                socketId: socket.id, 
                color: 'black',
                platform: socket.data.platform || 'unknown'
            });
            dbGame.status = 'active';
            await dbGame.save();
            
            // Update memory
            socket.join(gameId);
            socket.data.color = 'black';
            socket.data.gameId = gameId;
            games[gameId].players.black = socket.id;
            
            // Get opponent's platform
            const opponent = dbGame.players.find(p => p.socketId !== socket.id);
            
            socket.emit('gameJoined', { 
                gameId, 
                color: 'black',
                fen: games[gameId].chess.fen(),
                opponentPlatform: opponent?.platform || 'unknown'
            });
            
            socket.to(gameId).emit('opponentJoined', {
                platform: socket.data.platform || 'unknown'
            });
        } catch (error) {
            console.error('Join game error:', error);
            socket.emit('error', { message: 'Failed to join game' });
        }
    });

    // Handle a move
    socket.on('move', async (data) => {
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
                try {
                    // Update database with new position
                    const fen = game.fen();
                    await Game.findOneAndUpdate(
                        { gameId },
                        { 
                            $set: { 
                                fen,
                                lastActivity: new Date()
                            }
                        }
                    );

                    // Broadcast the move
                    io.to(gameId).emit('moveMade', {
                        from: data.from,
                        to: data.to,
                        promotion: data.promotion,
                        fen: fen
                    });
                    
                    // Check for game over conditions
                    if (game.isGameOver()) {
                        let result;
                        let winner = null;
                        
                        if (game.isCheckmate()) {
                            winner = playerColor;
                            result = `Checkmate! ${playerColor === 'white' ? 'White' : 'Black'} wins!`;
                        } else if (game.isDraw()) {
                            winner = 'draw';
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

                        // Update game status in database
                        await Game.findOneAndUpdate(
                            { gameId },
                            { 
                                $set: { 
                                    status: 'completed',
                                    winner
                                }
                            }
                        );

                        io.to(gameId).emit('gameOver', { result });
                    }
                } catch (error) {
                    console.error('Move update error:', error);
                }
            }
        } catch (error) {
            socket.emit('error', { message: 'Invalid move' });
        }
    });

    // Handle resign
    socket.on('resign', async () => {
        const gameId = socket.data.gameId;
        const playerColor = socket.data.color;
        
        if (!gameId || !games[gameId]) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        try {
            // Update game status in database
            await Game.findOneAndUpdate(
                { gameId },
                { 
                    $set: { 
                        status: 'completed',
                        winner: playerColor === 'white' ? 'black' : 'white'
                    }
                }
            );

            const result = `Game Over - ${playerColor === 'white' ? 'Black' : 'White'} wins by resignation`;
            io.to(gameId).emit('gameOver', { result });
        } catch (error) {
            console.error('Resign error:', error);
            socket.emit('error', { message: 'Failed to resign game' });
        }
    });

    // Handle draw offer
    socket.on('offerDraw', () => {
        const gameId = socket.data.gameId;
        const playerColor = socket.data.color;
        
        if (gameId) {
            socket.to(gameId).emit('drawOffered', { from: playerColor });
        }
    });

    // Handle draw acceptance
    socket.on('acceptDraw', async () => {
        const gameId = socket.data.gameId;
        
        if (!gameId || !games[gameId]) {
            socket.emit('error', { message: 'Game not found' });
            return;
        }

        try {
            // Update game status in database
            await Game.findOneAndUpdate(
                { gameId },
                { 
                    $set: { 
                        status: 'completed',
                        winner: 'draw'
                    }
                }
            );

            io.to(gameId).emit('gameOver', { result: 'Game Over - Draw by agreement' });
        } catch (error) {
            console.error('Draw acceptance error:', error);
            socket.emit('error', { message: 'Failed to process draw acceptance' });
        }
    });

    // Handle draw decline
    socket.on('declineDraw', () => {
        const gameId = socket.data.gameId;
        const playerColor = socket.data.color;
        
        if (gameId) {
            socket.to(gameId).emit('drawDeclined', { from: playerColor });
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

    // Handle AI move requests
    socket.on('requestAIMove', async (data) => {
        console.log('Received AI move request with FEN:', data.fen);
        
        // Validate FEN string
        if (!data.fen || typeof data.fen !== 'string') {
            console.error('Invalid FEN string received');
            socket.emit('error', { message: 'Invalid FEN string' });
            return;
        }
        
        try {
            if (!stockfishController.isReady) {
                console.error('Stockfish engine not ready');
                socket.emit('error', { message: 'Stockfish engine not ready' });
                return;
            }
            
            console.log('Requesting move from Stockfish engine...');
            const move = await stockfishController.getMove(data.fen);
            
            if (!move) {
                console.error('Stockfish returned null or empty move');
                socket.emit('error', { message: 'Failed to calculate a valid move' });
                return;
            }
            
            console.log('Stockfish calculated move:', move);
            
            // Validate move format before sending
            if (!/^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(move)) {
                console.error('Invalid move format returned by Stockfish:', move);
                socket.emit('error', { message: 'Invalid move format returned by engine' });
                return;
            }
            
            // Emit the calculated move
            socket.emit('aiMoveCalculated', { move });
            console.log('Emitted aiMoveCalculated event with move:', move);
        } catch (error) {
            console.error('AI move calculation error:', error);
            socket.emit('error', { message: 'AI move calculation failed: ' + error.message });
        }
    });

    // Handle stop engine requests
    socket.on('stopEngine', () => {
        stockfishController.stop();
    });

    socket.on('disconnect', async () => {
        const gameId = socket.data.gameId;
        
        if (gameId && games[gameId]) {
            socket.to(gameId).emit('opponentDisconnected');
            
            try {
                // Update player's connection status in database
                await Game.findOneAndUpdate(
                    { gameId },
                    { 
                        $pull: { players: { socketId: socket.id } },
                        lastActivity: new Date()
                    }
                );
                
                // Remove game from memory after delay if no one is connected
                setTimeout(async () => {
                    if (games[gameId] && io.sockets.adapter.rooms.get(gameId)?.size === 0) {
                        delete games[gameId];
                        
                        // Update game status in database
                        await Game.findOneAndUpdate(
                            { gameId },
                            { status: 'abandoned' }
                        );
                        
                        console.log(`Game removed: ${gameId}`);
                    }
                }, 60000); // 1 minute
            } catch (error) {
                console.error('Disconnect error:', error);
            }
        }
        
        console.log('Client disconnected:', socket.id);
    });
});

        const PORT = process.env.PORT || 3001;
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Cleanup on server shutdown
process.on('SIGINT', () => {
    stockfishController.quit();
    process.exit();
});

process.on('SIGTERM', () => {
    stockfishController.quit();
    process.exit();
});
