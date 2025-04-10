import { Chess, Move, Square } from 'chess.js';

export type PlayerColor = 'white' | 'black';
export type GameType = 'online' | 'ai' | 'local';
export type GameStatus = 'waiting' | 'active' | 'completed' | 'abandoned';

export interface GameStateOptions {
  fen?: string;
  playerColor?: PlayerColor | null;
  gameType?: GameType;
  gameId?: string | null;
}

/**
 * GameState - Manages the state of a chess game
 * Handles game logic, move validation, and game status
 */
export class GameState {
  private chess: Chess;
  private _playerColor: PlayerColor | null = null;
  private _gameType: GameType = 'online';
  private _gameId: string | null = null;
  private _lastMove: { from: string; to: string } | null = null;
  private _status: string = 'Welcome to Chess App!';
  private _gameOver: boolean = false;
  private _gameResult: string | null = null;
  private _drawOffered: boolean = false;
  private _drawOfferFrom: PlayerColor | null = null;

  /**
   * Create a new GameState instance
   * @param options Options for initializing the game state
   */
  constructor(options: GameStateOptions = {}) {
    // Initialize chess.js instance with optional FEN string
    this.chess = new Chess(options.fen);
    
    // Set player color if provided
    if (options.playerColor) {
      this._playerColor = options.playerColor;
    }
    
    // Set game type if provided
    if (options.gameType) {
      this._gameType = options.gameType;
    }
    
    // Set game ID if provided
    if (options.gameId) {
      this._gameId = options.gameId;
    }
    
    // Update status based on initial state
    this.updateStatus();
  }

  /**
   * Get the current FEN string
   */
  public get fen(): string {
    return this.chess.fen();
  }

  /**
   * Get the player's color
   */
  public get playerColor(): PlayerColor | null {
    return this._playerColor;
  }

  /**
   * Set the player's color
   */
  public set playerColor(color: PlayerColor | null) {
    this._playerColor = color;
  }

  /**
   * Get the game type
   */
  public get gameType(): GameType {
    return this._gameType;
  }

  /**
   * Set the game type
   */
  public set gameType(type: GameType) {
    this._gameType = type;
  }

  /**
   * Get the game ID
   */
  public get gameId(): string | null {
    return this._gameId;
  }

  /**
   * Set the game ID
   */
  public set gameId(id: string | null) {
    this._gameId = id;
  }

  /**
   * Get the last move
   */
  public get lastMove(): { from: string; to: string } | null {
    return this._lastMove;
  }

  /**
   * Get the current game status text
   */
  public get status(): string {
    return this._status;
  }

  /**
   * Get whether the game is over
   */
  public get gameOver(): boolean {
    return this._gameOver;
  }

  /**
   * Get the game result text
   */
  public get gameResult(): string | null {
    return this._gameResult;
  }

  /**
   * Get whether a draw has been offered
   */
  public get drawOffered(): boolean {
    return this._drawOffered;
  }

  /**
   * Set whether a draw has been offered
   */
  public set drawOffered(offered: boolean) {
    this._drawOffered = offered;
  }

  /**
   * Get which player offered the draw
   */
  public get drawOfferFrom(): PlayerColor | null {
    return this._drawOfferFrom;
  }

  /**
   * Set which player offered the draw
   */
  public set drawOfferFrom(player: PlayerColor | null) {
    this._drawOfferFrom = player;
  }

  /**
   * Get the current turn
   * @returns 'w' for white, 'b' for black
   */
  public get turn(): 'w' | 'b' {
    return this.chess.turn();
  }

  /**
   * Get whether it's the player's turn
   */
  public get isPlayerTurn(): boolean {
    if (!this._playerColor) return false;
    return (this.turn === 'w' && this._playerColor === 'white') || 
           (this.turn === 'b' && this._playerColor === 'black');
  }

  /**
   * Get whether it's the AI's turn
   */
  public get isAITurn(): boolean {
    if (this._gameType !== 'ai' || !this._playerColor) return false;
    return (this.turn === 'w' && this._playerColor === 'black') || 
           (this.turn === 'b' && this._playerColor === 'white');
  }

  /**
   * Make a move on the board
   * @param move Move object with from, to, and optional promotion
   * @returns The move object if successful, null if invalid
   */
  public makeMove(move: { from: string; to: string; promotion?: string }): Move | null {
    try {
      // Attempt to make the move
      const result = this.chess.move({
        from: move.from as Square,
        to: move.to as Square,
        promotion: move.promotion
      });
      
      if (result) {
        // Store the last move
        this._lastMove = { from: move.from, to: move.to };
        
        // Update game status
        this.updateStatus();
        
        return result;
      }
      
      return null;
    } catch (error) {
      console.error('Invalid move:', error);
      return null;
    }
  }

  /**
   * Update the game status based on the current board state
   */
  private updateStatus(): void {
    if (this.chess.isGameOver()) {
      this._gameOver = true;
      
      if (this.chess.isCheckmate()) {
        const winner = this.chess.turn() === 'w' ? 'Black' : 'White';
        this._status = `Checkmate! ${winner} wins!`;
        this._gameResult = this._status;
      } else if (this.chess.isDraw()) {
        if (this.chess.isStalemate()) {
          this._status = 'Game over! Stalemate!';
        } else if (this.chess.isThreefoldRepetition()) {
          this._status = 'Game over! Draw by threefold repetition!';
        } else if (this.chess.isInsufficientMaterial()) {
          this._status = 'Game over! Draw by insufficient material!';
        } else {
          this._status = 'Game over! Draw!';
        }
        this._gameResult = this._status;
      }
    } else {
      const turn = this.chess.turn() === 'w' ? 'White' : 'Black';
      this._status = `${turn} to move`;
      
      if (this.chess.isCheck()) {
        this._status += ', Check!';
      }
    }
  }

  /**
   * Get all legal moves for a square
   * @param square The square to get moves for (e.g., 'e2')
   * @returns Array of legal moves
   */
  public getLegalMoves(square: string): string[] {
    try {
      const moves = this.chess.moves({ 
        square: square as Square, 
        verbose: true 
      });
      return moves.map(move => move.to);
    } catch (error) {
      console.error('Error getting legal moves:', error);
      return [];
    }
  }

  /**
   * Get the piece at a square
   * @param square The square to get the piece from (e.g., 'e2')
   * @returns The piece object or null if empty
   */
  public getPiece(square: string): { type: string; color: string } | null {
    const piece = this.chess.get(square as Square);
    return piece || null;
  }

  /**
   * Reset the game to the initial position
   */
  public reset(): void {
    this.chess.reset();
    this._lastMove = null;
    this._gameOver = false;
    this._gameResult = null;
    this._drawOffered = false;
    this._drawOfferFrom = null;
    this.updateStatus();
  }

  /**
   * Load a position from a FEN string
   * @param fen FEN string representing the position
   * @returns True if successful, false if invalid FEN
   */
  public loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      this.updateStatus();
      return true;
    } catch (error) {
      console.error('Invalid FEN string:', error);
      return false;
    }
  }

  /**
   * Set the game as over with a result
   * @param result The game result text
   */
  public setGameOver(result: string): void {
    this._gameOver = true;
    this._gameResult = result;
    this._status = result;
  }

  /**
   * Create a deep copy of the current game state
   * @returns A new GameState instance with the same state
   */
  public clone(): GameState {
    const newState = new GameState({
      fen: this.fen,
      playerColor: this._playerColor,
      gameType: this._gameType,
      gameId: this._gameId
    });
    
    newState._lastMove = this._lastMove ? { ...this._lastMove } : null;
    newState._gameOver = this._gameOver;
    newState._gameResult = this._gameResult;
    newState._drawOffered = this._drawOffered;
    newState._drawOfferFrom = this._drawOfferFrom;
    newState._status = this._status;
    
    return newState;
  }
}
