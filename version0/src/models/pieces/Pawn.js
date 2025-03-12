import Piece from '../Piece.js';

class Pawn extends Piece {
    constructor(color, position) {
        super(color, position);
        this.type = 'pawn';
    }

    getValidMoves(board) {
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRank = this.color === 'white' ? 6 : 1;

        // Forward move
        const forward = { x: this.position.x, y: this.position.y + direction };
        if (this.isInBounds(forward) && !board.getPiece(forward)) {
            moves.push(forward);

            // Double move from starting position
            if (this.position.y === startRank) {
                const doubleForward = { x: this.position.x, y: this.position.y + (2 * direction) };
                if (!board.getPiece(doubleForward)) {
                    moves.push(doubleForward);
                }
            }
        }

        // Normal captures
        const captures = [
            { x: this.position.x - 1, y: this.position.y + direction },
            { x: this.position.x + 1, y: this.position.y + direction }
        ];

        for (const capture of captures) {
            if (this.isInBounds(capture)) {
                const pieceAtCapture = board.getPiece(capture);
                if (pieceAtCapture && pieceAtCapture.color !== this.color) {
                    moves.push(capture);
                }
            }
        }

        // En passant captures
        if (board.enPassantTarget) {
            const enPassantCaptures = [
                { x: this.position.x - 1, y: this.position.y },
                { x: this.position.x + 1, y: this.position.y }
            ];

            for (const capture of enPassantCaptures) {
                if (this.isInBounds(capture)) {
                    const targetPiece = board.getPiece(capture);
                    if (targetPiece && 
                        targetPiece.type === 'pawn' && 
                        targetPiece.color !== this.color &&
                        capture.x === board.enPassantTarget.x &&
                        this.position.y === (this.color === 'white' ? 3 : 4)) {
                        moves.push(board.enPassantTarget);
                    }
                }
            }
        }

        return moves;
    }

    isInBounds(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    getSymbol() {
        return this.color === 'white' ? '♙' : '♟';
    }
}

export default Pawn; 