import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BasePlatform } from './PlatformInterface';
import { FALLBACK_API_URL } from '../constants';

/**
 * WebPlatform - Web-specific implementation of PlatformInterface
 */
export class WebPlatform extends BasePlatform {
  // Piece image paths for web
  private pieceImages: Record<'w' | 'b', Record<'p' | 'n' | 'b' | 'r' | 'q' | 'k', any>> = {
    'w': {
      'p': require('../../../assets/pieces/white-pawn.png'),
      'n': require('../../../assets/pieces/white-knight.png'),
      'b': require('../../../assets/pieces/white-bishop.png'),
      'r': require('../../../assets/pieces/white-rook.png'),
      'q': require('../../../assets/pieces/white-queen.png'),
      'k': require('../../../assets/pieces/white-king.png'),
    },
    'b': {
      'p': require('../../../assets/pieces/black-pawn.png'),
      'n': require('../../../assets/pieces/black-knight.png'),
      'b': require('../../../assets/pieces/black-bishop.png'),
      'r': require('../../../assets/pieces/black-rook.png'),
      'q': require('../../../assets/pieces/black-queen.png'),
      'k': require('../../../assets/pieces/black-king.png'),
    }
  };

  /**
   * Get the path to a piece image
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @returns Path to the piece image
   */
  public getPieceImagePath(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b'): any {
    return this.pieceImages[color][type];
  }

  /**
   * Render a piece component
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @param square Square the piece is on (e.g., 'e2')
   * @returns React component for the piece
   */
  public renderPiece(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b', square: string): React.ReactNode {
    const { width } = this.getScreenDimensions();
    const BOARD_SIZE = Math.min(width - 32, 400);
    const PIECE_SIZE = BOARD_SIZE / 8 * 0.85;

    return (
      <View style={[styles.pieceContainer, { width: PIECE_SIZE, height: PIECE_SIZE }]}>
        <Image 
          source={this.getPieceImagePath(type, color)}
          style={styles.pieceImage}
          resizeMode="contain"
        />
      </View>
    );
  }

  /**
   * Get the appropriate API URL for the platform
   * @returns API URL
   */
  public getApiUrl(): string {
    // For web, we can use localhost directly
    return FALLBACK_API_URL;
  }

  /**
   * Get the appropriate storage key prefix for the platform
   * @returns Storage key prefix
   */
  public getStorageKeyPrefix(): string {
    return 'chessAppWeb_';
  }
}

const styles = StyleSheet.create({
  pieceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieceImage: {
    width: '90%',
    height: '90%',
  },
});

// Create a singleton instance
export const webPlatform = new WebPlatform();
