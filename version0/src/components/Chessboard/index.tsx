import React, { useCallback, useState } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';
import { Move, Square } from 'chess.js';

const BoardContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Chessboard: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  // Shared move highlighting logic
  const highlightMoves = useCallback((square: Square) => {
    const moves = state.gameInstance.moves({
      square,
      verbose: true
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return;
    }

    const newSquares: Record<string, any> = {};
    moves.forEach((move: Move) => {
      // Regular move dot
      if (!state.gameInstance.get(move.to)) {
        newSquares[move.to] = {
          background: 'radial-gradient(circle, rgba(0,0,0,.1) 35%, transparent 35%)',
          borderRadius: '50%'
        };
      } 
      // Capture move ring
      else {
        newSquares[move.to] = {
          background: 'radial-gradient(circle, transparent 40%, rgba(0,0,0,.1) 40%, rgba(0,0,0,.1) 60%, transparent 60%)',
          borderRadius: '50%'
        };
      }
    });

    // Selected square
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };

    setOptionSquares(newSquares);
  }, [state.gameInstance]);

  // Validate if a move is legal
  const isValidMove = useCallback((from: Square, to: Square): boolean => {
    const possibleMoves = state.gameInstance.moves({ 
      square: from,
      verbose: true 
    });
    
    return possibleMoves.some(
      m => m.from === from && m.to === to
    );
  }, [state.gameInstance]);

  // Handle click-to-move
  const onSquareClick = useCallback((square: Square) => {
    // Function to reset selections
    const resetSelection = () => {
      setSelectedSquare(null);
      setOptionSquares({});
    };

    // If no square is selected yet
    if (!selectedSquare) {
      const piece = state.gameInstance.get(square);
      // Check if it's a piece and it belongs to current player
      if (piece && piece.color === state.currentPlayer) {
        setSelectedSquare(square);
        highlightMoves(square);
      }
      return;
    }

    // If same square is clicked, deselect
    if (square === selectedSquare) {
      resetSelection();
      return;
    }

    // Try to make a move
    try {
      if (!isValidMove(selectedSquare, square)) {
        // If invalid move, check if clicking another own piece
        const piece = state.gameInstance.get(square);
        if (piece && piece.color === state.currentPlayer) {
          setSelectedSquare(square);
          highlightMoves(square);
        }
        return;
      }

      const move = {
        from: selectedSquare,
        to: square,
        promotion: 'q'
      };

      dispatch({ type: 'MAKE_MOVE', move });
      resetSelection();
    } catch (error) {
      console.error('Move error:', error);
      resetSelection();
    }
  }, [state.gameInstance, state.currentPlayer, selectedSquare, dispatch, highlightMoves, isValidMove]);

  // Handle drag-and-drop
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square) => {
    try {
      if (!isValidMove(sourceSquare, targetSquare)) {
        return false;
      }

      const move = {
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      };

      dispatch({ type: 'MAKE_MOVE', move });
      setOptionSquares({});
      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  }, [state.gameInstance, dispatch, isValidMove]);

  // Handle drag start
  const onPieceDragBegin = useCallback((piece: string, sourceSquare: Square) => {
    highlightMoves(sourceSquare);
  }, [highlightMoves]);

  // Handle drag end
  const onPieceDragEnd = useCallback(() => {
    setOptionSquares({});
  }, []);

  // Find king square
  const findKingSquare = useCallback((color: 'w' | 'b'): Square | null => {
    const board = state.gameInstance.board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece?.type === 'k' && piece?.color === color) {
          return `${String.fromCharCode(97 + j)}${8 - i}` as Square;
        }
      }
    }
    return null;
  }, [state.gameInstance]);

  // Calculate custom styles
  const customSquareStyles = {
    ...optionSquares,
    ...(state.lastMove && {
      [state.lastMove.from]: {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      },
      [state.lastMove.to]: {
        backgroundColor: 'rgba(255, 255, 0, 0.4)'
      }
    }),
    ...(state.gameInstance.inCheck() && (() => {
      const kingSquare = findKingSquare(state.currentPlayer);
      return kingSquare ? {
        [kingSquare]: {
          backgroundColor: 'rgba(255, 0, 0, 0.4)'
        }
      } : {};
    })())
  };

  return (
    <BoardContainer>
      <ReactChessboard
        position={state.gameInstance.fen()}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        onPieceDragBegin={onPieceDragBegin}
        onPieceDragEnd={onPieceDragEnd}
        customSquareStyles={customSquareStyles}
        boardOrientation="white"
        showBoardNotation={true}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        isDraggablePiece={({ piece }) => {
          // piece will be like 'wP' for white pawn, 'bK' for black king, etc.
          const pieceColor = piece[0].toLowerCase(); // get 'w' or 'b'
          return pieceColor === state.currentPlayer;
        }}
      />
    </BoardContainer>
  );
};

export default Chessboard;
