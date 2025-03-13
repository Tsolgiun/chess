import React, { useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

const TimerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 20px;
`;

const PlayerTimer = styled.div<{ $active: boolean }>`
  flex: 1;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.$active ? 'var(--accent-color)' : 'var(--secondary-color)'};
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-primary)'};
  text-align: center;
  transition: background-color 0.3s ease;
`;

const Time = styled.div`
  font-size: 1.5em;
  font-weight: bold;
  font-family: monospace;
`;

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const Timer: React.FC = () => {
  const { state, dispatch } = useGame();
  const isWhiteActive = state.currentPlayer === 'w' && state.status === 'playing';
  const isBlackActive = state.currentPlayer === 'b' && state.status === 'playing';

  const updateTime = useCallback((color: 'w' | 'b') => {
    const player = color === 'w' ? state.playerWhite : state.playerBlack;
    if (player.timeLeft !== undefined && player.timeLeft > 0) {
      const newTime = player.timeLeft - 1;
      dispatch({ type: 'UPDATE_TIME', color, timeLeft: newTime });

      if (newTime === 0) {
        dispatch({ type: 'GAME_OVER', result: 'checkmate' });
      }
    }
  }, [dispatch, state.playerWhite.timeLeft, state.playerBlack.timeLeft]);

  useEffect(() => {
    if (state.status !== 'playing') return;

    const interval = setInterval(() => {
      if (state.currentPlayer === 'w') {
        updateTime('w');
      } else {
        updateTime('b');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state.status, state.currentPlayer, updateTime]);

  return (
    <TimerContainer>
      <PlayerTimer $active={isBlackActive}>
        <Time>{formatTime(state.playerBlack.timeLeft || 0)}</Time>
      </PlayerTimer>
      <PlayerTimer $active={isWhiteActive}>
        <Time>{formatTime(state.playerWhite.timeLeft || 0)}</Time>
      </PlayerTimer>
    </TimerContainer>
  );
};

export default Timer;
