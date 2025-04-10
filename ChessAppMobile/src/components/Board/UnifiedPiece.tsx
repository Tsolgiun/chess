import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { currentPlatform } from '../../utils/platform/PlatformFactory';

// Get screen width to make the pieces responsive
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const PIECE_SIZE = BOARD_SIZE / 8 * 0.85; // Slightly smaller than the square

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  square: string;
}

/**
 * UnifiedPiece - A cross-platform chess piece component
 * Uses the platform abstraction to render the appropriate piece for the current platform
 */
const UnifiedPiece: React.FC<PieceProps> = ({ type, color, square }) => {
  // Use the platform-specific implementation to render the piece
  return currentPlatform.renderPiece(type, color, square);
};

export default UnifiedPiece;
