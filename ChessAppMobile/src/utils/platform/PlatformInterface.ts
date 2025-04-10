import { ReactNode } from 'react';
import { Dimensions, Platform } from 'react-native';

/**
 * PlatformInterface - Defines the interface for platform-specific functionality
 */
export interface PlatformInterface {
  /**
   * Get the current platform name
   * @returns 'web' or 'mobile'
   */
  getPlatformName(): 'web' | 'mobile';
  
  /**
   * Get the screen dimensions
   * @returns Object with width and height
   */
  getScreenDimensions(): { width: number; height: number };
  
  /**
   * Get the path to a piece image
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @returns Path to the piece image
   */
  getPieceImagePath(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b'): any;
  
  /**
   * Render a piece component
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @param square Square the piece is on (e.g., 'e2')
   * @returns React component for the piece
   */
  renderPiece(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b', square: string): ReactNode;
  
  /**
   * Get the appropriate storage key prefix for the platform
   * @returns Storage key prefix
   */
  getStorageKeyPrefix(): string;
  
  /**
   * Check if the device is in landscape orientation
   * @returns True if in landscape, false if in portrait
   */
  isLandscape(): boolean;
  
  /**
   * Get the appropriate API URL for the platform
   * @returns API URL
   */
  getApiUrl(): string;
}

/**
 * BasePlatform - Base implementation of PlatformInterface with common functionality
 */
export abstract class BasePlatform implements PlatformInterface {
  /**
   * Get the current platform name
   * @returns 'web' or 'mobile'
   */
  public getPlatformName(): 'web' | 'mobile' {
    return Platform.OS === 'web' ? 'web' : 'mobile';
  }
  
  /**
   * Get the screen dimensions
   * @returns Object with width and height
   */
  public getScreenDimensions(): { width: number; height: number } {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  }
  
  /**
   * Check if the device is in landscape orientation
   * @returns True if in landscape, false if in portrait
   */
  public isLandscape(): boolean {
    const { width, height } = this.getScreenDimensions();
    return width > height;
  }
  
  /**
   * Get the appropriate storage key prefix for the platform
   * @returns Storage key prefix
   */
  public getStorageKeyPrefix(): string {
    return 'chessApp_';
  }
  
  /**
   * Get the appropriate API URL for the platform
   * @returns API URL
   */
  public abstract getApiUrl(): string;
  
  /**
   * Get the path to a piece image
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @returns Path to the piece image
   */
  public abstract getPieceImagePath(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b'): any;
  
  /**
   * Render a piece component
   * @param type Piece type ('p', 'n', 'b', 'r', 'q', 'k')
   * @param color Piece color ('w' or 'b')
   * @param square Square the piece is on (e.g., 'e2')
   * @returns React component for the piece
   */
  public abstract renderPiece(type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color: 'w' | 'b', square: string): ReactNode;
}
