# Chess Application

A comprehensive chess application with mobile, web, and backend components.

## Project Structure

This project consists of three main components:

1. **ChessAppMobile**: A React Native mobile app with web support using Expo
2. **frontend**: A React web application
3. **backend**: A Node.js server with Socket.io for real-time communication

## Key Features

- Cross-platform support (mobile and web)
- Real-time multiplayer chess
- AI opponent with adjustable difficulty
- User authentication
- Game history and analysis
- Responsive design

## Architecture Improvements

The mobile app has been refactored to improve cross-platform compatibility and code organization:

### Modular Architecture

- **Separation of Concerns**: Game logic, networking, and UI are now separated
- **Platform Abstraction**: Platform-specific code is isolated behind interfaces
- **Unified Components**: Shared components work across platforms

### Cross-Platform Support

- **Socket Management**: Robust socket connection handling with fallback URLs
- **AI Integration**: Consistent AI behavior across platforms
- **Game State Management**: Unified game state management

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI (for mobile development): `npm install -g expo-cli`

### Installation

```bash
# Install dependencies for all components
npm run install:all

# Or install components individually
npm run install:backend
npm run install:mobile
npm run install:frontend
```

### Running the Application

#### Development Mode (Mobile App + Backend)

```bash
npm run dev:mobile
```

#### Development Mode (Web App + Backend)

```bash
npm run dev
```

#### Development Mode (React Frontend + Backend)

```bash
npm run dev:frontend
```

#### Running Components Individually

```bash
# Start the backend server
npm run start:backend

# Start the mobile app
npm run start:mobile

# Start the web version of the mobile app
npm run start:web

# Start the React frontend
npm run start:frontend
```

#### Building for Production

```bash
# Build the web version of the mobile app
npm run build:web
```

## Mobile App Architecture

The mobile app has been refactored with a clean architecture:

### Core Components

1. **SocketManager**: Handles socket connections with automatic reconnection and fallback URLs
2. **GameState**: Manages the state of a chess game, including board position, moves, and game status
3. **GameManager**: Provides a unified interface for game management across platforms
4. **ChessAIService**: Provides a unified interface for AI chess moves across platforms

### Platform Abstraction

1. **PlatformInterface**: Defines the interface for platform-specific functionality
2. **MobilePlatform**: Mobile-specific implementation
3. **WebPlatform**: Web-specific implementation
4. **PlatformFactory**: Factory for creating platform-specific implementations

### Unified Components

1. **UnifiedPiece**: Cross-platform chess piece component
2. **ChessBoard**: Cross-platform chess board component
3. **GameScreen**: Cross-platform game screen

## Documentation

Each component has its own README with detailed documentation:

- [ChessAppMobile Documentation](./ChessAppMobile/README.md)
- [Frontend Documentation](./frontend/README.md)
- [Backend Documentation](./backend/README.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Create a new Pull Request
