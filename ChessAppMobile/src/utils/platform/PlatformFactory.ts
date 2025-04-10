import { Platform } from 'react-native';
import { PlatformInterface } from './PlatformInterface';
import { mobilePlatform } from './MobilePlatform';
import { webPlatform } from './WebPlatform';

/**
 * PlatformFactory - Factory for creating platform-specific implementations
 */
export class PlatformFactory {
  /**
   * Get the appropriate platform implementation for the current platform
   * @returns Platform implementation
   */
  public static getPlatform(): PlatformInterface {
    if (Platform.OS === 'web') {
      return webPlatform;
    } else {
      return mobilePlatform;
    }
  }
}

// Export a singleton instance of the current platform
export const currentPlatform = PlatformFactory.getPlatform();
