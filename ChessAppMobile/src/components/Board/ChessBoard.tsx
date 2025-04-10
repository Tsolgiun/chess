import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Text } from 'react-native';
import { useGame } from '../../context/NewGameContext';
import { BOARD_COLORS } from '../../utils/constants';
import UnifiedPiece from './UnifiedPiece';
import { currentPlatform } from '../../utils/platform/PlatformFactory';

// Get screen width to make the board responsive
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400); // Maximum board size with padding
const SQUARE_SIZE = BOARD_SIZE / 8;

// Files and ranks for chess board coordinates
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

interface ChessBoardProps {
  flipped?: boolean;
}

const ChessBoard: React.FC<ChessBoardProps> = ({ flipped = false }) => {
  const { 
    gameState,
    isAIThinking,
    makeMove,
    getLegalMoves,
    getPiece
  } = useGame();

  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [validMoves, setValidMoves] = useState<string[]>([]);

  // Determine board orientation
  const boardFiles = flipped ? [...FILES].reverse() : FILES;
  const boardRanks = flipped ? RANKS : [...RANKS].reverse();

  // Handle square selection and moves
  const handleSquarePress = (square: string) => {
    // Get the piece at the selected square
    const piece = getPiece(square);

    // If a square is already selected
    if (selectedSquare) {
      // If the same square is pressed again, deselect it
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // If the selected square is a valid move destination
      if (validMoves.includes(square)) {
        // Attempt to make the move
        const moveResult = makeMove(
          selectedSquare,
          square,
          'q' // Default to queen for simplicity
        );

        // Reset selection regardless of move success
        setSelectedSquare(null);
        setValidMoves([]);
        return;
      }

      // If another square with a piece of the same color is selected
      if (piece && piece.color === (gameState.playerColor === 'white' ? 'w' : 'b')) {
        // Select the new square instead
        setSelectedSquare(square);
        const moves = getLegalMoves(square);
        setValidMoves(moves);
        return;
      }

      // If an invalid square is selected, clear the selection
      setSelectedSquare(null);
      setValidMoves([]);
      return;
    }

    // If no square is selected and the piece belongs to the player
    if (piece && piece.color === (gameState.playerColor === 'white' ? 'w' : 'b')) {
      setSelectedSquare(square);
      const moves = getLegalMoves(square);
      setValidMoves(moves);
    }
  };

  // Check if a square is clickable
  const isSquareClickable = (square: string) => {
    if (!gameState.isPlayerTurn || isAIThinking || gameState.gameOver) return false;
    
    const piece = getPiece(square);
    
    // If a square is already selected, only valid move destinations are clickable
    if (selectedSquare) {
      return square === selectedSquare || validMoves.includes(square);
    }
    
    // Otherwise, only squares with the player's pieces are clickable
    return piece && piece.color === (gameState.playerColor === 'white' ? 'w' : 'b');
  };

  // Render the chess board
  return (
    <View style={styles.container}>
      <View style={styles.board}>
        {boardRanks.map((rank, rankIndex) => (
          <View key={rank} style={styles.row}>
            {boardFiles.map((file, fileIndex) => {
              const square = file + rank;
              const piece = getPiece(square);
              const isLight = (fileIndex + rankIndex) % 2 === 0;
              const isSelected = selectedSquare === square;
              const isValidMove = validMoves.includes(square);
              const isLastMove = gameState.lastMove && (square === gameState.lastMove.from || square === gameState.lastMove.to);
              
              // Determine background color based on square state
              let backgroundColor;
              if (isSelected) {
                backgroundColor = BOARD_COLORS.SELECTED;
              } else if (isLastMove) {
                backgroundColor = isLight ? BOARD_COLORS.LAST_MOVE_LIGHT : BOARD_COLORS.LAST_MOVE_DARK;
              } else {
                backgroundColor = isLight ? BOARD_COLORS.LIGHT : BOARD_COLORS.DARK;
              }

              return (
                <TouchableOpacity
                  key={square}
                  style={[
                    styles.square,
                    { backgroundColor }
                  ]}
                  onPress={() => handleSquarePress(square)}
                  disabled={!isSquareClickable(square)}
                >
                  {/* Coordinates */}
                  {rankIndex === 7 && (
                    <Text style={[styles.coordinate, { bottom: 2, left: 2 }]}>
                      {file}
                    </Text>
                  )}
                  {fileIndex === 0 && (
                    <Text style={[styles.coordinate, { top: 2, right: 2 }]}>
                      {rank}
                    </Text>
                  )}
                  
                  {/* Valid move indicator */}
                  {isValidMove && (
                    <View style={styles.validMoveIndicator} />
                  )}
                  
                  {/* Chess piece */}
                  {piece && (
                    <UnifiedPiece 
                      type={piece.type as any} 
                      color={piece.color as any} 
                      square={square}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  board: {
    width: BOARD_SIZE,
    height: BOARD_SIZE,
    borderWidth: 2,
    borderColor: '#2c3e50',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    height: SQUARE_SIZE,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  coordinate: {
    position: 'absolute',
    fontSize: 10,
    color: 'rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
  },
  validMoveIndicator: {
    width: SQUARE_SIZE * 0.3,
    height: SQUARE_SIZE * 0.3,
    borderRadius: SQUARE_SIZE * 0.15,
    backgroundColor: BOARD_COLORS.VALID_MOVE,
    position: 'absolute',
  },
});

export default ChessBoard;
