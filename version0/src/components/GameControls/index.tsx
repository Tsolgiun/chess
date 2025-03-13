import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

const ControlsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border-radius: 4px;
  border: none;
  background-color: var(--accent-color);
  color: var(--primary-color);
  font-weight: bold;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
`;

const GameStatus = styled.div`
  padding: 15px;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 10px;
`;

const GameControls: React.FC = () => {
  const { state, dispatch } = useGame();
  const isGameActive = state.status === 'playing';

  const handleNewGame = () => {
    dispatch({ type: 'NEW_GAME' });
  };

  const handleResign = () => {
    dispatch({ type: 'RESIGN' });
  };

  return (
    <ControlsContainer>
      <GameStatus>
        {state.status === 'waiting' && 'Game ready'}
        {state.status === 'playing' && `${state.currentPlayer === 'w' ? 'White' : 'Black'} to move`}
        {state.status === 'checkmate' && 'Checkmate!'}
        {state.status === 'draw' && 'Draw'}
        {state.status === 'stalemate' && 'Stalemate'}
      </GameStatus>

      <Button onClick={handleNewGame}>
        {isGameActive ? 'Restart Game' : 'New Game'}
      </Button>

      {isGameActive && (
        <>
          <SecondaryButton onClick={handleResign}>
            Resign
          </SecondaryButton>
          <SecondaryButton disabled>
            Offer Draw
          </SecondaryButton>
        </>
      )}
    </ControlsContainer>
  );
};

export default GameControls;
