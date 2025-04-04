import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';

const BoardWrapper = styled.div`
    width: min(80vw, 640px);
    margin: 0 auto;
    position: relative;
    background: #2c3e50;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    ${props => props.isDisabled && `
        pointer-events: none;
        opacity: 0.8;
    `}
`;

const BoardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    border: 2px solid #2c3e50;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    aspect-ratio: 1;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
`;

const Square = styled.div`
    aspect-ratio: 1;
    position: relative;
    background-color: ${props => (props.isLight ? '#f0d9b5' : '#b58863')};
    cursor: ${props => props.isClickable ? 'pointer' : 'default'};
    transition: transform 0.15s ease;
    
    &:hover {
        transform: ${props => props.isClickable ? 'scale(1.02)' : 'none'};
    }
    
    ${props => props.isSelected && `
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            background: rgba(106, 159, 181, 0.4);
            z-index: 1;
        }
    `}

    ${props => props.isValidMove && `
        &::after {
            content: '';
            position: absolute;
            width: 30%;
            height: 30%;
            border-radius: 50%;
            background-color: rgba(106, 159, 181, 0.6);
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 1;
        }
    `}

    ${props => props.isLastMove && `
        box-shadow: inset 0 0 0 3px rgba(155, 199, 0, 0.6);
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
        transform: translate(0, 0) scale(1);
    }
    50% {
        transform: translate(0, -5px) scale(1.05);
    }
    100% {
        transform: translate(0, 0) scale(1);
    }
`;

const Piece = styled.div`
    position: absolute;
    top: 5%;
    left: 5%;
    width: 90%;
    height: 90%;
    background-image: url(${props => props.image});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    z-index: 2;
    pointer-events: none;
    animation: ${moveAnimation} 0.3s ease;
    filter: drop-shadow(2px 2px 2px rgba(0, 0, 0, 0.2));
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

const Board = ({ demoMode = false }) => {
    const { 
        game, 
        playerColor, 
        makeMove, 
        boardFlipped, 
        isGameActive,
        isAIGame,
        isAIThinking,
        lastMove
    } = useGame();
    
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
        // Preload images
        const preloadImages = () => {
            const pieces = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
            const colors = ['white', 'black'];
            
            colors.forEach(color => {
                pieces.forEach(piece => {
                    const img = new Image();
                    img.src = `/pieces/${color}-${piece}.png`;
                    img.onerror = (e) => console.error(`Failed to load piece image:`, e);
                });
            });
        };
        
        preloadImages();
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
        if (!isGameActive) return false;
        if (isAIThinking) return false;
        if (!piece) return validMoves.length > 0;
        return piece.color === (playerColor === 'white' ? 'w' : 'b');
    };

    const handleSquareClick = (square) => {
        const piece = game.get(square);

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
                    promotion: 'q' // Default to queen for now
                };

                if (makeMove(move)) {
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
    };

    // Determine board orientation
    const boardFiles = boardFlipped ? [...FILES].reverse() : FILES;
    const boardRanks = boardFlipped ? RANKS : [...RANKS].reverse();

    return (
        <BoardWrapper isDisabled={demoMode}>
            <BoardGrid>
                {boardRanks.map(rank =>
                    boardFiles.map(file => {
                        const square = file + rank;
                        const piece = game.get(square);
                        const fileIndex = FILES.indexOf(file);
                        const rankIndex = RANKS.indexOf(rank);
                        const isLight = (fileIndex + rankIndex) % 2 === (playerColor === 'white' ? 0 : 1);
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
                                {(playerColor === 'white' ? rank === '1' : rank === '8') && (
                                    <Coordinate 
                                        isLight={isLight}
                                        position="bottom-left"
                                    >
                                        {file}
                                    </Coordinate>
                                )}
                                
                                {/* Show rank coordinates on the leftmost file */}
                                {(playerColor === 'white' ? file === 'a' : file === 'h') && (
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
