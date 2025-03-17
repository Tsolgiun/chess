import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Board from '../components/Board/Board';
import GameInfo from '../components/GameInfo/GameInfo';
import { useGame } from '../context/GameContext';

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
      <Title>Online Chess</Title>
      <GameInfo />
      <Board />
    </Container>
  );
};

export default Game;
