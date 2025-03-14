import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

interface JwtPayload {
  userId: string;
}

interface AuthenticatedRequest extends Request {
  user: {
    _id: string;
    username: string;
    email: string;
  };
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No auth token found' });
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-here';
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    // Check if user still exists
    const user = await User.findById(new Types.ObjectId(decoded.userId)) as (IUser & { _id: Types.ObjectId }) | null;
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    (req as AuthenticatedRequest).user = {
      _id: user._id.toString(),
      username: user.username,
      email: user.email
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};
