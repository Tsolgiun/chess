import { Chess } from 'chess.js';

class StockfishService {
    constructor() {
        this.engine = null;
        this.isAnalyzing = false;
        this.currentFen = '';
        this.onLineCallback = null;
        this.depth = 20;
    }

    async init() {
        if (this.engine) return;

        try {
            this.engine = new Worker('/stockfish/stockfish.js');
            
            this.engine.onmessage = (e) => {
                this.handleEngineOutput(e.data);
            };

            setTimeout(() => {
                // Give time for Stockfish WASM to initialize
                this.engine.postMessage('uci');
                this.engine.postMessage('setoption name MultiPV value 3');
                this.engine.postMessage('isready');
            }, 500);

            return new Promise((resolve, reject) => {
                let checkReady = (e) => {
                    if (e.data === 'readyok') {
                        this.engine.removeEventListener('message', checkReady);
                        console.log('Stockfish engine ready');
                        resolve();
                    }
                };
                this.engine.addEventListener('message', checkReady);
                
                // Add error handling
                this.engine.onerror = (error) => {
                    console.error('Stockfish engine error:', error);
                    reject(error);
                };
            });
        } catch (error) {
            console.error('Failed to initialize Stockfish:', error);
            throw error;
        }
    }

    setAnalysisCallback(callback) {
        this.onLineCallback = callback;
    }

    setDepth(depth) {
        this.depth = Math.min(Math.max(depth, 1), 30);
    }

    handleEngineOutput(output) {
        if (!this.onLineCallback || !output) return;

        // Parse info lines
        if (output.startsWith('info')) {
            const matches = {
                depth: output.match(/depth (\d+)/),
                score: output.match(/score (cp|mate) (-?\d+)/),
                pv: output.match(/pv (.+)$/),
                multipv: output.match(/multipv (\d+)/)
            };

            if (matches.depth && matches.score && matches.pv) {
                const depth = parseInt(matches.depth[1]);
                let evaluation;
                
                if (matches.score[1] === 'cp') {
                    evaluation = parseInt(matches.score[2]) / 100;
                } else {
                    // Mate score
                    const moves = parseInt(matches.score[2]);
                    evaluation = moves > 0 ? 999 : -999;
                }

                const moves = matches.pv[1].split(' ');
                const multipv = matches.multipv ? parseInt(matches.multipv[1]) : 1;

                // Create analysis line
                const line = {
                    depth,
                    evaluation,
                    moves: this.formatPV(moves),
                    multipv
                };

                if (multipv === 1) {
                    // Add contextual info for main line
                    line.info = this.getPositionInfo(evaluation);
                }

                this.onLineCallback(line);
            }
        }
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

    getPositionInfo(evaluation) {
        if (evaluation >= 3) return "Winning advantage";
        if (evaluation >= 1.5) return "Clear advantage";
        if (evaluation >= 0.5) return "Slight advantage";
        if (evaluation > -0.5) return "Equal position";
        if (evaluation > -1.5) return "Slight disadvantage";
        if (evaluation > -3) return "Clear disadvantage";
        return "Lost position";
    }

    startAnalysis(fen) {
        if (!this.engine) return;
        
        this.currentFen = fen;
        this.isAnalyzing = true;
        
        this.engine.postMessage('stop');
        this.engine.postMessage('position fen ' + fen);
        this.engine.postMessage(`go depth ${this.depth}`);
    }

    stopAnalysis() {
        if (!this.engine) return;
        
        this.engine.postMessage('stop');
        this.isAnalyzing = false;
    }

    terminate() {
        if (this.engine) {
            this.engine.terminate();
            this.engine = null;
        }
    }
}

export default new StockfishService();
