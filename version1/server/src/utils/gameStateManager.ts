import { Chess } from 'chess.js';

// Map to store chess instances for each game
const gameInstances = new Map<string, Chess>();

/**
 * Get or create a chess instance for a game
 * @param gameId The game ID
 * @returns A chess instance for the game
 */
export const getChessInstance = (gameId: string): Chess => {
  if (!gameInstances.has(gameId)) {
    gameInstances.set(gameId, new Chess());
  }
  return gameInstances.get(gameId)!;
};

/**
 * Apply moves to a chess instance
 * @param chess The chess instance
 * @param moves Array of move strings (JSON)
 */
export const applyMoves = (chess: Chess, moves: string[]): void => {
  chess.reset();
  
  for (const moveStr of moves) {
    try {
      const move = JSON.parse(moveStr);
      chess.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion
      });
    } catch (error) {
      console.error('Error applying move:', error);
    }
  }
};

/**
 * Determine the game state based on chess instance and status
 * @param chess The chess instance
 * @param status The game status
 * @returns The game state string
 */
export const determineGameState = (chess: Chess, status: string): string => {
  if (status === 'pending') return 'waiting';
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isDraw()) return 'draw';
  if (chess.isStalemate()) return 'stalemate';
  if (status === 'resigned') return 'resigned';
  return 'playing';
};

/**
 * Clean up a chess instance
 * @param gameId The game ID
 */
export const cleanupChessInstance = (gameId: string): void => {
  if (gameInstances.has(gameId)) {
    gameInstances.delete(gameId);
  }
}; 