import { GameState, GameType, PlayerColor } from './GameState';
import { socketManager } from '../network/SocketManager';
import { chessAIService } from '../ai/ChessAIService';
import { currentPlatform } from '../platform/PlatformFactory';

/**
 * GameManager - Manages the game state and interactions
 * Provides a unified interface for game management across platforms
 */
export class GameManager {
  private gameState: GameState;
  private isAIThinking: boolean = false;

  /**
   * Create a new GameManager instance
   */
  constructor() {
    this.gameState = new GameState();
    this.setupSocketEventHandlers();
  }

  /**
   * Set up socket event handlers
   */
  private setupSocketEventHandlers(): void {
    socketManager.setEventHandlers({
      onGameCreated: (data) => {
        this.gameState.gameId = data.gameId;
        this.gameState.playerColor = data.color;
        this.gameState.gameType = 'online';
      },
      onGameJoined: (data) => {
        this.gameState.gameId = data.gameId;
        this.gameState.playerColor = data.color;
        this.gameState.gameType = 'online';
        
        if (data.fen) {
          this.gameState.loadFen(data.fen);
        }
      },
      onMoveMade: (data) => {
        this.gameState.loadFen(data.fen);
      },
      onGameOver: (data) => {
        this.gameState.setGameOver(data.result);
      },
      onDrawOffered: (data) => {
        this.gameState.drawOffered = true;
        this.gameState.drawOfferFrom = data.from;
      },
      onDrawDeclined: () => {
        this.gameState.drawOffered = false;
        this.gameState.drawOfferFrom = null;
      }
    });
  }

  /**
   * Connect to the server
   * @returns Promise that resolves when connected
   */
  public async connect(): Promise<void> {
    try {
      await socketManager.connect();
    } catch (error) {
      console.error('Failed to connect to server:', error);
      throw error;
    }
  }

  /**
   * Create a new online game
   */
  public createOnlineGame(): void {
    this.resetGame();
    this.gameState.gameType = 'online';
    socketManager.createGame();
  }

  /**
   * Join an existing online game
   * @param gameId ID of the game to join
   */
  public joinOnlineGame(gameId: string): void {
    this.resetGame();
    this.gameState.gameType = 'online';
    socketManager.joinGame(gameId);
  }

  /**
   * Start a new game against the AI
   * @param playerColor Color the player wants to play as
   */
  public async startAIGame(playerColor: PlayerColor = 'white'): Promise<void> {
    this.resetGame();
    this.gameState.gameType = 'ai';
    this.gameState.playerColor = playerColor;
    
    // Initialize AI service
    await chessAIService.initialize();
    
    // If AI plays first (player is black), make an AI move
    if (playerColor === 'black') {
      this.makeAIMove();
    }
  }

  /**
   * Make a move on the board
   * @param from Source square (e.g., 'e2')
   * @param to Destination square (e.g., 'e4')
   * @param promotion Optional promotion piece ('q', 'r', 'b', 'n')
   * @returns True if the move was successful, false otherwise
   */
  public makeMove(from: string, to: string, promotion?: string): boolean {
    // Check if it's the player's turn
    if (!this.gameState.isPlayerTurn) {
      console.warn('Not your turn');
      return false;
    }
    
    // Attempt to make the move
    const result = this.gameState.makeMove({ from, to, promotion });
    
    if (result) {
      // If it's an online game, send the move to the server
      if (this.gameState.gameType === 'online') {
        socketManager.makeMove({ from, to, promotion });
      }
      
      // If it's an AI game and the move was successful, make an AI move
      if (this.gameState.gameType === 'ai' && !this.gameState.gameOver) {
        this.makeAIMove();
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Make an AI move
   */
  private async makeAIMove(): Promise<void> {
    if (this.isAIThinking || this.gameState.gameOver || this.gameState.gameType !== 'ai') {
      return;
    }
    
    this.isAIThinking = true;
    
    try {
      const move = await chessAIService.getMove(this.gameState.fen);
      
      if (move) {
        const from = move.substring(0, 2);
        const to = move.substring(2, 4);
        const promotion = move.length === 5 ? move[4] : undefined;
        
        this.gameState.makeMove({ from, to, promotion });
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      this.isAIThinking = false;
    }
  }

  /**
   * Resign the current game
   */
  public resignGame(): void {
    if (this.gameState.gameOver) {
      return;
    }
    
    if (this.gameState.gameType === 'online') {
      socketManager.resignGame();
    } else {
      this.gameState.setGameOver('Game Over - You resigned');
    }
  }

  /**
   * Offer a draw to the opponent
   */
  public offerDraw(): void {
    if (this.gameState.gameOver || this.gameState.gameType !== 'online') {
      return;
    }
    
    socketManager.offerDraw();
  }

  /**
   * Accept a draw offer
   */
  public acceptDraw(): void {
    if (this.gameState.gameOver || !this.gameState.drawOffered || this.gameState.gameType !== 'online') {
      return;
    }
    
    socketManager.acceptDraw();
  }

  /**
   * Decline a draw offer
   */
  public declineDraw(): void {
    if (this.gameState.gameOver || !this.gameState.drawOffered || this.gameState.gameType !== 'online') {
      return;
    }
    
    socketManager.declineDraw();
    this.gameState.drawOffered = false;
    this.gameState.drawOfferFrom = null;
  }

  /**
   * Reset the game state
   */
  public resetGame(): void {
    this.gameState.reset();
    this.gameState.gameId = null;
    this.gameState.playerColor = null;
    this.isAIThinking = false;
  }

  /**
   * Get the current game state
   * @returns The current game state
   */
  public getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Check if the AI is thinking
   * @returns True if the AI is thinking, false otherwise
   */
  public isAIProcessing(): boolean {
    return this.isAIThinking;
  }

  /**
   * Get the legal moves for a square
   * @param square The square to get moves for (e.g., 'e2')
   * @returns Array of legal moves
   */
  public getLegalMoves(square: string): string[] {
    return this.gameState.getLegalMoves(square);
  }

  /**
   * Get the piece at a square
   * @param square The square to get the piece from (e.g., 'e2')
   * @returns The piece object or null if empty
   */
  public getPiece(square: string): { type: string; color: string } | null {
    return this.gameState.getPiece(square);
  }
}

// Create a singleton instance
export const gameManager = new GameManager();
