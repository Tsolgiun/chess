import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import NavBar from '../components/NavBar/NavBar';
import { motion } from 'framer-motion';
import Board from '../components/Board/Board';
import GameInfo from '../components/GameInfo/GameInfo';
import MoveHistory from '../components/MoveHistory/MoveHistory';
import CapturedPieces from '../components/CapturedPieces/CapturedPieces';
import Timer from '../components/Timer/Timer';
import EvaluationBar from '../components/analysis/EvaluationBar';
import AnalysisLines from '../components/analysis/AnalysisLines';
import GameResultModal from '../components/GameResultModal/GameResultModal';
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

const ControlPanel = styled(motion.div)`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const GameControlBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: ${({ theme }) => theme.colors.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ControlButton = styled.button`
  background: ${props => props.danger ? '#e74c3c' : props.primary ? ({ theme }) => theme.colors.accent : ({ theme }) => theme.colors.primary};
  color: ${props => (props.danger || props.primary) ? '#fff' : ({ theme }) => theme.colors.text};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    opacity: 0.9;
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ControlButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.secondary};
`;

const Tab = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  font-weight: ${props => props.active ? '600' : '400'};
  color: ${props => props.active ? ({ theme }) => theme.colors.accent : ({ theme }) => theme.colors.text};
  border-bottom: 2px solid ${props => props.active ? ({ theme }) => theme.colors.accent : 'transparent'};
  transition: all 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const TabContent = styled.div`
  display: ${props => props.active ? 'block' : 'none'};
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.accent};
    }
  }
`;

const GameStatusBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background: ${({ theme }) => theme.colors.highlight};
  border-radius: 8px;
  margin-bottom: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
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
  const { gameId: routeGameId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState('moves');
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  const { 
    socket,
    joinGame, 
    isGameActive, 
    status, 
    moves,
    game, 
    gameId, 
    playerColor, 
    boardFlipped, 
    setBoardFlipped,
    timeRemaining,
    resetGameState,
    resignGame,
    offerDraw,
    acceptDraw,
    declineDraw,
    drawOffered,
    drawOfferFrom,
    isAIGame,
    gameOver,
    gameResult,
    setGameForReview
  } = useGame();
  
  const handleNewGame = useCallback(() => {
    resetGameState();
    navigate('/');
  }, [resetGameState, navigate]);

  const handleFlipBoard = useCallback(() => {
    setBoardFlipped(!boardFlipped);
  }, [setBoardFlipped, boardFlipped]);
  
  const handleReview = useCallback(() => {
    console.log("Review button clicked");
    
    try {
      // Generate a unique ID for AI games or use the existing gameId
      const reviewId = isAIGame ? `AI-${Date.now()}` : gameId;
      
      // Request review through socket for online games
      if (socket && !isAIGame) {
        console.log("Requesting review through socket");
        socket.emit('requestReview', { gameId: reviewId });
      }
      
      // Store the current game and moves for review
      const success = setGameForReview(game, moves, reviewId);
      
      if (success) {
        console.log(`Navigating to review page with ID: ${reviewId}`);
        // Navigate to the review page
        navigate(`/review/${reviewId}`);
      } else {
        console.error("Failed to save game for review");
        alert("Failed to prepare game for review. Please try again.");
      }
    } catch (error) {
      console.error("Error in review process:", error);
      alert("An error occurred while preparing the review. Please try again.");
    }
  }, [game, moves, gameId, navigate, setGameForReview, socket, isAIGame]);

  useEffect(() => {
    if (routeGameId && !isGameActive) {
      joinGame(routeGameId);
    }
  }, [routeGameId, joinGame, isGameActive]);

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
      <GameResultModal 
        show={gameOver} 
        result={gameResult} 
        onNewGame={handleNewGame}
        onReview={handleReview}
      />
      <BoardWrapper>
        <Board />
        {showAnalysis && <EvaluationBar evaluation={0} depth={15} nodes={150000} />}
      </BoardWrapper>
      <ControlPanel>
        <GameControlBar>
          <ControlButtonGroup>
            <ControlButton primary onClick={handleFlipBoard}>
              Flip Board
            </ControlButton>
            <ControlButton onClick={() => setShowAnalysis(!showAnalysis)}>
              {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
            </ControlButton>
            <ControlButton onClick={handleReview}>
              Review Game
            </ControlButton>
          </ControlButtonGroup>
          
          <ControlButtonGroup>
            {!gameOver && (
              <>
                {!drawOffered && !isAIGame && (
                  <ControlButton onClick={offerDraw}>
                    Offer Draw
                  </ControlButton>
                )}
                {drawOffered && drawOfferFrom !== playerColor && (
                  <>
                    <ControlButton primary onClick={acceptDraw}>
                      Accept Draw
                    </ControlButton>
                    <ControlButton onClick={declineDraw}>
                      Decline
                    </ControlButton>
                  </>
                )}
                <ControlButton danger onClick={resignGame}>
                  Resign
                </ControlButton>
              </>
            )}
            {gameOver && (
              <ControlButton primary onClick={handleNewGame}>
                New Game
              </ControlButton>
            )}
          </ControlButtonGroup>
        </GameControlBar>
        
        <Timer 
          whiteTime={timeRemaining.white}
          blackTime={timeRemaining.black}
          isWhiteTurn={game.turn() === 'w'}
          isGameActive={isGameActive}
        />
        
        <TabContainer>
          <Tab 
            active={activeTab === 'moves'} 
            onClick={() => setActiveTab('moves')}
          >
            Moves
          </Tab>
          <Tab 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
          >
            Analysis
          </Tab>
          <Tab 
            active={activeTab === 'info'} 
            onClick={() => setActiveTab('info')}
          >
            Info
          </Tab>
        </TabContainer>
        
        <TabContent active={activeTab === 'moves'}>
          <CapturedPieces position={game.fen()} />
          <MoveHistory 
            moves={moves}
            selectedMoveIndex={-1}
            onMoveClick={() => {}}
            onFirstMove={() => {}}
            onPreviousMove={() => {}}
            onNextMove={() => {}}
            onLastMove={() => {}}
          />
        </TabContent>
        
        <TabContent active={activeTab === 'analysis'}>
          <AnalysisLines 
            lines={[
              {
                evaluation: 0.35,
                depth: 18,
                moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6', 'Ba4', 'Nf6', 'O-O', 'Be7'],
                info: 'Ruy Lopez, Berlin Defense'
              },
              {
                evaluation: 0.25,
                depth: 17,
                moves: ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6', 'Bg5', 'Be7']
              }
            ]}
            engineName="Stockfish 16"
          />
        </TabContent>
        
        <TabContent active={activeTab === 'info'}>
          <GameStatusBar>{status}</GameStatusBar>
          <GameInfo />
        </TabContent>
      </ControlPanel>
    </Container>
  );
};

export default Game;
