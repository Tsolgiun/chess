import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes';
import gameRoutes from './routes/game.routes';
import { initializeSocketHandlers } from './socket/handlers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  },
  // Add these configurations for better connection stability
  pingTimeout: 60000,
  pingInterval: 25000,
  transports: ['websocket', 'polling'],
  allowEIO3: true,
  connectTimeout: 30000
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chess';

// Connect to MongoDB with proper error handling
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/games', gameRoutes);
    
    // Socket.io handlers
    initializeSocketHandlers(io);
    
    // Start server
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('Please check your MongoDB connection string and ensure MongoDB is running.');
    process.exit(1); // Exit the application if MongoDB connection fails
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Chess API is running');
});
