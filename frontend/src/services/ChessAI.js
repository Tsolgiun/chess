class ChessAI {
    constructor() {
        this.socket = null;
        this.isReady = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            if (this.isReady) {
                resolve();
                return;
            }

            this.socket = window.socket;
            if (!this.socket) {
                reject(new Error('Socket not available'));
                return;
            }

            this.socket.on('aiMoveCalculated', ({ move }) => {
                if (this.moveResolve) {
                    if (move && /^[a-h][1-8][a-h][1-8][qrbnQRBN]?$/i.test(move)) {
                        this.moveResolve(move.toLowerCase());
                    } else {
                        this.moveResolve(null);
                    }
                    this.moveResolve = null;
                }
            });

            this.socket.on('error', () => {
                if (this.moveResolve) {
                    this.moveResolve(null);
                    this.moveResolve = null;
                }
            });

            this.isReady = true;
            resolve();
        });
    }

    async getMove(fen) {
        try {
            if (!this.isReady) {
                await this.init();
            }

            if (!fen || !this.socket) {
                return null;
            }

            return new Promise(resolve => {
                this.moveResolve = resolve;
                this.socket.emit('requestAIMove', { fen });
            });
        } catch {
            return null;
        }
    }

    stop() {
        if (this.socket) {
            this.socket.emit('stopEngine');
            if (this.moveResolve) {
                this.moveResolve(null);
                this.moveResolve = null;
            }
        }
    }

    quit() {
        this.isReady = false;
        this.moveResolve = null;
    }
}

export default new ChessAI();
