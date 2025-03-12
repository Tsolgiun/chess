import Piece from '../Piece.js';

class Knight extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = 'knight';
    }

    getValidMoves(board) {
        const moves = [];
        const possibleMoves = [
            { x: 1, y: 2 }, { x: 2, y: 1 },
            { x: 2, y: -1 }, { x: 1, y: -2 },
            { x: -1, y: -2 }, { x: -2, y: -1 },
            { x: -2, y: 1 }, { x: -1, y: 2 }
        ];

        for (const move of possibleMoves) {
            const newPosition = {
                x: this.position.x + move.x,
                y: this.position.y + move.y
            };

            if (this.isInBounds(newPosition)) {
                const pieceAtPosition = board.getPiece(newPosition);
                if (!pieceAtPosition || pieceAtPosition.color !== this.color) {
                    moves.push(newPosition);
                }
            }
        }

        return moves;
    }

    isInBounds(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    getSymbol() {
        return this.color === 'white' ? '♘' : '♞';
    }
}

export default Knight; 