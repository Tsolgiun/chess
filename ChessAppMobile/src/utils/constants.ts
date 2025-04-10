// API URL for the backend server
// Use localhost for emulators, or your computer's IP address for physical devices
export const API_URL = 'http://10.0.2.2:3001'; // Special IP for Android emulator to access host machine

// Fallback URL if the above doesn't work
export const FALLBACK_API_URL = 'http://localhost:3001';

// Chess piece Unicode symbols
export const PIECE_SYMBOLS = {
  'w': {
    'p': '♙',
    'n': '♘',
    'b': '♗',
    'r': '♖',
    'q': '♕',
    'k': '♔',
  },
  'b': {
    'p': '♟',
    'n': '♞',
    'b': '♝',
    'r': '♜',
    'q': '♛',
    'k': '♚',
  }
};

// Board colors
export const BOARD_COLORS = {
  LIGHT: '#ebecd0',
  DARK: '#779556',
  SELECTED: 'rgba(255, 255, 0, 0.35)',
  VALID_MOVE: 'rgba(0, 0, 0, 0.2)',
  LAST_MOVE_LIGHT: '#f6f669',
  LAST_MOVE_DARK: '#baca2b',
};

// Game types
export const GAME_TYPES = {
  AI: 'ai',
  ONLINE: 'online',
  LOCAL: 'local',
};

// Screen names for navigation
export const SCREENS = {
  HOME: 'Home',
  GAME: 'Game',
  PROFILE: 'Profile',
  ANALYSIS: 'Analysis',
  LOGIN: 'Login',
  REGISTER: 'Register',
};
