import { socketManager, SocketEventHandlers, AIMoveCalculatedEvent, ErrorEvent } from '../network/SocketManager';

/**
 * ChessAIService - Provides a unified interface for AI chess moves across platforms
 * Uses the backend Stockfish engine via socket.io for consistent behavior
 */
export class ChessAIService {
  private moveResolve: ((move: string | null) => void) | null = null;
  private isInitialized = false;

  /**
   * Initialize the AI service
   * @returns Promise that resolves when the service is ready
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return Promise.resolve();
    }

    try {
      // Connect to the socket server if not already connected
      if (!socketManager.isConnected()) {
        await socketManager.connect();
      }

      // Set up event handlers for AI move responses
      socketManager.setEventHandlers({
      onAIMoveCalculated: (data: AIMoveCalculatedEvent) => {
          if (this.moveResolve) {
            if (data.move && /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(data.move)) {
              this.moveResolve(data.move.toLowerCase());
            } else {
              this.moveResolve(null);
            }
            this.moveResolve = null;
          }
        },
        onError: (data: ErrorEvent) => {
          if (this.moveResolve) {
            this.moveResolve(null);
            this.moveResolve = null;
          }
        }
      });

      this.isInitialized = true;
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Get an AI move for the given board position
   * @param fen FEN string representing the current board position
   * @returns Promise that resolves with the move in algebraic notation (e.g., 'e2e4')
   */
  public async getMove(fen: string): Promise<string | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!fen) {
        console.error('Invalid FEN string');
        return null;
      }

      // Request AI move from the server
      return new Promise<string | null>((resolve) => {
        // Store the resolve function
        this.moveResolve = resolve;
        
        // Track if we've already resolved to prevent multiple resolutions
        let hasResolved = false;
        
        // Create a wrapper function to ensure we only resolve once
        const safeResolve = (move: string | null) => {
          if (!hasResolved && this.moveResolve) {
            hasResolved = true;
            this.moveResolve(move);
            this.moveResolve = null;
          }
        };
        
        // Set up a timeout handler
        const timeoutId = setTimeout(() => {
          console.warn('AI move calculation timed out');
          safeResolve(null);
          
          // Re-initialize the event handlers to restore default behavior
          this.initialize().catch(err => {
            console.error('Failed to re-initialize AI service after timeout:', err);
          });
        }, 15000); // Increased to 15 seconds to give more time for calculation
        
        // Set up temporary event handlers for this move request
        socketManager.setEventHandlers({
          // Keep existing handlers for other events
          ...this.getDefaultEventHandlers(),
          
          // Override AI move handler
      onAIMoveCalculated: (data: AIMoveCalculatedEvent) => {
            clearTimeout(timeoutId);
            
            if (data.move && /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(data.move)) {
              console.log('Received valid AI move:', data.move);
              safeResolve(data.move.toLowerCase());
            } else {
              console.error('Received invalid AI move format:', data.move);
              safeResolve(null);
            }
            
            // Re-initialize the event handlers to restore default behavior
            this.initialize().catch(err => {
              console.error('Failed to re-initialize AI service after move:', err);
            });
          },
          
          // Override error handler
          onError: (data: ErrorEvent) => {
            clearTimeout(timeoutId);
            console.error('AI move error:', data.message);
            safeResolve(null);
            
            // Re-initialize the event handlers to restore default behavior
            this.initialize().catch(err => {
              console.error('Failed to re-initialize AI service after error:', err);
            });
          }
        });
        
        // Request the AI move
        console.log('Requesting AI move for FEN:', fen);
        socketManager.requestAIMove(fen);
      });
    } catch (error) {
      console.error('Error getting AI move:', error);
      return null;
    }
  }
  
  /**
   * Get the default event handlers for socket events
   * @returns Default event handlers object
   */
  private getDefaultEventHandlers(): SocketEventHandlers {
    return {
      onAIMoveCalculated: (data: AIMoveCalculatedEvent) => {
        if (this.moveResolve) {
          if (data.move && /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(data.move)) {
            this.moveResolve(data.move.toLowerCase());
          } else {
            this.moveResolve(null);
          }
          this.moveResolve = null;
        }
      },
      onError: (data: ErrorEvent) => {
        if (this.moveResolve) {
          this.moveResolve(null);
          this.moveResolve = null;
        }
      }
    };
  }

  /**
   * Stop the AI engine
   */
  public stop(): void {
    socketManager.stopEngine();
    if (this.moveResolve) {
      this.moveResolve(null);
      this.moveResolve = null;
    }
  }
}

// Create a singleton instance
export const chessAIService = new ChessAIService();
