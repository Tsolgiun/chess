import Piece from '../Piece.js';

class Rook extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = 'rook';
    }

    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 0, y: 1 },   // up
            { x: 0, y: -1 },  // down
            { x: 1, y: 0 },   // right
            { x: -1, y: 0 }   // left
        ];

        for (const direction of directions) {
            let currentPosition = {
                x: this.position.x + direction.x,
                y: this.position.y + direction.y
            };

            while (this.isInBounds(currentPosition)) {
                const pieceAtPosition = board.getPiece(currentPosition);
                
                if (!pieceAtPosition) {
                    moves.push({ ...currentPosition });
                } else {
                    if (pieceAtPosition.color !== this.color) {
                        moves.push({ ...currentPosition });
                    }
                    break;
                }

                currentPosition.x += direction.x;
                currentPosition.y += direction.y;
            }
        }

        return moves;
    }

    isInBounds(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    getSymbol() {
        return this.color === 'white' ? '♖' : '♜';
    }
}

export default Rook; 