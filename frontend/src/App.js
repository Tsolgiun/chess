import React from 'react';
import styled from 'styled-components';
import { GameProvider } from './context/GameContext';
import Board from './components/Board/Board';
import GameSetup from './components/GameSetup/GameSetup';
import GameInfo from './components/GameInfo/GameInfo';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
`;

function App() {
  return (
    <GameProvider>
      <Container>
        <Title>Online Chess</Title>
        <GameSetup />
        <GameInfo />
        <Board />
      </Container>
    </GameProvider>
  );
}

export default App;
