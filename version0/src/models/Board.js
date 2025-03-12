import { Pawn, Knight, Bishop, Rook, Queen, King } from './pieces/index.js';

class Board {
    constructor() {
        this.squares = Array(8).fill(null).map(() => Array(8).fill(null));
        this.capturedPieces = [];
        this.currentTurn = 'white';
        this.enPassantTarget = null; // Will store the position behind the pawn that moved two squares
        this._checkingCastling = false;  // Flag to prevent recursion during castling validation
        this.initializeBoard();
    }

    /**
     * Initialize the chess board with pieces in their starting positions
     */
    initializeBoard() {
        // Place pawns
        for (let i = 0; i < 8; i++) {
            this.squares[1][i] = new Pawn('black', { x: i, y: 1 });
            this.squares[6][i] = new Pawn('white', { x: i, y: 6 });
        }

        // Place rooks
        this.squares[0][0] = new Rook('black', { x: 0, y: 0 });
        this.squares[0][7] = new Rook('black', { x: 7, y: 0 });
        this.squares[7][0] = new Rook('white', { x: 0, y: 7 });
        this.squares[7][7] = new Rook('white', { x: 7, y: 7 });

        // Place knights
        this.squares[0][1] = new Knight('black', { x: 1, y: 0 });
        this.squares[0][6] = new Knight('black', { x: 6, y: 0 });
        this.squares[7][1] = new Knight('white', { x: 1, y: 7 });
        this.squares[7][6] = new Knight('white', { x: 6, y: 7 });

        // Place bishops
        this.squares[0][2] = new Bishop('black', { x: 2, y: 0 });
        this.squares[0][5] = new Bishop('black', { x: 5, y: 0 });
        this.squares[7][2] = new Bishop('white', { x: 2, y: 7 });
        this.squares[7][5] = new Bishop('white', { x: 5, y: 7 });

        // Place queens
        this.squares[0][3] = new Queen('black', { x: 3, y: 0 });
        this.squares[7][3] = new Queen('white', { x: 3, y: 7 });

        // Place kings
        this.squares[0][4] = new King('black', { x: 4, y: 0 });
        this.squares[7][4] = new King('white', { x: 4, y: 7 });
    }

    /**
     * Check if a position is within the board boundaries
     * @param {{x: number, y: number}} position - Position to check
     * @returns {boolean} Whether the position is in bounds
     */
    isInBounds(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    /**
     * Move a piece on the board
     * @param {{x: number, y: number}} from - Starting position
     * @param {{x: number, y: number}} to - Target position
     * @returns {boolean} Whether the move was successful
     */
    movePiece(from, to) {
        const piece = this.getPiece(from);
        if (!piece || piece.color !== this.currentTurn) return false;

        // Validate move considering pins and check
        if (!piece.isValidMove(this, to)) return false;

        const capturedPiece = this.getPiece(to);
        if (capturedPiece) {
            this.capturedPieces.push(capturedPiece);
        }

        // Handle en passant capture
        if (piece.type === 'pawn' && 
            this.enPassantTarget && 
            to.x === this.enPassantTarget.x && 
            to.y === this.enPassantTarget.y) {
            const capturedPawnY = piece.color === 'white' ? to.y + 1 : to.y - 1;
            const capturedPawn = this.getPiece({ x: to.x, y: capturedPawnY });
            if (capturedPawn) {
                this.squares[capturedPawnY][to.x] = null;
                this.capturedPieces.push(capturedPawn);
            }
        }

        // Update piece position
        this.squares[to.y][to.x] = piece;
        this.squares[from.y][from.x] = null;
        piece.position = to;
        piece.hasMoved = true;

        // Handle castling
        if (piece.type === 'king' && Math.abs(from.x - to.x) === 2) {
            const isKingside = to.x === 6;
            const rookFrom = { x: isKingside ? 7 : 0, y: from.y };
            const rookTo = { x: isKingside ? 5 : 3, y: from.y };
            const rook = this.getPiece(rookFrom);
            
            this.squares[rookTo.y][rookTo.x] = rook;
            this.squares[rookFrom.y][rookFrom.x] = null;
            rook.position = rookTo;
            rook.hasMoved = true;
        }

        // Set new en passant target if pawn moves two squares
        if (piece.type === 'pawn' && Math.abs(to.y - from.y) === 2) {
            const direction = piece.color === 'white' ? 1 : -1;
            this.enPassantTarget = {
                x: to.x,
                y: to.y + direction
            };
        } else {
            this.enPassantTarget = null;  // Clear en passant target for all other moves
        }

        // Handle pawn promotion
        if (piece.type === 'pawn' && (to.y === 0 || to.y === 7)) {
            this.squares[to.y][to.x] = new Queen(piece.color, to);
        }

        // Switch turns
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        
        return true;
    }

    /**
     * Get piece at specified position
     * @param {{x: number, y: number}} position - Board position
     * @returns {Piece|null} The piece at the position or null
     */
    getPiece(position) {
        return this.squares[position.y][position.x];
    }

    /**
     * Check if the current player is in check
     * @returns {boolean} Whether the current player is in check
     */
    isCheck() {
        // Find the current player's king
        const kingPos = this.findKingPosition(this.currentTurn);
        if (!kingPos) return false;

        // Set a flag to prevent recursive castling validation
        this._checkingCastling = true;
        
        try {
            return this.isSquareAttacked(kingPos, this.currentTurn === 'white' ? 'black' : 'white');
        } finally {
            this._checkingCastling = false;
        }
    }

    /**
     * Check if the current player is in checkmate
     * @returns {boolean} Whether the current player is in checkmate
     */
    isCheckmate() {
        if (!this.isCheck()) return false;

        // Check if any piece can make a move that gets out of check
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.squares[y][x];
                if (piece && piece.color === this.currentTurn) {
                    const moves = piece.getValidMoves(this);
                    for (const move of moves) {
                        // Try the move
                        const originalPiece = this.squares[move.y][move.x];
                        this.squares[move.y][move.x] = piece;
                        this.squares[y][x] = null;
                        piece.position = move;

                        const stillInCheck = this.isCheck();

                        // Undo the move
                        this.squares[y][x] = piece;
                        this.squares[move.y][move.x] = originalPiece;
                        piece.position = { x, y };

                        if (!stillInCheck) return false;
                    }
                }
            }
        }

        return true;
    }

    /**
     * Get all valid moves for a piece at the specified position
     * @param {{x: number, y: number}} position - Position to check
     * @returns {Array<{x: number, y: number}>} Array of valid move positions
     */
    getValidMovesForPosition(position) {
        const piece = this.getPiece(position);
        return piece ? piece.getValidMoves(this) : [];
    }

    /**
     * Check if a piece is pinned (can't move because it would expose the king)
     * @param {Piece} piece - The piece to check
     * @returns {boolean} Whether the piece is pinned
     */
    isPinned(piece) {
        if (piece.type === 'king') return false;

        const kingPos = this.findKingPosition(piece.color);
        if (!kingPos) return false;

        // Get direction from piece to king
        const dx = Math.sign(kingPos.x - piece.position.x);
        const dy = Math.sign(kingPos.y - piece.position.y);

        // If piece is not in line with king (horizontally, vertically, or diagonally), it can't be pinned
        if (Math.abs(kingPos.x - piece.position.x) !== Math.abs(kingPos.y - piece.position.y) &&
            kingPos.x !== piece.position.x &&
            kingPos.y !== piece.position.y) {
            return false;
        }

        // Look in opposite direction from king for attacking pieces
        let x = piece.position.x - dx;
        let y = piece.position.y - dy;

        while (this.isInBounds({ x, y })) {
            const p = this.getPiece({ x, y });
            if (p) {
                if (p.color !== piece.color) {
                    // Check if this piece can pin (queen, rook for orthogonal, bishop for diagonal)
                    const isDiagonal = Math.abs(dx) === Math.abs(dy);
                    return (isDiagonal && (p.type === 'bishop' || p.type === 'queen')) ||
                           (!isDiagonal && (p.type === 'rook' || p.type === 'queen'));
                }
                break;
            }
            x -= dx;
            y -= dy;
        }

        return false;
    }

    /**
     * Get the direction of the pin for a piece, if it is pinned
     * @param {Piece} piece - The piece to check
     * @returns {{dx: number, dy: number}|null} The pin direction or null if not pinned
     */
    getPinDirection(piece) {
        if (piece.type === 'king') return null;

        const kingPos = this.findKingPosition(piece.color);
        if (!kingPos) return null;

        // Get direction from piece to king
        const dx = Math.sign(kingPos.x - piece.position.x);
        const dy = Math.sign(kingPos.y - piece.position.y);

        // If piece is not in line with king, it's not pinned
        if (Math.abs(kingPos.x - piece.position.x) !== Math.abs(kingPos.y - piece.position.y) &&
            kingPos.x !== piece.position.x &&
            kingPos.y !== piece.position.y) {
            return null;
        }

        // Look in opposite direction from king for attacking pieces
        let x = piece.position.x - dx;
        let y = piece.position.y - dy;

        while (this.isInBounds({ x, y })) {
            const p = this.getPiece({ x, y });
            if (p) {
                if (p.color !== piece.color) {
                    const isDiagonal = Math.abs(dx) === Math.abs(dy);
                    if ((isDiagonal && (p.type === 'bishop' || p.type === 'queen')) ||
                        (!isDiagonal && (p.type === 'rook' || p.type === 'queen'))) {
                        return { dx, dy };
                    }
                }
                break;
            }
            x -= dx;
            y -= dy;
        }

        return null;
    }

    /**
     * Find the position of a king of the specified color
     * @param {string} color - The color of the king to find
     * @returns {{x: number, y: number}|null} The king's position or null if not found
     */
    findKingPosition(color) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.squares[y][x];
                if (piece && piece.type === 'king' && piece.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    /**
     * Test if a move would resolve check
     * @param {{x: number, y: number}} from - Starting position
     * @param {{x: number, y: number}} to - Target position
     * @returns {boolean} Whether the move would resolve check
     */
    wouldMoveResolveCheck(from, to) {
        const piece = this.getPiece(from);
        if (!piece) return false;

        // Save the state
        const originalBoard = this.squares.map(row => [...row]);
        const originalPieceState = {
            position: {...piece.position},
            hasMoved: piece.hasMoved
        };

        try {
            // Make the test move
            const capturedPiece = this.squares[to.y][to.x];
            this.squares[to.y][to.x] = piece;
            this.squares[from.y][from.x] = null;
            piece.position = {...to};

            // Find king position
            const kingPos = this.findKingPosition(piece.color);
            if (!kingPos) return false;

            // Check if any opponent piece can still reach the king
            for (let y = 0; y < 8; y++) {
                for (let x = 0; x < 8; x++) {
                    const attackingPiece = this.squares[y][x];
                    if (!attackingPiece || attackingPiece.color === piece.color) continue;

                    if (attackingPiece.type === 'pawn') {
                        // Special handling for pawns
                        const direction = attackingPiece.color === 'white' ? -1 : 1;
                        const attacks = [
                            { x: attackingPiece.position.x - 1, y: attackingPiece.position.y + direction },
                            { x: attackingPiece.position.x + 1, y: attackingPiece.position.y + direction }
                        ];
                        
                        if (attacks.some(pos => 
                            this.isInBounds(pos) &&
                            pos.x === kingPos.x && 
                            pos.y === kingPos.y)) {
                            return false;
                        }
                    } else {
                        // For other pieces, check if they can still reach the king
                        const moves = attackingPiece.getValidMoves(this);
                        if (moves.some(move => move.x === kingPos.x && move.y === kingPos.y)) {
                            return false;
                        }
                    }
                }
            }

            return true;
        } finally {
            // Restore the board state
            this.squares = originalBoard;
            piece.position = originalPieceState.position;
            piece.hasMoved = originalPieceState.hasMoved;
        }
    }

    /**
     * Check if a square is under attack by a piece of the specified color
     * @param {{x: number, y: number}} square - The square to check
     * @param {string} byColor - The color of the attacking pieces
     * @returns {boolean} Whether the square is under attack
     */
    isSquareAttacked(square, byColor) {
        // Check pawn attacks
        const pawnDirection = byColor === 'white' ? -1 : 1;
        const pawnAttacks = [
            { x: square.x - 1, y: square.y - pawnDirection },
            { x: square.x + 1, y: square.y - pawnDirection }
        ];
        
        for (const attack of pawnAttacks) {
            if (this.isInBounds(attack)) {
                const piece = this.getPiece(attack);
                if (piece && piece.type === 'pawn' && piece.color === byColor) {
                    return true;
                }
            }
        }

        // Check knight attacks
        const knightMoves = [
            { x: -2, y: -1 }, { x: -2, y: 1 },
            { x: -1, y: -2 }, { x: -1, y: 2 },
            { x: 1, y: -2 }, { x: 1, y: 2 },
            { x: 2, y: -1 }, { x: 2, y: 1 }
        ];

        for (const move of knightMoves) {
            const pos = { x: square.x + move.x, y: square.y + move.y };
            if (this.isInBounds(pos)) {
                const piece = this.getPiece(pos);
                if (piece && piece.type === 'knight' && piece.color === byColor) {
                    return true;
                }
            }
        }

        // Check sliding piece attacks (queen, rook, bishop)
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

        for (const dir of directions) {
            let pos = { x: square.x + dir.x, y: square.y + dir.y };
            while (this.isInBounds(pos)) {
                const piece = this.getPiece(pos);
                if (piece) {
                    if (piece.color === byColor) {
                        // Check if this piece can move in this direction
                        const isDiagonal = Math.abs(dir.x) === Math.abs(dir.y);
                        const isStraight = dir.x === 0 || dir.y === 0;
                        
                        if ((isDiagonal && (piece.type === 'bishop' || piece.type === 'queen')) ||
                            (isStraight && (piece.type === 'rook' || piece.type === 'queen')) ||
                            (piece.type === 'king' && 
                             Math.abs(square.x - pos.x) <= 1 && 
                             Math.abs(square.y - pos.y) <= 1)) {
                            return true;
                        }
                    }
                    break;
                }
                pos.x += dir.x;
                pos.y += dir.y;
            }
        }

        return false;
    }

    /**
     * Get valid moves that would block or resolve a check
     * @param {Piece} piece - The piece to get moves for
     * @returns {Array<{x: number, y: number}>} Array of valid move positions
     */
    getValidBlockingMoves(piece) {
        if (!this.isCheck()) return piece.getValidMoves(this);
        
        const moves = piece.getValidMoves(this);
        return moves.filter(move => this.wouldMoveResolveCheck(piece.position, move));
    }
}

export default Board; 