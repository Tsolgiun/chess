import Board from './Board.js';
import MoveHistory from './MoveHistory.js';

class Game {
    constructor() {
        this.board = new Board();
        this.selectedSquare = null;
        this.gameStatus = 'active';
        this.moveHistory = new MoveHistory();
    }

    /**
     * Handle a square selection on the board
     * @param {{x: number, y: number}} position - Selected square position
     * @returns {boolean} Whether the selection was handled
     */
    handleSquareSelection(position) {
        const piece = this.board.getPiece(position);

        // If no square is selected, select this square if it has a piece of the current turn
        if (!this.selectedSquare) {
            if (piece && piece.color === this.board.currentTurn) {
                this.selectedSquare = position;
                return true;
            }
            return false;
        }

        // If a square is already selected...
        const selectedPiece = this.board.getPiece(this.selectedSquare);

        // If clicking the same square, deselect it
        if (position.x === this.selectedSquare.x && position.y === this.selectedSquare.y) {
            this.selectedSquare = null;
            return true;
        }

        // Try to move the selected piece
        const targetPiece = this.board.getPiece(position);
        const success = this.board.movePiece(this.selectedSquare, position);
        
        if (success) {
            // Update game status before recording the move
            if (this.board.isCheckmate()) {
                this.gameStatus = 'checkmate';
            } else if (this.board.isCheck()) {
                this.gameStatus = 'check';
            } else {
                this.gameStatus = 'active';
            }

            // Record the move in history with current game status
            this.moveHistory.addMove({
                piece: selectedPiece,
                from: this.selectedSquare,
                to: position,
                captured: targetPiece !== null
            }, this.gameStatus);
            
            this.selectedSquare = null;
            return true;
        }

        // If the clicked square has a piece of the current turn, select it
        if (piece && piece.color === this.board.currentTurn) {
            this.selectedSquare = position;
            return true;
        }

        return false;
    }

    /**
     * Reset the game to its initial state
     */
    reset() {
        this.board = new Board();
        this.selectedSquare = null;
        this.gameStatus = 'active';
        this.moveHistory.clear();
    }
}

export default Game; 