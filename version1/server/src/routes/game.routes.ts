import { Request, Response, Router } from 'express';
import { RequestHandler } from 'express-serve-static-core';
import { auth } from '../middleware/auth';
import { Game, IGame } from '../models/Game';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

const router = Router();

interface AuthUser {
  _id: string;
  username: string;
  email: string;
}

interface TimeControlBody {
  timeControl?: {
    initial?: number;
    increment?: number;
  };
}

// Extend base Request type to include authenticated user
interface AuthRequest<T = any> extends Request<any, any, T> {
  user: AuthUser;
}

// Create a new game
const createGame: RequestHandler<{}, any, TimeControlBody> = async (req, res) => {
  try {
    const userId = new Types.ObjectId((req as AuthRequest).user._id);
    const { timeControl } = req.body;

    const game = await Game.create({
      whitePlayer: userId,
      blackPlayer: undefined, // Start with no black player
      status: 'pending',
      timeControl: {
        initial: timeControl?.initial || 600,
        increment: timeControl?.increment || 5
      },
      moves: [] // Initialize empty moves array
    });

    await game.populate('whitePlayer', 'username rating');

    res.status(201).json(game);
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Join a game
const joinGame: RequestHandler = async (req, res) => {
  try {
    const gameId = req.params.id;
    const userId = new Types.ObjectId((req as AuthRequest).user._id);

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    if (game.status !== 'pending') {
      return res.status(400).json({ message: 'Game is no longer available' });
    }

    if (game.whitePlayer.toString() === userId.toString()) {
      // If this is the user's own game, just return the game without error
      // This allows the creator to view their own game while waiting for an opponent
      await game.populate('whitePlayer', 'username rating');
      return res.json(game);
    }

    game.blackPlayer = userId;
    game.status = 'active';
    game.startTime = new Date();
    await game.save();

    await game.populate('whitePlayer blackPlayer', 'username rating');
    
    res.json(game);
  } catch (error) {
    console.error('Error joining game:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get list of available games
const getAvailableGames: RequestHandler = async (_req, res) => {
  try {
    const games = await Game.find({ status: 'pending' })
      .populate('whitePlayer', 'username rating')
      .sort('-createdAt')
      .limit(20);

    res.json(games);
  } catch (error) {
    console.error('Error fetching available games:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's active games
const getActiveGames: RequestHandler = async (req, res) => {
  try {
    const userId = new Types.ObjectId((req as AuthRequest).user._id);
    
    const games = await Game.find({
      $or: [
        { whitePlayer: userId },
        { blackPlayer: userId }
      ],
      status: 'active'
    })
      .populate('whitePlayer blackPlayer', 'username rating')
      .sort('-createdAt');

    res.json(games);
  } catch (error) {
    console.error('Error fetching active games:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's active games
const getMyGames: RequestHandler = async (req, res) => {
  try {
    const userId = new Types.ObjectId((req as AuthRequest).user._id);
    
    const games = await Game.find({
      $or: [
        { whitePlayer: userId },
        { blackPlayer: userId }
      ],
      status: { $in: ['pending', 'active'] }
    })
      .populate('whitePlayer blackPlayer', 'username rating')
      .sort('-createdAt');

    res.json(games);
  } catch (error) {
    console.error('Error fetching user games:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get game by ID
const getGameById: RequestHandler = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id)
      .populate('whitePlayer blackPlayer', 'username rating');

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    res.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's game history
const getGameHistory: RequestHandler = async (req, res) => {
  try {
    const userId = new Types.ObjectId(req.params.userId);
    
    const games = await Game.find({
      $or: [
        { whitePlayer: userId },
        { blackPlayer: userId }
      ],
      status: 'completed'
    })
      .populate('whitePlayer blackPlayer', 'username rating')
      .sort('-endTime')
      .limit(20);

    res.json(games);
  } catch (error) {
    console.error('Error fetching game history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Configure routes - Order matters! More specific routes should come before generic ones
router.post('/create', auth, createGame);
router.get('/available', auth, getAvailableGames);
router.get('/active', auth, getActiveGames);
router.get('/my-games', auth, getMyGames);
router.get('/history/:userId', auth, getGameHistory);
router.post('/:id/join', auth, joinGame);
router.get('/:id', auth, getGameById);

export default router;
