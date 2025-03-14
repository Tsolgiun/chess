import { mockDb } from './mockDb';
import bcrypt from 'bcryptjs';
import { Types } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  password: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

class MockUserModel {
  async create(userData: Partial<IUser>): Promise<IUser & { _id: Types.ObjectId }> {
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password!, salt);
    
    const user = await mockDb.createUser({
      username: userData.username!,
      email: userData.email!,
      password: hashedPassword,
      rating: userData.rating || 1200,
      wins: userData.wins || 0,
      losses: userData.losses || 0,
      draws: userData.draws || 0
    });
    
    // Add comparePassword method
    const userWithMethods = {
      ...user,
      _id: new Types.ObjectId(user._id),
      comparePassword: async (candidatePassword: string): Promise<boolean> => {
        return bcrypt.compare(candidatePassword, user.password);
      }
    };
    
    return userWithMethods;
  }
  
  async findOne(query: { email?: string; username?: string; $or?: any[] }): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    let user = null;
    
    if (query.email) {
      user = await mockDb.findUserByEmail(query.email);
    } else if (query.username) {
      user = await mockDb.findUserByUsername(query.username);
    } else if (query.$or) {
      // Handle $or query for email or username
      const emailQuery = query.$or.find(q => q.email);
      const usernameQuery = query.$or.find(q => q.username);
      
      if (emailQuery && usernameQuery) {
        user = await mockDb.findUserByEmailOrUsername(emailQuery.email, usernameQuery.username);
      }
    }
    
    if (!user) return null;
    
    // Add comparePassword method
    const userWithMethods = {
      ...user,
      _id: new Types.ObjectId(user._id),
      comparePassword: async (candidatePassword: string): Promise<boolean> => {
        return bcrypt.compare(candidatePassword, user!.password);
      }
    };
    
    return userWithMethods;
  }
  
  async findById(id: string | Types.ObjectId): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    const user = await mockDb.findUserById(id.toString());
    
    if (!user) return null;
    
    // Add comparePassword method
    const userWithMethods = {
      ...user,
      _id: new Types.ObjectId(user._id),
      comparePassword: async (candidatePassword: string): Promise<boolean> => {
        return bcrypt.compare(candidatePassword, user.password);
      }
    };
    
    return userWithMethods;
  }
  
  async findByEmail(email: string): Promise<(IUser & { _id: Types.ObjectId }) | null> {
    const user = await mockDb.findUserByEmail(email);
    
    if (!user) return null;
    
    // Add comparePassword method
    const userWithMethods = {
      ...user,
      _id: new Types.ObjectId(user._id),
      comparePassword: async (candidatePassword: string): Promise<boolean> => {
        return bcrypt.compare(candidatePassword, user.password);
      }
    };
    
    return userWithMethods;
  }
}

export const User = new MockUserModel(); 