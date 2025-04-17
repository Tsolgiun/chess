import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import { loadSounds, playMoveSound } from '../../utils/sounds';

const BoardWrapper = styled.div`
    width: min(80vw, 640px);
    margin: 0 auto;
    position: relative;
    background: ${({ theme }) => theme.colors.primary};
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease, background-color 0.3s ease;
    ${props => props.isDisabled && `
        pointer-events: none;
        opacity: 0.8;
    `}
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 28px rgba(0, 0, 0, 0.35);
    }
`;

const BoardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    border: 2px solid ${({ theme }) => theme.colors.border};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    aspect-ratio: 1;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
`;

const Square = styled.div`
    aspect-ratio: 1;
    position: relative;
    background-color: ${props => (props.isLight ? '#ebecd0' : '#779556')};
    cursor: ${props => props.isClickable ? 'pointer' : 'default'};
    transition: all 0.2s ease;
    
    &:hover {
        transform: ${props => props.isClickable ? 'scale(1.01)' : 'none'};
        box-shadow: ${props => props.isClickable ? 'inset 0 0 30px rgba(255, 255, 255, 0.1)' : 'none'};
    }
    
    ${props => props.isSelected && `
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: ${({ theme }) => theme.colors.moveHighlight};
            z-index: 1;
        }
    `}

    ${props => props.isValidMove && `
        &::after {
            content: '';
            position: absolute;
            width: 33%;
            height: 33%;
            border-radius: 50%;
            background-color: ${props.isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.15)'};
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
            transition: all 0.2s ease;
        }
        
        &:hover::after {
            transform: translate(-50%, -50%) scale(1.2);
            background-color: ${props.isLight ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.22)'};
        }
    `}

    ${props => props.isLastMove && `
        background-color: ${props.isLight ? '#f6f669' : '#baca2b'};
        opacity: 0.85;
    `}
`;

const Coordinate = styled.div`
    position: absolute;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px;
    z-index: 1;
    user-select: none;
    opacity: 0.8;
    color: ${props => props.isLight ? '#b58863' : '#f0d9b5'};
    
    ${props => props.position === 'bottom-left' && `
        bottom: 2px;
        left: 2px;
    `}
    
    ${props => props.position === 'bottom-right' && `
        bottom: 2px;
        right: 2px;
    `}
    
    ${props => props.position === 'top-left' && `
        top: 2px;
        left: 2px;
    `}
`;

const moveAnimation = keyframes`
    0% {
        opacity: 0;
        transform: scale(0.8);
    }
    50% {
        opacity: 1;
        transform: scale(1.1);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
`;

const hoverAnimation = keyframes`
    0% {
        filter: brightness(1);
    }
    50% {
        filter: brightness(1.1);
    }
    100% {
        filter: brightness(1);
    }
`;

const Piece = styled.div`
    position: absolute;
    top: 2.5%;
    left: 2.5%;
    width: 95%;
    height: 95%;
    background-image: url(${props => props.image});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 2;
    pointer-events: none;
    animation: ${moveAnimation} 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.3));
    transition: all 0.2s ease;
    
    ${props => props.isClickable && `
        cursor: grab;
        animation: ${hoverAnimation} 2s infinite ease-in-out;
        
        &:hover {
            filter: drop-shadow(2px 4px 6px rgba(0, 0, 0, 0.4));
        }
        
        &:active {
            cursor: grabbing;
        }
    `}
`;


const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const DEMO_POSITIONS = [
    {
        board: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', // Starting position
        flip: false
    },
    {
        board: 'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1', // Common opening
        flip: false
    },
    {
        board: 'rnbqkb1r/pp2pppp/2p2n2/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq - 0 1', // Queens gambit
        flip: true
    }
];

const Board = ({ demoMode = false, analysisMode = false, position = null, boardFlipped = false, onBoardFlip }) => {
    const gameContext = useGame();
    const theme = useTheme();
    
    const { 
        game, 
        playerColor, 
        makeMove, 
        isGameActive,
        isAIGame,
        isAIThinking,
        lastMove
    } = analysisMode ? { 
        game: position, 
        playerColor: 'white',
        makeMove: () => true,
        isGameActive: true,
        isAIGame: false,
        isAIThinking: false,
        lastMove: null
    } : gameContext;

    // Use local state for analysis mode board flipping
    const [localBoardFlipped, setLocalBoardFlipped] = useState(boardFlipped);
    
    // Update localBoardFlipped when boardFlipped prop changes
    useEffect(() => {
        setLocalBoardFlipped(boardFlipped);
    }, [boardFlipped]);
    
    // Function to handle board flipping
    const handleBoardFlip = (flipped) => {
        setLocalBoardFlipped(flipped);
        // Notify parent component if onBoardFlip is provided
        if (onBoardFlip) {
            onBoardFlip(flipped);
        }
    };
    
    const effectiveBoardFlipped = analysisMode ? localBoardFlipped : boardFlipped;
    
    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);
    const [currentDemoPosition, setCurrentDemoPosition] = useState(0);
    
    // Demo mode auto-rotation
    useEffect(() => {
        if (demoMode) {
            const timer = setInterval(() => {
                setCurrentDemoPosition((prev) => 
                    prev === DEMO_POSITIONS.length - 1 ? 0 : prev + 1
                );
            }, 5000); // Rotate every 5 seconds
            
            return () => clearInterval(timer);
        }
    }, [demoMode]);
    
    // Set up demo position
    useEffect(() => {
        if (demoMode) {
            const position = DEMO_POSITIONS[currentDemoPosition];
            game.load(position.board);
            // Force a re-render by triggering state update
            setSelectedSquare(null);
            setValidMoves([]);
        }
    }, [demoMode, currentDemoPosition, game]);

    useEffect(() => {
        if (!isGameActive && !demoMode) {
            game.reset();
        }
    }, [game, isGameActive, demoMode]);

    useEffect(() => {
        // Preload images and sounds
        const preloadAssets = () => {
            // Preload images
            const pieces = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
            const colors = ['white', 'black'];
            
            colors.forEach(color => {
                pieces.forEach(piece => {
                    const img = new Image();
                    img.src = `/pieces/${color}-${piece}.png`;
                    img.onerror = (e) => console.error(`Failed to load piece image:`, e);
                });
            });

            // Preload sounds
            loadSounds();
        };
        
        preloadAssets();
    }, []);

    const getPieceImage = (piece) => {
        if (!piece) return null;
        const color = piece.color === 'w' ? 'white' : 'black';
        const pieceTypeMap = {
            'p': 'pawn',
            'n': 'knight',
            'b': 'bishop',
            'r': 'rook',
            'q': 'queen',
            'k': 'king'
        };
        const pieceType = pieceTypeMap[piece.type.toLowerCase()];
        return `/pieces/${color}-${pieceType}.png`;
    };

    const isSquareClickable = (piece) => {
        if (demoMode) return false;
        if (analysisMode) return true;
        if (!isGameActive) return false;
        if (isAIThinking) return false;
        if (!piece) return validMoves.length > 0;
        return piece.color === (playerColor === 'white' ? 'w' : 'b');
    };

    const handleSquareClick = (square) => {
        const piece = game.get(square);

        if (analysisMode) {
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }

            if (selectedSquare) {
                try {
                    game.move({
                        from: selectedSquare,
                        to: square,
                        promotion: 'q'
                    });
                } catch (error) {
                    console.log('Invalid move');
                }
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }

            if (piece) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true });
                setValidMoves(moves.map(move => move.to));
            }
        } else {
            // Normal game mode logic
            if (selectedSquare === square) {
                setSelectedSquare(null);
                setValidMoves([]);
                return;
            }

            if (selectedSquare) {
                if (validMoves.includes(square)) {
                    const move = {
                        from: selectedSquare,
                        to: square,
                        promotion: 'q'
                    };

                    const result = makeMove(move);
                    if (result) {
                        // Play appropriate sound
                        const moveNotation = game.history().slice(-1)[0];
                        const isCheck = game.isCheck();
                        playMoveSound(moveNotation, isCheck);
                        
                        setSelectedSquare(null);
                        setValidMoves([]);
                        return;
                    }
                }
                setSelectedSquare(null);
                setValidMoves([]);
            }

            if (piece && piece.color === (playerColor === 'white' ? 'w' : 'b')) {
                setSelectedSquare(square);
                const moves = game.moves({ square, verbose: true });
                setValidMoves(moves.map(move => move.to));
            }
        }
    };

    // Determine board orientation
    const boardFiles = effectiveBoardFlipped ? [...FILES].reverse() : FILES;
    const boardRanks = effectiveBoardFlipped ? RANKS : [...RANKS].reverse();

    return (
        <BoardWrapper isDisabled={demoMode}>
            <BoardGrid>
                {boardRanks.map(rank =>
                    boardFiles.map(file => {
                        const square = file + rank;
                        const piece = game.get(square);
                        const fileIndex = FILES.indexOf(file);
                        const rankIndex = RANKS.indexOf(rank);
                        // In standard chess, a1 is always dark (black)
                        // This ensures consistent coloring regardless of player color
                        const isLight = (fileIndex + rankIndex) % 2 === 1;
                        const pieceImage = getPieceImage(piece);
                        const isClickable = isSquareClickable(piece);
                        const isLastMoveSquare = lastMove && 
                            (square === lastMove.from || square === lastMove.to);

                        return (
                            <Square
                                key={square}
                                isLight={isLight}
                                isSelected={selectedSquare === square}
                                isValidMove={validMoves.includes(square)}
                                isClickable={isClickable}
                                isLastMove={isLastMoveSquare}
                                onClick={() => handleSquareClick(square)}
                            >
                                {/* Show file coordinates on the bottom rank */}
                                {(!effectiveBoardFlipped ? rank === '1' : rank === '8') && (
                                    <Coordinate 
                                        isLight={isLight}
                                        position="bottom-left"
                                    >
                                        {file}
                                    </Coordinate>
                                )}
                                
                                {/* Show rank coordinates on the leftmost file */}
                                {(!effectiveBoardFlipped ? file === 'a' : file === 'h') && (
                                    <Coordinate 
                                        isLight={isLight}
                                        position="top-left"
                                    >
                                        {rank}
                                    </Coordinate>
                                )}
                                
                                {pieceImage && <Piece image={pieceImage} />}
                            </Square>
                        );
                    })
                )}
            </BoardGrid>
        </BoardWrapper>
    );
};

export default Board;
