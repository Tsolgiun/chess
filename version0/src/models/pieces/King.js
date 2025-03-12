import Piece from '../Piece.js';

class King extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = 'king';
    }

    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 0, y: 1 },   // up
            { x: 0, y: -1 },  // down
            { x: 1, y: 0 },   // right
            { x: -1, y: 0 },  // left
            { x: 1, y: 1 },   // up-right
            { x: 1, y: -1 },  // down-right
            { x: -1, y: 1 },  // up-left
            { x: -1, y: -1 }  // down-left
        ];

        // Normal moves
        for (const direction of directions) {
            const newPosition = {
                x: this.position.x + direction.x,
                y: this.position.y + direction.y
            };

            if (this.isInBounds(newPosition)) {
                const pieceAtPosition = board.getPiece(newPosition);
                if (!pieceAtPosition || pieceAtPosition.color !== this.color) {
                    // Check if this move would put the king in check
                    if (!board.isSquareAttacked(newPosition, 
                        this.color === 'white' ? 'black' : 'white')) {
                        moves.push(newPosition);
                    }
                }
            }
        }

        // Only add castling moves if we're not calculating for check validation
        if (!this.hasMoved && !board._checkingCastling) {
            // Current square shouldn't be under attack for castling
            if (!board.isSquareAttacked(this.position, 
                this.color === 'white' ? 'black' : 'white')) {
                
                // Kingside castling
                const kingsideRook = board.getPiece({ x: 7, y: this.position.y });
                if (kingsideRook && 
                    kingsideRook.type === 'rook' && 
                    !kingsideRook.hasMoved &&
                    !board.getPiece({ x: 5, y: this.position.y }) &&
                    !board.getPiece({ x: 6, y: this.position.y }) &&
                    !board.isSquareAttacked({ x: 5, y: this.position.y }, 
                        this.color === 'white' ? 'black' : 'white') &&
                    !board.isSquareAttacked({ x: 6, y: this.position.y }, 
                        this.color === 'white' ? 'black' : 'white')) {
                    moves.push({ x: 6, y: this.position.y });
                }

                // Queenside castling
                const queensideRook = board.getPiece({ x: 0, y: this.position.y });
                if (queensideRook && 
                    queensideRook.type === 'rook' && 
                    !queensideRook.hasMoved &&
                    !board.getPiece({ x: 1, y: this.position.y }) &&
                    !board.getPiece({ x: 2, y: this.position.y }) &&
                    !board.getPiece({ x: 3, y: this.position.y }) &&
                    !board.isSquareAttacked({ x: 2, y: this.position.y }, 
                        this.color === 'white' ? 'black' : 'white') &&
                    !board.isSquareAttacked({ x: 3, y: this.position.y }, 
                        this.color === 'white' ? 'black' : 'white')) {
                    moves.push({ x: 2, y: this.position.y });
                }
            }
        }

        return moves;
    }

    isInBounds(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    getSymbol() {
        return this.color === 'white' ? '♔' : '♚';
    }
}

export default King; 