const { spawn } = require('child_process');
const path = require('path');

class StockfishController {
    constructor() {
        this.engine = null;
        this.isReady = false;
    }

    initialize() {
        return new Promise((resolve, reject) => {
            try {
                // Initialize engine process
                const enginePath = path.join(__dirname, '../bin/stockfish/stockfish-windows-x86-64-avx2.exe');
                console.log('Initializing Stockfish engine at path:', enginePath);
                
                this.engine = spawn(enginePath);
                console.log('Stockfish process spawned');

                // Set up base event handlers
                this.engine.stderr.on('data', data => console.error('Engine error:', data.toString()));
                this.engine.on('close', () => {
                    console.log('Engine process closed');
                    this.isReady = false;
                });
                this.engine.on('error', error => {
                    console.error('Engine process error:', error);
                    reject(error);
                });

                // Set up main stdout handler
                this.engine.stdout.on('data', data => {
                    const output = data.toString();
                    console.log('Engine output:', output);
                });

                // Wait for engine initialization
                let uciOk = false;
                let readyOk = false;

                const initHandler = (data) => {
                    const output = data.toString();
                    
                    if (output.includes('uciok')) {
                        console.log('Received uciok');
                        uciOk = true;
                    }
                    
                    if (output.includes('readyok')) {
                        console.log('Received readyok');
                        readyOk = true;
                    }

                    if (uciOk && readyOk) {
                        this.engine.stdout.removeListener('data', initHandler);
                        this.isReady = true;
                        console.log('Engine fully initialized');
                        resolve();
                    }
                };

                this.engine.stdout.on('data', initHandler);

                // Send initialization commands
                console.log('Sending UCI init commands...');
                this.engine.stdin.write('uci\n');
                this.engine.stdin.write('isready\n');

                // Set initialization timeout
                setTimeout(() => {
                    if (!this.isReady) {
                        this.engine.stdout.removeListener('data', initHandler);
                        reject(new Error('Engine init timeout'));
                    }
                }, 10000);

            } catch (error) {
                reject(error);
            }
        });
    }

    getMove(fen, callback) {
        return new Promise((resolve, reject) => {
            if (!this.isReady || !this.engine) {
                const error = new Error('Engine not ready');
                console.error(error);
                reject(error);
                return;
            }

            console.log('Calculating move for FEN:', fen);
            
            // Flag to track if we've already resolved/rejected the promise
            let isResolved = false;

            const moveHandler = (data) => {
                const output = data.toString();
                console.log('Move calculation output:', output);

                if (output.includes('bestmove')) {
                    const match = output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbnQRBN]?)/);
                    if (match && !isResolved) {
                        const move = match[1].toLowerCase();
                        console.log('Found best move:', move);
                        this.engine.stdout.removeListener('data', moveHandler);
                        if (callback) callback(move);
                        isResolved = true;
                        resolve(move);
                    } else if (!match && !isResolved) {
                        console.error('Could not parse bestmove from output:', output);
                        this.engine.stdout.removeListener('data', moveHandler);
                        isResolved = true;
                        reject(new Error('Failed to parse move'));
                    }
                }
            };

            this.engine.stdout.on('data', moveHandler);

            // Ensure engine is ready before sending new position
            this.engine.stdin.write('isready\n');
            this.engine.stdin.write(`position fen ${fen}\n`);
            this.engine.stdin.write('go movetime 2000\n'); // Increased time for move calculation

            // Set move calculation timeout - increased to 5 seconds
            setTimeout(() => {
                if (!isResolved) {
                    console.log('Move calculation timeout');
                    this.engine.stdout.removeListener('data', moveHandler);
                    this.stop();
                    isResolved = true;
                    reject(new Error('Move calculation timeout'));
                }
            }, 5000); // Increased from 3000 to 5000 ms
        });
    }

    analyze(fen, depth = 20) {
        return new Promise((resolve, reject) => {
            if (!this.isReady || !this.engine) {
                const error = new Error('Engine not ready');
                console.error(error);
                reject(error);
                return;
            }

            console.log('Analyzing position with FEN:', fen);
            
            // Flag to track if we've already resolved/rejected the promise
            let isResolved = false;
            let analysisLines = [];

            const analysisHandler = (data) => {
                const output = data.toString();
                
                // Parse info lines
                if (output.includes('info') && output.includes('score') && output.includes('pv')) {
                    try {
                        const depthMatch = output.match(/depth (\d+)/);
                        const scoreMatch = output.match(/score (cp|mate) (-?\d+)/);
                        const pvMatch = output.match(/pv (.+)$/);
                        const multipvMatch = output.match(/multipv (\d+)/);
                        
                        if (depthMatch && scoreMatch && pvMatch) {
                            const currentDepth = parseInt(depthMatch[1]);
                            let evaluation;
                            
                            if (scoreMatch[1] === 'cp') {
                                evaluation = parseInt(scoreMatch[2]) / 100;
                            } else {
                                // Mate score
                                const moves = parseInt(scoreMatch[2]);
                                evaluation = moves > 0 ? 999 : -999;
                            }
                            
                            const moves = pvMatch[1].split(' ').slice(0, 5);
                            const multipv = multipvMatch ? parseInt(multipvMatch[1]) : 1;
                            
                            // Create analysis line
                            const line = {
                                depth: currentDepth,
                                evaluation,
                                moves,
                                multipv
                            };
                            
                            // Update or add the line
                            const existingIndex = analysisLines.findIndex(l => l.multipv === multipv);
                            if (existingIndex >= 0) {
                                analysisLines[existingIndex] = line;
                            } else {
                                analysisLines.push(line);
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing analysis output:', error);
                    }
                }
                
                // Check if analysis is complete
                if (output.includes('bestmove')) {
                    if (!isResolved) {
                        this.engine.stdout.removeListener('data', analysisHandler);
                        isResolved = true;
                        resolve(analysisLines);
                    }
                }
            };

            this.engine.stdout.on('data', analysisHandler);

            // Ensure engine is ready before sending new position
            this.engine.stdin.write('isready\n');
            this.engine.stdin.write('setoption name MultiPV value 3\n');
            this.engine.stdin.write(`position fen ${fen}\n`);
            this.engine.stdin.write(`go depth ${depth}\n`);

            // Set analysis timeout - 10 seconds
            setTimeout(() => {
                if (!isResolved) {
                    console.log('Analysis timeout');
                    this.engine.stdout.removeListener('data', analysisHandler);
                    this.stop();
                    isResolved = true;
                    resolve(analysisLines); // Resolve with whatever we have so far
                }
            }, 10000);
        });
    }

    stop() {
        if (this.engine) {
            this.engine.stdin.write('stop\n');
        }
    }

    quit() {
        if (this.engine) {
            this.engine.stdin.write('quit\n');
            this.engine = null;
            this.isReady = false;
        }
    }
}

// Singleton instance
const stockfishController = new StockfishController();
module.exports = stockfishController;
