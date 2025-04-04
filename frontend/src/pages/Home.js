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

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    max-width: 800px;
  }
`;

const BoardWrapper = styled(motion.div)`
  position: relative;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
`;

const BoardOverlay = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  backdrop-filter: blur(2px);
  pointer-events: none;
`;

const OverlayText = styled.div`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  padding: 20px 40px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
`;

const ContentWrapper = styled(motion.div)`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
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
