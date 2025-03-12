import Game from './src/models/Game.js';

class ChessUI {
    constructor() {
        this.game = new Game();
        this.selectedSquare = null;
        this.board = document.getElementById('chessboard');
        this.statusElement = document.querySelector('.status');
        this.resetButton = document.getElementById('resetBtn');
        this.moveHistoryElement = document.getElementById('moveHistory');
        
        this.initializeBoard();
        this.bindEvents();
        this.updateBoard();
        this.updateStatus();
        this.updateMoveHistory();
    }

    initializeBoard() {
        this.board.innerHTML = '';
        const files = 'abcdefgh';
        const ranks = '87654321';

        // Create board squares
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const square = document.createElement('div');
                square.className = `square ${(x + y) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.x = x;
                square.dataset.y = y;
                
                // Add coordinates
                if (y === 7) {
                    const fileLabel = document.createElement('div');
                    fileLabel.className = 'coordinate file';
                    fileLabel.textContent = files[x];
                    square.appendChild(fileLabel);
                }
                if (x === 0) {
                    const rankLabel = document.createElement('div');
                    rankLabel.className = 'coordinate rank';
                    rankLabel.textContent = ranks[y];
                    square.appendChild(rankLabel);
                }

                this.board.appendChild(square);
            }
        }
    }

    bindEvents() {
        this.board.addEventListener('click', (e) => {
            const square = e.target.closest('.square');
            if (!square) return;

            const x = parseInt(square.dataset.x);
            const y = parseInt(square.dataset.y);
            
            this.handleSquareClick(x, y);
        });

        this.resetButton.addEventListener('click', () => {
            this.game.reset();
            this.selectedSquare = null;
            this.updateBoard();
            this.updateStatus();
        });
    }

    handleSquareClick(x, y) {
        const position = { x, y };
        const clickedPiece = this.game.board.getPiece(position);
        
        // Clear previous highlights
        this.clearHighlights();
        
        // If in check, validate piece selection
        if (this.game.gameStatus === 'check' && 
            clickedPiece && 
            clickedPiece.color === this.game.board.currentTurn) {
            // Get valid blocking moves for this piece
            const validMoves = this.game.board.getValidBlockingMoves(clickedPiece);
            // Only proceed if this piece has valid moves that can block the check
            if (validMoves.length === 0) {
                return;
            }
        }
        
        const success = this.game.handleSquareSelection(position);
        if (success) {
            this.updateBoard();
            this.updateStatus();
            this.updateMoveHistory();
        }
    }

    clearHighlights() {
        const squares = this.board.getElementsByClassName('square');
        for (const square of squares) {
            square.classList.remove('selected', 'valid-move');
        }
    }

    updateBoard() {
        const squares = this.board.getElementsByClassName('square');
        
        // Clear previous content and highlights
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const square = squares[y * 8 + x];
                const coordinates = Array.from(square.querySelectorAll('.coordinate'));
                square.innerHTML = '';
                coordinates.forEach(coord => square.appendChild(coord));
                // Remove ALL highlights including 'check'
                square.classList.remove('selected', 'valid-move', 'check');

                // Add piece if present
                const piece = this.game.board.getPiece({ x, y });
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = `piece ${piece.color} ${piece.type}`;
                    square.appendChild(pieceElement);
                }

                // Highlight selected square
                if (this.game.selectedSquare && 
                    this.game.selectedSquare.x === x && 
                    this.game.selectedSquare.y === y) {
                    square.classList.add('selected');
                }
            }
        }

        // Show valid moves for selected piece
        if (this.game.selectedSquare) {
            const piece = this.game.board.getPiece(this.game.selectedSquare);
            if (piece) {
                let validMoves;
                if (this.game.gameStatus === 'check') {
                    // If in check, only show moves that resolve the check
                    validMoves = this.game.board.getValidBlockingMoves(piece);
                } else {
                    validMoves = piece.getValidMoves(this.game.board);
                }
                validMoves.forEach(move => {
                    const square = squares[move.y * 8 + move.x];
                    square.classList.add('valid-move');
                });
            }
        }

        // Only highlight king if CURRENTLY in check
        if (this.game.gameStatus === 'check') {
            const currentKing = this.findKingSquare(this.game.board.currentTurn);
            if (currentKing) {
                squares[currentKing.y * 8 + currentKing.x].classList.add('check');
            }
        }
    }

    // Add this helper method to find the current king's square
    findKingSquare(color) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.game.board.getPiece({ x, y });
                if (piece && 
                    piece.type === 'king' && 
                    piece.color === color) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    updateStatus() {
        let status = `${this.game.board.currentTurn.charAt(0).toUpperCase() + 
            this.game.board.currentTurn.slice(1)}'s turn`;

        if (this.game.gameStatus === 'check') {
            status += ' (Check!)';
        } else if (this.game.gameStatus === 'checkmate') {
            const winner = this.game.board.currentTurn === 'white' ? 'Black' : 'White';
            status = `Checkmate! ${winner} wins!`;
        } else if (this.game.gameStatus === 'stalemate') {
            status = 'Stalemate! Game is a draw.';
        }

        this.statusElement.textContent = status;
    }

    updateMoveHistory() {
        const moves = this.game.moveHistory.getHistory();
        this.moveHistoryElement.innerHTML = '';
        
        for (let i = 0; i < moves.length; i += 2) {
            const moveNumber = Math.floor(i / 2) + 1;
            const whiteMove = moves[i];
            const blackMove = moves[i + 1];
            
            const movePair = document.createElement('div');
            movePair.className = 'move-pair';
            
            const number = document.createElement('span');
            number.className = 'move-number';
            number.textContent = `${moveNumber}.`;
            
            const white = document.createElement('span');
            white.className = 'move';
            white.textContent = this.formatMove(whiteMove);
            
            const black = document.createElement('span');
            black.className = 'move';
            black.textContent = blackMove ? this.formatMove(blackMove) : '';
            
            movePair.appendChild(number);
            movePair.appendChild(white);
            movePair.appendChild(black);
            
            this.moveHistoryElement.appendChild(movePair);
        }
        
        // Scroll to bottom
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }

    formatMove(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        
        let notation = '';
        
        // Add piece symbol for non-pawns (single letter)
        if (move.piece.type !== 'pawn') {
            const pieceSymbols = {
                'king': 'K',
                'queen': 'Q',
                'rook': 'R',
                'bishop': 'B',
                'knight': 'N'
            };
            notation += pieceSymbols[move.piece.type];
        }
        
        // Add capture symbol if there's a capture
        if (move.captured) {
            if (move.piece.type === 'pawn') {
                notation += files[move.from.x];
            }
            notation += 'x';
        }
        
        // Add destination square
        notation += files[move.to.x] + ranks[move.to.y];
        
        // Use the stored game status for this move
        if (move.gameStatus === 'check') {
            notation += '+';
        } else if (move.gameStatus === 'checkmate') {
            notation += '#';
        }
        
        return notation;
    }
}

// Initialize the game when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new ChessUI();
}); 