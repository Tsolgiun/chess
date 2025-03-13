import React, { useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';

interface TimerProps {
  color: 'w' | 'b';
}

const Timer: React.FC<TimerProps> = ({ color }) => {
  const { state, dispatch } = useGame();
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const player = color === 'w' ? state.playerWhite : state.playerBlack;
  const isActive = state.currentPlayer === color && state.status === 'playing';
  const timeLeft = player.timeLeft ?? 0;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: 'UPDATE_TIME', color, timeLeft: timeLeft - 1 });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft, color, dispatch]);

  useEffect(() => {
    if (timeLeft <= 0 && isActive) {
      dispatch({ type: 'GAME_OVER', result: 'checkmate' });
    }
  }, [timeLeft, isActive, dispatch]);

  return null;
};

export default Timer;

