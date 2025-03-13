import React from 'react';
import { GameProvider } from './context/GameContext';
import styled from 'styled-components';
import './index.css';
import ChessErrorBoundary from './components/ErrorBoundary';

// Components to be created
const Chessboard = React.lazy(() => import('./components/Chessboard'));
const GameControls = React.lazy(() => import('./components/GameControls'));
const PlayerInfo = React.lazy(() => import('./components/PlayerInfo'));
const MoveHistory = React.lazy(() => import('./components/MoveHistory'));
const Timer = React.lazy(() => import('./components/Timer'));

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: var(--primary-color);
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 20px;
  padding: 20px;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  background-color: var(--secondary-color);
  border-radius: 8px;
  padding: 20px;
`;

const CenterPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const RightPanel = styled.div`
  background-color: var(--secondary-color);
  border-radius: 8px;
  padding: 20px;
`;

function App() {
  return (
    <GameProvider>
      <ChessErrorBoundary>
        <AppContainer>
          <MainLayout>
            <LeftPanel>
              <React.Suspense fallback={<div>Loading...</div>}>
                <PlayerInfo color="b" />
                <GameControls />
              </React.Suspense>
            </LeftPanel>

            <CenterPanel>
              <React.Suspense fallback={<div>Loading...</div>}>
                <Timer />
                <Chessboard />
              </React.Suspense>
            </CenterPanel>

            <RightPanel>
              <React.Suspense fallback={<div>Loading...</div>}>
                <PlayerInfo color="w" />
                <MoveHistory />
              </React.Suspense>
            </RightPanel>
          </MainLayout>
        </AppContainer>
      </ChessErrorBoundary>
    </GameProvider>
  );
}

export default App;
