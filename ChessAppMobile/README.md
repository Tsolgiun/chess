# Chess App Mobile

A cross-platform chess application built with React Native and Expo, supporting both mobile and web platforms.

## Features

- Play chess against AI with adjustable difficulty
- Play online against other players
- Cross-platform support (mobile and web)
- Responsive design
- Authentication system
- Game history and analysis

## Architecture

The application follows a modular architecture with clear separation of concerns:

### Core Components

- **GameState**: Manages the state of a chess game, including board position, moves, and game status
- **GameManager**: Provides a unified interface for game management across platforms
- **SocketManager**: Handles socket.io connections with automatic reconnection and fallback URLs
- **ChessAIService**: Provides a unified interface for AI chess moves across platforms

### Platform Abstraction

The application uses a platform abstraction layer to handle platform-specific differences:

- **PlatformInterface**: Defines the interface for platform-specific functionality
- **MobilePlatform**: Mobile-specific implementation
- **WebPlatform**: Web-specific implementation
- **PlatformFactory**: Factory for creating platform-specific implementations

### Unified Components

- **UnifiedPiece**: Cross-platform chess piece component
- **ChessBoard**: Cross-platform chess board component

## Project Structure

```
ChessAppMobile/
├── assets/                  # Static assets (images, fonts, etc.)
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Board/           # Chess board components
│   │   └── ...
│   ├── context/             # React context providers
│   ├── navigation/          # Navigation configuration
│   ├── screens/             # Screen components
│   ├── utils/               # Utility functions and classes
│   │   ├── ai/              # AI-related functionality
│   │   ├── game/            # Game-related functionality
│   │   ├── network/         # Network-related functionality
│   │   └── platform/        # Platform-specific functionality
│   └── ...
├── web/                     # Web-specific files
├── App.tsx                  # Main app component
├── index.ts                 # Entry point for mobile
├── index.web.js             # Entry point for web
└── ...
```

## Running the App

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Mobile

```bash
# Install dependencies
npm install

# Start the Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Web

```bash
# Install dependencies
npm install

# Start the web version
npm run web:dev

# Or use the run-web.bat script (Windows)
./run-web.bat

# Build for production
npm run build:web
```

## Cross-Platform Development

The application is designed to work seamlessly across platforms:

- **Mobile**: Uses React Native components and APIs
- **Web**: Uses Expo's web support with React Native Web
- **Shared Logic**: Core game logic and state management is shared across platforms
- **Platform Abstraction**: Platform-specific code is isolated behind interfaces

## Backend Integration

The application communicates with a Node.js backend server using Socket.io for real-time communication. The backend provides:

- Authentication
- Game state persistence
- Matchmaking
- AI move calculation using Stockfish

## Key Improvements

1. **Modular Architecture**: Clear separation of concerns for better maintainability
2. **Platform Abstraction**: Platform-specific code is isolated behind interfaces
3. **Unified Components**: Shared components work across platforms
4. **Robust Socket Management**: Automatic reconnection and fallback URLs
5. **Consistent AI Behavior**: Same AI experience across platforms

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request
