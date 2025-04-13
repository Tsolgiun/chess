import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar/NavBar';
import GameSetup from '../components/GameSetup/GameSetup';
import Board from '../components/Board/Board';
import { useGame } from '../context/GameContext';

const Container = styled(motion.div)`
  max-width: 1400px;
  margin: 80px auto 0;
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: ${({ theme }) => theme.colors.primary};
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  min-height: calc(100vh - 80px);

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
`;

const BoardWrapper = styled(motion.div)`
  position: relative;
  background: ${({ theme }) => theme.colors.secondary};
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  padding: 30px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
  }
`;

const BoardOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  backdrop-filter: blur(3px);
  pointer-events: none;
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease, opacity 0.3s ease;
`;

const OverlayText = styled.div`
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 20px 40px;
  background: ${({ theme }) => `${theme.colors.secondary}E6`};
  border-radius: 8px;
  transition: background-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
`;

const ContentWrapper = styled(motion.div)`
  background: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  padding: 30px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
  }
`;

const Home = () => {
  const { isGameActive } = useGame();
  
  const containerVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.8 }
    }
  };

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <>
      <NavBar />
      <Container
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
      <BoardWrapper>
        <Board demoMode={!isGameActive} />
        <BoardOverlay variants={overlayVariants}>
          <OverlayText>Start a game to play</OverlayText>
        </BoardOverlay>
      </BoardWrapper>
      <ContentWrapper>
        <GameSetup />
      </ContentWrapper>
      </Container>
    </>
  );
};

export default Home;
