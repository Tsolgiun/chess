import { Types } from 'mongoose';

// Mock User data
interface MockUser {
  _id: string;
  username: string;
  email: string;
  password: string;
  rating: number;
  wins: number;
  losses: number;
  draws: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mock Game data
interface MockGame {
  _id: string;
  whitePlayer: string;
  blackPlayer: string;
  status: 'pending' | 'active' | 'completed';
  result: 'white' | 'black' | 'draw' | null;
  winner: string | null;
  moves: string[];
  chat: {
    author: string;
    content: string;
    timestamp: Date;
  }[];
  timeControl: {
    initial: number;
    increment: number;
  };
  createdAt: Date;
  updatedAt: Date;
  startTime: Date | null;
  endTime: Date | null;
}

// In-memory database
class MockDatabase {
  private users: Map<string, MockUser> = new Map();
  private games: Map<string, MockGame> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId
  private usersByUsername: Map<string, string> = new Map(); // username -> userId

  // User methods
  async createUser(userData: Omit<MockUser, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockUser> {
    const _id = new Types.ObjectId().toString();
    const now = new Date();
    
    const user: MockUser = {
      _id,
      ...userData,
      createdAt: now,
      updatedAt: now
    };
    
    this.users.set(_id, user);
    this.usersByEmail.set(userData.email, _id);
    this.usersByUsername.set(userData.username, _id);
    
    return user;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.get(id) || null;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    const userId = this.usersByEmail.get(email);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findUserByUsername(username: string): Promise<MockUser | null> {
    const userId = this.usersByUsername.get(username);
    if (!userId) return null;
    return this.users.get(userId) || null;
  }

  async findUserByEmailOrUsername(email: string, username: string): Promise<MockUser | null> {
    const userByEmail = await this.findUserByEmail(email);
    if (userByEmail) return userByEmail;
    
    const userByUsername = await this.findUserByUsername(username);
    if (userByUsername) return userByUsername;
    
    return null;
  }

  // Game methods
  async createGame(gameData: Omit<MockGame, '_id' | 'createdAt' | 'updatedAt'>): Promise<MockGame> {
    const _id = new Types.ObjectId().toString();
    const now = new Date();
    
    const game: MockGame = {
      _id,
      ...gameData,
      createdAt: now,
      updatedAt: now
    };
    
    this.games.set(_id, game);
    return game;
  }

  async findGameById(id: string): Promise<MockGame | null> {
    return this.games.get(id) || null;
  }

  async findGamesByStatus(status: 'pending' | 'active' | 'completed'): Promise<MockGame[]> {
    return Array.from(this.games.values()).filter(game => game.status === status);
  }

  async findGamesByPlayer(playerId: string): Promise<MockGame[]> {
    return Array.from(this.games.values()).filter(
      game => game.whitePlayer === playerId || game.blackPlayer === playerId
    );
  }

  async updateGame(id: string, update: Partial<MockGame>): Promise<MockGame | null> {
    const game = this.games.get(id);
    if (!game) return null;
    
    const updatedGame = {
      ...game,
      ...update,
      updatedAt: new Date()
    };
    
    this.games.set(id, updatedGame);
    return updatedGame;
  }
}

// Export singleton instance
export const mockDb = new MockDatabase(); 