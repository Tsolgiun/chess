class Piece {
    constructor(color, position) {
        this.color = color; // 'white' or 'black'
        this.position = position; // {x: number, y: number}
        this.hasMoved = false;
    }

    /**
     * Get all valid moves for this piece
     * @param {Board} board - Current game board
     * @returns {Array<{x: number, y: number}>} Array of valid move positions
     */
    getValidMoves(board) {
        throw new Error('getValidMoves must be implemented by each piece type');
    }

    /**
     * Check if a move is valid for this piece
     * @param {Board} board - The current board state
     * @param {{x: number, y: number}} to - Target position
     * @returns {boolean} Whether the move is valid
     */
    isValidMove(board, to) {
        // First check if the piece is pinned
        const pinDirection = board.getPinDirection(this);
        if (pinDirection) {
            // If pinned, only allow moves along the pin line
            const dx = Math.sign(to.x - this.position.x);
            const dy = Math.sign(to.y - this.position.y);
            
            // If move direction is not along pin line, it's invalid
            if (dx !== pinDirection.dx && dx !== -pinDirection.dx ||
                dy !== pinDirection.dy && dy !== -pinDirection.dy) {
                return false;
            }
        }

        // If in check, only allow moves that resolve the check
        if (board.isCheck() && board.currentTurn === this.color) {
            if (!board.wouldMoveResolveCheck(this.position, to)) {
                return false;
            }
        }

        return this.getValidMoves(board).some(move => 
            move.x === to.x && move.y === to.y);
    }

    /**
     * Get the piece's symbol for display
     * @returns {string} Unicode chess piece symbol
     */
    getSymbol() {
        throw new Error('getSymbol must be implemented by each piece type');
    }
}

export default Piece; 