import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Board from '../components/Board/Board';
import GameInfo from '../components/GameInfo/GameInfo';
import { useGame } from '../context/GameContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 300px 1fr 300px;
  gap: 30px;
  height: calc(100vh - 40px);
  animation: ${fadeIn} 0.6s ease-out;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`;

const Header = styled.header`
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
`;

const SidePanel = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1200px) {
    order: ${props => props.isRight ? 3 : 1};
  }
`;

const BoardContainer = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  @media (max-width: 1200px) {
    order: 2;
  }
`;

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { joinGame, isGameActive, status } = useGame();

  useEffect(() => {
    if (gameId && !isGameActive) {
      joinGame(gameId);
    }
  }, [gameId, joinGame, isGameActive]);

  useEffect(() => {
    if (status.includes('Game not found') || status.includes('Failed to join')) {
      setTimeout(() => {
        navigate('/');
      }, 3000);
    }
  }, [status, navigate]);

  return (
    <Container>
      <Header>
        <Title>Online Chess</Title>
      </Header>
      <SidePanel>
        <GameInfo />
      </SidePanel>
      <BoardContainer>
        <Board />
      </BoardContainer>
      <SidePanel isRight>
        <h2>Move History</h2>
        {/* Move history will be implemented later */}
      </SidePanel>
    </Container>
  );
};

export default Game;
