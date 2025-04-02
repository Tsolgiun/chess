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
                const enginePath = path.join(__dirname, '../../frontend/public/stockfish/stockfish-windows-x86-64-avx2.exe');
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

            const moveHandler = (data) => {
                const output = data.toString();
                console.log('Move calculation output:', output);

                if (output.includes('bestmove')) {
                    const match = output.match(/bestmove ([a-h][1-8][a-h][1-8][qrbnQRBN]?)/);
                    if (match) {
                        const move = match[1].toLowerCase();
                        console.log('Found best move:', move);
                        this.engine.stdout.removeListener('data', moveHandler);
                        if (callback) callback(move);
                        resolve(move);
                    }
                }
            };

            this.engine.stdout.on('data', moveHandler);

            // Ensure engine is ready before sending new position
            this.engine.stdin.write('isready\n');
            this.engine.stdin.write(`position fen ${fen}\n`);
            this.engine.stdin.write('go movetime 1000\n');

            // Set move calculation timeout
            setTimeout(() => {
                console.log('Move calculation timeout');
                this.engine.stdout.removeListener('data', moveHandler);
                this.stop();
                reject(new Error('Move calculation timeout'));
            }, 3000);
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
