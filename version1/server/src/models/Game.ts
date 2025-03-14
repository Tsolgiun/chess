import mongoose, { Document, Model, Schema, Types } from 'mongoose';

interface IGame extends Document {
  whitePlayer: Types.ObjectId;
  blackPlayer?: Types.ObjectId | null;
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
    initial: number;  // Initial time in seconds
    increment: number; // Time increment per move in seconds
  };
  startTime: Date | null;
  endTime: Date | null;
  drawOfferedBy?: Types.ObjectId | null;
}

const gameSchema = new Schema<IGame>(
  {
    whitePlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    blackPlayer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    },
    result: {
      type: String,
      enum: ['white', 'black', 'draw', null],
      default: null
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    moves: [{
      type: String
    }],
    chat: [{
      author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    timeControl: {
      initial: {
        type: Number,
        required: true,
        default: 600  // 10 minutes
      },
      increment: {
        type: Number,
        required: true,
        default: 5     // 5 seconds
      }
    },
    startTime: {
      type: Date,
      default: null
    },
    endTime: {
      type: Date,
      default: null
    },
    drawOfferedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient queries
gameSchema.index({ whitePlayer: 1, status: 1 });
gameSchema.index({ blackPlayer: 1, status: 1 });
gameSchema.index({ status: 1, createdAt: -1 });

const Game = mongoose.model<IGame>('Game', gameSchema);

export { IGame, Game };
