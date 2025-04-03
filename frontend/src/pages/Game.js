import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Board from '../components/Board/Board';
import GameInfo from '../components/GameInfo/GameInfo';
import { useGame } from '../context/GameContext';

const Container = styled(motion.div)`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 40px;
  grid-column: 1 / -1;
`;

const Title = styled(Link)`
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
  }
`;

const BoardWrapper = styled(motion.div)`
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
`;

const ContentWrapper = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
    let navigationTimer;
    if (status.includes('Game not found') || status.includes('Failed to join')) {
      navigationTimer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
    }
    return () => {
      if (navigationTimer) clearTimeout(navigationTimer);
    };
  }, [status, navigate]);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8 }
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.5 }
    }
  };

  if (status.includes('Game not found') || status.includes('Failed to join')) {
    return (
      <Container
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Header>
          <Title to="/">chess.mn</Title>
        </Header>
        <div style={{ textAlign: 'center', gridColumn: '1 / -1' }}>
          {status}
          <p>Redirecting to home page...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Header>
        <Title to="/">chess.mn</Title>
      </Header>
      <BoardWrapper>
        <Board />
      </BoardWrapper>
      <ContentWrapper>
        <GameInfo />
      </ContentWrapper>
    </Container>
  );
};

export default Game;
