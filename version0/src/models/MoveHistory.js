class MoveHistory {
    constructor() {
        this.moves = [];
        this.currentIndex = -1;
    }

    /**
     * Add a new move to the history
     * @param {{piece: any, from: {x: number, y: number}, to: {x: number, y: number}, captured: boolean}} move - Move details
     * @param {string} gameStatus - Current game status ('check', 'checkmate', or undefined)
     */
    addMove(move, gameStatus) {
        // Clear any redoable moves
        this.moves.splice(this.currentIndex + 1);
        // Store move with its game status
        this.moves.push({
            ...move,
            gameStatus // 'check', 'checkmate', or undefined
        });
        this.currentIndex++;
    }

    /**
     * Get the current move history
     * @returns {Array} Array of moves
     */
    getHistory() {
        return this.moves;
    }

    /**
     * Clear the move history
     */
    clear() {
        this.moves = [];
        this.currentIndex = -1;
    }

    /**
     * Convert a move to chess notation
     * @param {{from: {x: number, y: number}, to: {x: number, y: number}, piece: any, captured: any}} move - Move details
     * @returns {string} Move in chess notation
     */
    static toChessNotation(move) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        const from = `${files[move.from.x]}${ranks[move.from.y]}`;
        const to = `${files[move.to.x]}${ranks[move.to.y]}`;
        return `${move.piece.getSymbol()}${from}-${to}${move.captured ? 'x' : ''}`;
    }
}

export default MoveHistory; 