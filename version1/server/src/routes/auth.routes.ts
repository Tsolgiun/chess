import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { auth } from '../middleware/auth';
import { Types } from 'mongoose';

const router = express.Router();

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    [key: string]: any;
  };
}

interface JwtPayload {
  userId: string;
}

const createJwtToken = (user: IUser & { _id: Types.ObjectId }): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
  const payload: JwtPayload = { userId: user._id.toString() };

  return jwt.sign(
    payload,
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

// Register user
router.post(
  '/register',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  async (req: RegisterRequest, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, email, password } = req.body;

      // Check if user already exists
      let existingUser = await User.findOne({ $or: [{ email }, { username }] });
      if (existingUser) {
        return res.status(400).json({
          message: 'User already exists with that username or email'
        });
      }

      // Create new user
      const user = (await User.create({
        username,
        email,
        password
      })) as IUser & { _id: Types.ObjectId };

      // Create JWT token
      const token = createJwtToken(user);

      res.status(201).json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          rating: user.rating,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws
        }
      });
    } catch (error) {
      console.error('Error in register:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  async (req: LoginRequest, res: Response) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Check if user exists
      const user = (await User.findByEmail(email)) as (IUser & { _id: Types.ObjectId }) | null;
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Create JWT token
      const token = createJwtToken(user);

      res.json({
        token,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          rating: user.rating,
          wins: user.wins,
          losses: user.losses,
          draws: user.draws
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Get current user
router.get('/me', auth, (async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).user._id;
    const user = await User.findById(new Types.ObjectId(userId)).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error in get current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
}) as express.RequestHandler);

export default router;
