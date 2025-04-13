import { Chess } from 'chess.js';

class StockfishService {
    constructor() {
        this.isAnalyzing = false;
        this.currentFen = '';
        this.onLineCallback = null;
        this.depth = 20;
    }

    async init() {
        // No initialization needed since we're using backend API
        return Promise.resolve();
    }

    async getMove(fen) {
        try {
            const response = await fetch('http://localhost:3001/api/stockfish/move', {
                mode: 'cors',
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fen }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to get move from server');
            }
            
            const data = await response.json();
            return data.move;
        } catch (error) {
            console.error('Failed to get move:', error);
            if (error.response) {
                // Server returned an error response
                const errorData = await error.response.json();
                throw new Error(errorData.error || 'Server returned an error');
            } else if (error.message) {
                throw new Error(`Move calculation failed: ${error.message}`);
            } else {
                throw new Error('Move calculation failed: Network error');
            }
        }
    }

    setAnalysisCallback(callback) {
        this.onLineCallback = callback;
    }

    setDepth(depth) {
        this.depth = Math.min(Math.max(depth, 1), 30);
    }

    getPositionInfo(evaluation) {
        if (evaluation >= 3) return "Winning advantage";
        if (evaluation >= 1.5) return "Clear advantage";
        if (evaluation >= 0.5) return "Slight advantage";
        if (evaluation > -0.5) return "Equal position";
        if (evaluation > -1.5) return "Slight disadvantage";
        if (evaluation > -3) return "Clear disadvantage";
        return "Lost position";
    }

    formatPV(moves) {
        const chess = new Chess(this.currentFen);
        return moves.slice(0, 5).map(move => {
            try {
                const result = chess.move(move, { sloppy: true });
                return result ? result.san : move;
            } catch {
                return move;
            }
        });
    }

    async startAnalysis(fen) {
        this.currentFen = fen;
        this.isAnalyzing = true;
        
        try {
            const response = await fetch('http://localhost:3001/api/stockfish/analyze', {
                mode: 'cors',
                credentials: 'include',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    fen,
                    depth: this.depth 
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to analyze position');
            }
            
            const { analysisLines } = await response.json();
            
            // Process analysis lines
            if (this.onLineCallback) {
                analysisLines.forEach(line => {
                    const formattedLine = {
                        depth: line.depth,
                        evaluation: line.evaluation,
                        moves: this.formatPV(line.moves),
                        multipv: line.multipv
                    };

                    if (line.multipv === 1) {
                        formattedLine.info = this.getPositionInfo(line.evaluation);
                    }

                    this.onLineCallback(formattedLine);
                });
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            this.isAnalyzing = false;
            if (error.response) {
                // Server returned an error response
                const errorData = await error.response.json();
                throw new Error(errorData.error || 'Server returned an error');
            } else if (error.message) {
                throw new Error(`Analysis failed: ${error.message}`);
            } else {
                throw new Error('Analysis failed: Network error');
            }
        }
    }

    stopAnalysis() {
        this.isAnalyzing = false;
    }

    terminate() {
        // Nothing to terminate since we're using backend API
    }
}

export default new StockfishService();
