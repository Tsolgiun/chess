import { mockDb } from './mockDb';
import { Types } from 'mongoose';

export interface IGame {
  whitePlayer: Types.ObjectId;
  blackPlayer: Types.ObjectId;
  status: 'pending' | 'active' | 'completed';
  result: 'white' | 'black' | 'draw' | null;
  winner: Types.ObjectId | null;
  moves: string[];
  chat: {
    author: Types.ObjectId;
    content: string;
    timestamp: Date;
  }[];
  timeControl: {
    initial: number;
    increment: number;
  };
  startTime: Date | null;
  endTime: Date | null;
  populate: (path: string, select?: string) => Promise<IGame>;
  save: () => Promise<IGame>;
}

class MockGameModel {
  async create(gameData: Partial<IGame>): Promise<IGame> {
    const game = await mockDb.createGame({
      whitePlayer: gameData.whitePlayer!.toString(),
      blackPlayer: gameData.blackPlayer!.toString(),
      status: gameData.status || 'pending',
      result: gameData.result || null,
      winner: gameData.winner ? gameData.winner.toString() : null,
      moves: gameData.moves || [],
      chat: gameData.chat ? gameData.chat.map(msg => ({
        author: msg.author.toString(),
        content: msg.content,
        timestamp: msg.timestamp
      })) : [],
      timeControl: gameData.timeControl || { initial: 600, increment: 5 },
      startTime: gameData.startTime || null,
      endTime: gameData.endTime || null
    });
    
    return this.convertToGameWithMethods(game);
  }
  
  async findById(id: string | Types.ObjectId): Promise<IGame | null> {
    const game = await mockDb.findGameById(id.toString());
    if (!game) return null;
    
    return this.convertToGameWithMethods(game);
  }
  
  async find(query: any): Promise<IGame[]> {
    let games: any[] = [];
    
    if (query.status) {
      games = await mockDb.findGamesByStatus(query.status);
    } else if (query.$or) {
      // Handle $or query for whitePlayer or blackPlayer
      const whiteQuery = query.$or.find((q: any) => q.whitePlayer);
      const blackQuery = query.$or.find((q: any) => q.blackPlayer);
      
      if (whiteQuery && blackQuery) {
        const whitePlayerId = whiteQuery.whitePlayer.toString();
        const blackPlayerId = blackQuery.blackPlayer.toString();
        
        if (whitePlayerId === blackPlayerId) {
          games = await mockDb.findGamesByPlayer(whitePlayerId);
        }
      }
    } else {
      // Return all games (limited to 20 for safety)
      games = Array.from((await mockDb.findGamesByStatus('pending'))
        .concat(await mockDb.findGamesByStatus('active'))
        .concat(await mockDb.findGamesByStatus('completed')))
        .slice(0, 20);
    }
    
    return games.map(game => this.convertToGameWithMethods(game));
  }
  
  private convertToGameWithMethods(game: any): IGame {
    return {
      ...game,
      whitePlayer: new Types.ObjectId(game.whitePlayer),
      blackPlayer: new Types.ObjectId(game.blackPlayer),
      winner: game.winner ? new Types.ObjectId(game.winner) : null,
      chat: game.chat.map((msg: any) => ({
        ...msg,
        author: new Types.ObjectId(msg.author)
      })),
      
      // Add Mongoose-like methods
      populate: async (path: string, select?: string): Promise<IGame> => {
        // This is a simplified populate that doesn't actually do anything in the mock
        return this.convertToGameWithMethods(game);
      },
      
      save: async (): Promise<IGame> => {
        const updatedGame = await mockDb.updateGame(game._id, {
          status: game.status,
          result: game.result,
          winner: game.winner,
          moves: game.moves,
          chat: game.chat,
          startTime: game.startTime,
          endTime: game.endTime
        });
        
        return this.convertToGameWithMethods(updatedGame!);
      }
    };
  }
}

export const Game = new MockGameModel(); 