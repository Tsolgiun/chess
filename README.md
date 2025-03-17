# Online Chess Game

A real-time multiplayer chess game built with React, Node.js, and Socket.IO.

## Project Structure

```
.
├── backend/           # Node.js + Socket.IO server
│   ├── server.js     # Game server implementation
│   └── package.json  # Backend dependencies
└── frontend/         # React application
    └── ...          # React components and logic
```

## Setup Instructions

### Backend

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start the server:
```bash
npm start
```
The server will run on http://localhost:3001

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm start
```
The frontend will run on http://localhost:5000

## Features

- Real-time multiplayer chess gameplay
- Game rooms with unique IDs
- Move validation using chess.js
- Real-time chat between players
- Game state tracking (check, checkmate, draws)
- Piece promotion
- Game over conditions detection
- Responsive design

## Technologies Used

- Backend:
  - Node.js
  - Express
  - Socket.IO
  - chess.js

- Frontend:
  - React
  - Socket.IO Client
  - Styled Components
