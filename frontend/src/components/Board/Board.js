import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';

const BoardWrapper = styled.div`
    width: min(80vw, 600px);
    margin: 0 auto;
    position: relative;
    background: #2c3e50;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
`;

const BoardContainer = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: 1fr auto;
    gap: 0;
    aspect-ratio: 1.1;
    background: #fff;
    padding: 10px;
    border-radius: 4px;
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

const RankLabels = styled.div`
    display: grid;
    grid-template-rows: repeat(8, 1fr);
    padding-right: 15px;
    font-weight: 600;
    color: #fff;
    width: 24px;
`;

const FileLabels = styled.div`
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    padding-top: 15px;
    font-weight: 600;
    color: #fff;
    text-align: center;
    height: 24px;
`;

const Label = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: min(2.5vw, 14px);
    user-select: none;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
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
`;

const moveAnimation = keyframes`
    from {
        transform: scale(1.1);
        opacity: 0.8;
    }
    to {
        transform: scale(1);
        opacity: 1;
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

const Board = () => {
    const { game, playerColor, makeMove, boardFlipped, isGameActive } = useGame();
    
    // Set up initial position if the game is empty and not active
    React.useEffect(() => {
        if (!isGameActive) {
            game.reset();
            console.log('Board reset:', {
                fen: game.fen(),
                board: game.board(),
                pieces: game.board().flat().filter(Boolean)
            });
        }
    }, [game, isGameActive]);

    React.useEffect(() => {
        // Preload images
        const preloadImages = () => {
            const pieces = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
            const colors = ['white', 'black'];
            
            colors.forEach(color => {
                pieces.forEach(piece => {
                    const img = new Image();
                    const src = `/pieces/${color}-${piece}.png`;
                    img.src = src;
                    img.onload = () => console.log(`Successfully loaded: ${src}`);
                    img.onerror = (e) => console.error(`Failed to load: ${src}`, e);
                });
            });
        };
        
        preloadImages();
    }, []);

    // Debug logs
    React.useEffect(() => {
        const boardState = game.board();
        console.log('Current board state:', {
            fen: game.fen(),
            board: boardState,
            pieces: boardState.flat().filter(Boolean).map(p => ({
                type: p.type,
                color: p.color,
                image: getPieceImage(p)
            })),
            isGameActive,
            playerColor,
            boardFlipped
        });
    }, [game, isGameActive, playerColor, boardFlipped]);

    const [selectedSquare, setSelectedSquare] = useState(null);
    const [validMoves, setValidMoves] = useState([]);

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
        const imagePath = `/pieces/${color}-${pieceType}.png`;
        console.log('Getting piece image:', { piece, imagePath });
        return imagePath;
    };

    const isSquareClickable = (piece) => {
        if (!isGameActive) return false;
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

    const renderSquare = (file, rank) => {
        const square = file + rank;
        const piece = game.get(square);
        const isLight = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 !== 0;
        const pieceImage = getPieceImage(piece);
        const isClickable = isSquareClickable(piece);
        
        // Debug log for piece image path
        if (piece) {
            console.log(`Square ${square}:`, {
                piece,
                pieceImage,
                color: piece.color === 'w' ? 'white' : 'black',
                type: piece.type.toLowerCase()
            });
        }

        return (
            <Square
                key={square}
                isLight={isLight}
                isSelected={selectedSquare === square}
                isValidMove={validMoves.includes(square)}
                isClickable={isClickable}
                onClick={() => handleSquareClick(square)}
            >
                {pieceImage && <Piece image={pieceImage} />}
            </Square>
        );
    };

    const boardFiles = boardFlipped ? FILES : [...FILES].reverse();
    const boardRanks = boardFlipped ? [...RANKS].reverse() : RANKS;

    return (
        <BoardWrapper>
            <BoardContainer>
                <RankLabels>
                    {boardRanks.map(rank => (
                        <Label key={rank}>{rank}</Label>
                    ))}
                </RankLabels>
                <BoardGrid>
                    {boardRanks.map(rank =>
                        boardFiles.map(file => renderSquare(file, rank))
                    )}
                </BoardGrid>
                <div /> {/* Empty div for grid alignment */}
                <FileLabels>
                    {boardFiles.map(file => (
                        <Label key={file}>{file}</Label>
                    ))}
                </FileLabels>
            </BoardContainer>
        </BoardWrapper>
    );
};

export default Board;
