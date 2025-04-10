const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    socketId: String,
    color: {
        type: String,
        enum: ['white', 'black']
    },
    platform: {
        type: String,
        enum: ['web', 'mobile', 'unknown'],
        default: 'unknown'
    }
});

const gameSchema = new mongoose.Schema({
    gameId: {
        type: String,
        required: true,
        unique: true
    },
    fen: {
        type: String,
        required: true,
        default: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Initial chess position
    },
    players: [playerSchema],
    status: {
        type: String,
        enum: ['waiting', 'active', 'completed', 'abandoned'],
        default: 'waiting'
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    winner: {
        type: String,
        enum: ['white', 'black', 'draw', null],
        default: null
    }
}, {
    timestamps: true
});

// Add index for cleanup of old games
gameSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 24 * 60 * 60 }); // Auto-delete after 24 hours of inactivity

module.exports = mongoose.model('Game', gameSchema);
