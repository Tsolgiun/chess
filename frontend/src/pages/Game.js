import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from '../components/NavBar/NavBar';
import { motion } from 'framer-motion';
import Board from '../components/Board/Board';
import GameInfo from '../components/GameInfo/GameInfo';
import MoveHistory from '../components/MoveHistory/MoveHistory';
import { useGame } from '../context/GameContext';
import { useTheme } from '../context/ThemeContext';

const Container = styled(motion.div)`
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(auto, 700px) minmax(300px, 1fr);
  gap: 40px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
`;

const BoardWrapper = styled(motion.div)`
  position: relative;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const ContentWrapper = styled(motion.div)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const StatusMessage = styled.div`
  text-align: center;
  grid-column: 1 / -1;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;

  p {
    margin-top: 10px;
    opacity: 0.8;
  }
`;

const Game = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { joinGame, isGameActive, status, game } = useGame();
  const [moves, setMoves] = useState([]);

  // Track moves
  useEffect(() => {
    if (game) {
      const history = game.history();
      setMoves(history);
    }
  }, [game]);

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
        <NavBar />
        <StatusMessage>
          {status}
          <p>Redirecting to home page...</p>
        </StatusMessage>
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
      <NavBar />
      <BoardWrapper>
        <Board />
      </BoardWrapper>
      <ContentWrapper>
        <MoveHistory moves={moves} />
        <GameInfo />
      </ContentWrapper>
    </Container>
  );
};

export default Game;
