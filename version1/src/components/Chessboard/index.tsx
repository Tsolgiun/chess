import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import styled from 'styled-components';
import { Move, Square } from 'chess.js';

// Default starting position in FEN notation
const DEFAULT_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const BoardContainer = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  font-size: 1.5rem;
  font-weight: bold;
`;

interface ChessboardProps {
  position: string; // FEN string
  orientation: 'white' | 'black';
  isPlayersTurn: boolean;
  onMove: (move: Partial<Move>) => void;
}

// Function to validate FEN string
const isValidFen = (fen: string): boolean => {
  try {
    // Basic validation - check if it has the right format
    const parts = fen.split(' ');
    if (parts.length !== 6) return false;
    
    // More detailed validation could be added here
    return true;
  } catch (e) {
    return false;
  }
};

const Chessboard: React.FC<ChessboardProps> = ({
  position,
  orientation,
  isPlayersTurn,
  onMove
}) => {
  // Keep position in state to avoid unnecessary re-renders
  const [boardPosition, setBoardPosition] = useState<string>(DEFAULT_POSITION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update position when props change
  useEffect(() => {
    try {
      // Validate the position before setting it
      if (position && isValidFen(position)) {
        setBoardPosition(position);
        setError(null);
      } else if (position && !isValidFen(position)) {
        console.error('Invalid FEN position:', position);
        setError('Invalid board position');
        // Keep using the current valid position
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error setting board position:', err);
      setError('Error setting board position');
    }
  }, [position]);
  
  // Memoize the onPieceDrop function to prevent unnecessary re-renders
  const onPieceDrop = useCallback((sourceSquare: Square, targetSquare: Square, piece: string) => {
    // Don't allow moves if it's not the player's turn or if there's an error
    if (!isPlayersTurn || error) return false;
    
    try {
      // Get promotion piece if pawn is moving to the last rank
      const isPawnPromotion = 
        piece.toLowerCase() === 'p' && 
        ((targetSquare[1] === '8' && piece === 'wP') || 
         (targetSquare[1] === '1' && piece === 'bP'));
      
      // For now, always promote to queen
      const promotion = isPawnPromotion ? 'q' : undefined;
      
      // Call the onMove callback
      onMove({
        from: sourceSquare,
        to: targetSquare,
        promotion
      });
      
      // Return true to allow the move animation
      return true;
    } catch (err) {
      console.error('Error handling piece drop:', err);
      return false;
    }
  }, [isPlayersTurn, onMove, error]);

  return (
    <BoardContainer>
      {isLoading && (
        <LoadingOverlay>Loading board...</LoadingOverlay>
      )}
      {error && (
        <LoadingOverlay>Error: {error}</LoadingOverlay>
      )}
      <ReactChessboard
        id="chess-board"
        position={boardPosition}
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        showBoardNotation={true}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        isDraggablePiece={({ piece }) => isPlayersTurn && !error && 
          ((orientation === 'white' && piece[0] === 'w') || 
           (orientation === 'black' && piece[0] === 'b'))}
        animationDuration={200}
      />
    </BoardContainer>
  );
};

export default Chessboard;
