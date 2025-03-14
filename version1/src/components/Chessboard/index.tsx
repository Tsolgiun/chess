import React, { useState, useEffect, useCallback } from 'react';
import { Chessboard as ReactChessboard } from 'react-chessboard';
import styled from 'styled-components';
import { Move, Square, Chess } from 'chess.js';

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

const MoveStatusIndicator = styled.div<{ status: 'idle' | 'pending' | 'success' | 'error' }>`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 5;
  transition: all 0.3s ease;
  background-color: ${props => {
    switch (props.status) {
      case 'pending': return '#f0ad4e'; // Yellow
      case 'success': return '#5cb85c'; // Green
      case 'error': return '#d9534f';   // Red
      default: return 'transparent';    // Hidden when idle
    }
  }};
  opacity: ${props => props.status === 'idle' ? 0 : 1};
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
`;

interface ChessboardProps {
  position: string; // FEN string
  orientation: 'white' | 'black';
  isPlayersTurn: boolean;
  onMove: (move: Partial<Move>) => void;
  moveStatus?: 'idle' | 'pending' | 'success' | 'error';
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
  onMove,
  moveStatus = 'idle'
}) => {
  // Keep local position state for immediate updates
  const [localPosition, setLocalPosition] = useState<string>(DEFAULT_POSITION);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  
  // Update local position when server position changes
  useEffect(() => {
    try {
      // Validate the position before setting it
      if (position && isValidFen(position)) {
        // Only update if server position is different and not during a pending move
        if (position !== localPosition && moveStatus !== 'pending') {
          setLocalPosition(position);
          setError(null);
        } else if (moveStatus === 'error') {
          // If there was an error, revert to server position
          setLocalPosition(position);
        }
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
  }, [position, moveStatus, localPosition]);
  
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
      
      // Update local position immediately
      setLocalPosition(prevPosition => {
        try {
          const chess = new Chess(prevPosition);
          chess.move({ 
            from: sourceSquare, 
            to: targetSquare,
            promotion
          });
          return chess.fen();
        } catch (err) {
          console.error('Error updating local position:', err);
          return prevPosition;
        }
      });
      
      // Store the last move for highlighting
      setLastMove({ from: sourceSquare, to: targetSquare });
      
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

  // Get custom square styles for highlighting the last move
  const getSquareStyles = useCallback(() => {
    if (!lastMove) return {};
    
    const highlightColor = 
      moveStatus === 'error' ? 'rgba(217, 83, 79, 0.4)' :
      moveStatus === 'pending' ? 'rgba(240, 173, 78, 0.4)' :
      moveStatus === 'success' ? 'rgba(92, 184, 92, 0.4)' :
      'rgba(100, 100, 255, 0.4)';
    
    return {
      [lastMove.from]: { backgroundColor: highlightColor },
      [lastMove.to]: { backgroundColor: highlightColor }
    };
  }, [lastMove, moveStatus]);

  return (
    <BoardContainer>
      {isLoading && (
        <LoadingOverlay>Loading board...</LoadingOverlay>
      )}
      {error && (
        <LoadingOverlay>Error: {error}</LoadingOverlay>
      )}
      <MoveStatusIndicator status={moveStatus} />
      <ReactChessboard
        id="chess-board"
        position={localPosition} // Use local position instead of prop
        onPieceDrop={onPieceDrop}
        boardOrientation={orientation}
        showBoardNotation={true}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        }}
        customDarkSquareStyle={{ backgroundColor: '#769656' }}
        customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
        customSquareStyles={getSquareStyles()}
        isDraggablePiece={({ piece }) => isPlayersTurn && !error && 
          ((orientation === 'white' && piece[0] === 'w') || 
           (orientation === 'black' && piece[0] === 'b'))}
        animationDuration={150} // Faster animation for more responsive feel
        transitionDuration={150} // Smoother transitions
      />
    </BoardContainer>
  );
};

export default Chessboard;
