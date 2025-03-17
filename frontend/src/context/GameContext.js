import React, { createContext, useState, useEffect, useContext } from 'react';
import { Chess } from 'chess.js';
import io from 'socket.io-client';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [game, setGame] = useState(() => {
        const newGame = new Chess();
        newGame.reset(); // Ensure the board is set to initial position
        return newGame;
    });
    const [gameId, setGameId] = useState(null);
    const [playerColor, setPlayerColor] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [status, setStatus] = useState('Welcome to Online Chess!');
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    // Socket event handlers
    useEffect(() => {
        if (!socket) return;

        socket.on('gameCreated', ({ gameId, color }) => {
            setGameId(gameId);
            setPlayerColor(color);
            setIsGameActive(true);
            setStatus('Waiting for an opponent to join...');
            game.reset();
        });

        socket.on('gameJoined', ({ gameId, color, fen }) => {
            setGameId(gameId);
            setPlayerColor(color);
            setIsGameActive(true);
            setStatus('Game started! You are playing as Black.');
            if (fen) {
                game.load(fen);
                setGame(new Chess(fen));
            }
            if (color === 'black') {
                setBoardFlipped(true);
            }
        });

        socket.on('opponentJoined', () => {
            setStatus('Game started! You are playing as White.');
        });

        socket.on('moveMade', ({ from, to, promotion, fen }) => {
            const newGame = new Chess(fen);
            setGame(newGame);
            updateStatus(newGame);
        });

        socket.on('error', ({ message }) => {
            setStatus(`Error: ${message}`);
        });

        socket.on('gameOver', ({ result }) => {
            setGameOver(true);
            setGameResult(result);
            setStatus(result);
        });

        socket.on('opponentDisconnected', () => {
            setStatus('Your opponent has disconnected.');
            setIsGameActive(false);
        });

        return () => {
            if (socket) {
                socket.off('gameCreated');
                socket.off('gameJoined');
                socket.off('opponentJoined');
                socket.off('moveMade');
                socket.off('error');
                socket.off('gameOver');
                socket.off('opponentDisconnected');
            }
        };
    }, [socket, game]);

    const createGame = () => {
        if (socket) {
            socket.emit('createGame');
            setStatus('Creating a new game...');
        }
    };

    const joinGame = (id) => {
        if (socket && id) {
            socket.emit('joinGame', { gameId: id.trim().toUpperCase() });
            setStatus('Joining game...');
        }
    };

    const makeMove = (move) => {
        if (!socket || !isGameActive || gameOver) return false;
        
        try {
            const result = game.move(move);
            if (result) {
                socket.emit('move', move);
                updateStatus(game);
                return true;
            }
        } catch (error) {
            console.error('Invalid move:', error);
        }
        return false;
    };

    const updateStatus = (currentGame) => {
        let statusText = '';
        
        if (currentGame.isGameOver()) {
            if (currentGame.isCheckmate()) {
                statusText = `Checkmate! ${currentGame.turn() === 'w' ? 'Black' : 'White'} wins!`;
            } else if (currentGame.isDraw()) {
                if (currentGame.isStalemate()) {
                    statusText = 'Game over! Stalemate!';
                } else if (currentGame.isThreefoldRepetition()) {
                    statusText = 'Game over! Draw by threefold repetition!';
                } else if (currentGame.isInsufficientMaterial()) {
                    statusText = 'Game over! Draw by insufficient material!';
                } else {
                    statusText = 'Game over! Draw!';
                }
            }
        } else {
            statusText = `${currentGame.turn() === 'w' ? 'White' : 'Black'} to move`;
            if (currentGame.isCheck()) {
                statusText += ', Check!';
            }
        }
        
        setStatus(statusText);
    };

    const resetGame = () => {
        const newGame = new Chess();
        setGame(newGame);
        setGameId(null);
        setPlayerColor(null);
        setIsGameActive(false);
        setBoardFlipped(false);
        setStatus('Welcome to Online Chess!');
        setGameOver(false);
        setGameResult(null);
    };

    const value = {
        socket,
        game,
        gameId,
        playerColor,
        isGameActive,
        boardFlipped,
        status,
        gameOver,
        gameResult,
        createGame,
        joinGame,
        makeMove,
        resetGame,
        setBoardFlipped
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};

export default GameContext;
