import React from 'react';
import styled from 'styled-components';
import { GameProvider } from './context/GameContext';
import Chessboard from './components/Chessboard';
import GameControls from './components/GameControls';
import PlayerInfo from './components/PlayerInfo';
import MoveHistory from './components/MoveHistory';
import './index.css';
import ChessErrorBoundary from './components/ErrorBoundary';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
`;

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InfoPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

function App() {
  return (
    <GameProvider>
      <ChessErrorBoundary>
        <AppContainer>
          <BoardContainer>
            <Chessboard />
            <GameControls />
          </BoardContainer>
          <InfoPanel>
            <PlayerInfo color="b" />
            <PlayerInfo color="w" />
            <MoveHistory />
          </InfoPanel>
        </AppContainer>
      </ChessErrorBoundary>
    </GameProvider>
  );
}

export default App;
