import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Chess } from 'chess.js';
import io from 'socket.io-client';
import ChessAI from '../services/ChessAI';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
    // State declarations
    const [socket, setSocket] = useState(null);
    const [game, setGame] = useState(() => new Chess());
    const [gameId, setGameId] = useState(null);
    const [playerColor, setPlayerColor] = useState(null);
    const [isGameActive, setIsGameActive] = useState(false);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [status, setStatus] = useState('Welcome to Online Chess!');
    const [gameOver, setGameOver] = useState(false);
    const [gameResult, setGameResult] = useState(null);
    const [isAIGame, setIsAIGame] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [lastMove, setLastMove] = useState(null);
    const [drawOffered, setDrawOffered] = useState(false);
    const [drawOfferFrom, setDrawOfferFrom] = useState(null);
    const [opponentPlatform, setOpponentPlatform] = useState(null);

    // Utility functions
    const updateStatus = useCallback((currentGame) => {
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
            setGameOver(true);
            setGameResult(statusText);
        } else {
            statusText = `${currentGame.turn() === 'w' ? 'White' : 'Black'} to move`;
            if (currentGame.isCheck()) {
                statusText += ', Check!';
            }
        }
        
        setStatus(statusText);
    }, []);

    // Handle AI moves
    const handleAIMove = useCallback(async (currentGame) => {
        if (!isAIGame || !isGameActive || gameOver || isAIThinking) return;

        const isAITurn = currentGame.turn() === (playerColor === 'white' ? 'b' : 'w');
        if (!isAITurn) return;

        console.log('AI turn check:', {
            isAITurn,
            turn: currentGame.turn(),
            playerColor,
            fen: currentGame.fen()
        });

        setIsAIThinking(true);
        try {
            // Create a clean game state for validation
            const validationGame = new Chess(currentGame.fen());
            if (validationGame.isGameOver()) {
                console.log('Game is already over, no AI move needed');
                setGameOver(true);
                updateStatus(validationGame);
                return;
            }

            const move = await ChessAI.getMove(currentGame.fen());
            console.log('AI returned move:', move);

            if (move) {
                const from = move.substring(0, 2);
                const to = move.substring(2, 4);
                const promotion = move.length === 5 ? move[4] : undefined;

                // Apply move to fresh game instance to prevent state corruption
                const newGame = new Chess(currentGame.fen());
                const moveResult = newGame.move({ from, to, promotion });

                if (moveResult) {
                    console.log('AI move applied:', moveResult);
                    setGame(newGame);
                    setLastMove({ from, to });

                    // Check for game ending conditions
                    if (newGame.isGameOver()) {
                        console.log('Game over after AI move');
                        setGameOver(true);
                    }

                    updateStatus(newGame);
                } else {
                    console.error('Invalid AI move:', { from, to, promotion });
                    // Try to recover by requesting a new move
                    if (!gameOver) {
                        console.log('Attempting move recovery...');
                        setTimeout(() => handleAIMove(currentGame), 1000);
                        return;
                    }
                }
            } else {
                console.error('No valid move returned from AI');
            }
        } catch (error) {
            console.error('AI move error:', error);
        } finally {
            setIsAIThinking(false);
        }
    }, [isAIGame, isGameActive, gameOver, isAIThinking, playerColor, updateStatus]);

    // Player move function
    const makeMove = useCallback((move) => {
        if (!isGameActive || gameOver) return false;
        
        const newGame = new Chess(game.fen());
        const result = newGame.move(move);
        
        if (result) {
            setGame(newGame);
            setLastMove({ from: move.from, to: move.to });
            updateStatus(newGame);

            if (!isAIGame && socket) {
                socket.emit('move', move);
            }
            return true;
        }
        return false;
    }, [game, isGameActive, gameOver, isAIGame, socket, updateStatus]);

    // Game management functions
    const resetGameState = useCallback(() => {
        const newGame = new Chess();
        setGame(newGame);
        setGameId(null);
        setPlayerColor(null);
        setIsGameActive(false);
        setBoardFlipped(false);
        setGameOver(false);
        setGameResult(null);
        setIsAIGame(false);
        setIsAIThinking(false);
        setLastMove(null);
        setDrawOffered(false);
        setDrawOfferFrom(null);
        setOpponentPlatform(null);
        setStatus('Welcome to Online Chess!');
    }, []);

    const startAIGame = useCallback((playerChosenColor = 'white') => {
        resetGameState();
        const newGame = new Chess();
        setGame(newGame);
        setIsAIGame(true);
        setIsGameActive(true);
        setPlayerColor(playerChosenColor);
        setBoardFlipped(playerChosenColor === 'black');
        setStatus(`Game started! You are playing as ${playerChosenColor} against AI`);
    }, [resetGameState]);

    // Effect to trigger AI moves
    useEffect(() => {
        if (game && !isAIThinking) {
            handleAIMove(game);
        }
    }, [game, handleAIMove, isAIThinking]);

    // Socket initialization and event handlers
    useEffect(() => {
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket', 'polling'],
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });
        
        // Log connection events for debugging
        newSocket.on('connect', () => {
            console.log('Socket connected successfully');
            
            // Send platform information
            newSocket.emit('setPlatform', { platform: 'web' });
        });
        
        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
        
        newSocket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });
        
        newSocket.on('reconnect', (attemptNumber) => {
            console.log('Socket reconnected after', attemptNumber, 'attempts');
        });
        
        window.socket = newSocket;
        setSocket(newSocket);

        return () => {
            newSocket.close();
            window.socket = null;
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('gameCreated', ({ gameId, color }) => {
            setGameId(gameId);
            setPlayerColor(color);
            setIsGameActive(true);
            setStatus('Waiting for an opponent to join...');
            const newGame = new Chess();
            setGame(newGame);
        });

        socket.on('gameJoined', ({ gameId, color, fen, opponentPlatform }) => {
            setGameId(gameId);
            setPlayerColor(color);
            setIsGameActive(true);
            setOpponentPlatform(opponentPlatform);
            setStatus(`Game started! You are playing as ${color === 'white' ? 'White' : 'Black'}.`);
            if (fen) {
                const newGame = new Chess(fen);
                setGame(newGame);
            }
            if (color === 'black') {
                setBoardFlipped(true);
            }
        });

        socket.on('opponentJoined', ({ platform }) => {
            setStatus('Game started! You are playing as White.');
            setOpponentPlatform(platform);
        });

        socket.on('moveMade', ({ from, to, promotion, fen }) => {
            const newGame = new Chess(fen);
            setGame(newGame);
            setLastMove({ from, to });
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

        socket.on('drawOffered', ({ from }) => {
            setDrawOffered(true);
            setDrawOfferFrom(from);
            setStatus(`${from === 'white' ? 'White' : 'Black'} offers a draw`);
        });

        socket.on('drawDeclined', ({ from }) => {
            setDrawOffered(false);
            setDrawOfferFrom(null);
            setStatus(`${from === 'white' ? 'White' : 'Black'} declined the draw offer`);
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
                socket.off('drawOffered');
                socket.off('drawDeclined');
            }
        };
    }, [socket, updateStatus]);

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
        isAIGame,
        isAIThinking,
        lastMove,
        opponentPlatform,
        createGame: useCallback(() => {
            if (socket) {
                resetGameState();
                socket.emit('createGame');
                setStatus('Creating a new game...');
            }
        }, [socket, resetGameState]),
        joinGame: useCallback((id) => {
            if (socket && id) {
                resetGameState();
                socket.emit('joinGame', { gameId: id.trim().toUpperCase() });
                setStatus('Joining game...');
            }
        }, [socket, resetGameState]),
        startAIGame,
        makeMove,
        resetGameState,
        setBoardFlipped,
        // Resign function
        resignGame: useCallback(() => {
            if (!isGameActive || gameOver) return;
            
            if (isAIGame) {
                setGameOver(true);
                setGameResult('Game Over - You resigned');
                setStatus('Game Over - You resigned');
            } else if (socket) {
                socket.emit('resign');
            }
        }, [isGameActive, gameOver, isAIGame, socket]),

        // Draw functions
        offerDraw: useCallback(() => {
            if (!isGameActive || gameOver || isAIGame || drawOffered) return;
            if (socket) {
                socket.emit('offerDraw');
                setStatus('Draw offered - waiting for opponent response');
            }
        }, [isGameActive, gameOver, isAIGame, drawOffered, socket]),

        acceptDraw: useCallback(() => {
            if (!isGameActive || gameOver || isAIGame || !drawOffered) return;
            if (socket) {
                socket.emit('acceptDraw');
            }
        }, [isGameActive, gameOver, isAIGame, drawOffered, socket]),

        declineDraw: useCallback(() => {
            if (!isGameActive || gameOver || isAIGame || !drawOffered) return;
            if (socket) {
                socket.emit('declineDraw');
                setDrawOffered(false);
                setDrawOfferFrom(null);
            }
        }, [isGameActive, gameOver, isAIGame, drawOffered, socket]),

        // Draw offer state
        drawOffered,
        drawOfferFrom
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
