import React from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';

// Get screen width to make the pieces responsive
const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - 32, 400);
const PIECE_SIZE = BOARD_SIZE / 8 * 0.85; // Slightly smaller than the square

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: 'w' | 'b';
  square: string;
}

const Piece: React.FC<PieceProps> = ({ type, color, square }) => {
  // Get the appropriate piece image based on color and type
  const getPieceImage = () => {
    // Map of piece types to their respective image requires
    const pieceImages: Record<'w' | 'b', Record<'p' | 'n' | 'b' | 'r' | 'q' | 'k', any>> = {
      'w': {
        'p': require('../../assets/pieces/white-pawn.png'),
        'n': require('../../assets/pieces/white-knight.png'),
        'b': require('../../assets/pieces/white-bishop.png'),
        'r': require('../../assets/pieces/white-rook.png'),
        'q': require('../../assets/pieces/white-queen.png'),
        'k': require('../../assets/pieces/white-king.png'),
      },
      'b': {
        'p': require('../../assets/pieces/black-pawn.png'),
        'n': require('../../assets/pieces/black-knight.png'),
        'b': require('../../assets/pieces/black-bishop.png'),
        'r': require('../../assets/pieces/black-rook.png'),
        'q': require('../../assets/pieces/black-queen.png'),
        'k': require('../../assets/pieces/black-king.png'),
      }
    };

    return pieceImages[color][type];
  };

  return (
    <View style={styles.pieceContainer}>
      <Image 
        source={getPieceImage()}
        style={styles.pieceImage}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  pieceContainer: {
    width: PIECE_SIZE,
    height: PIECE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceImage: {
    width: '90%',
    height: '90%',
  },
});

export default Piece;
