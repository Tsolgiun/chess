import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';
import Timer from '../Timer';

const PlayerContainer = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  border-radius: 8px;
  background-color: ${props => props.$active ? 'var(--accent-color)' : 'rgba(0, 0, 0, 0.2)'};
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-primary)'};
  transition: background-color 0.3s ease;
`;

const PlayerName = styled.div`
  font-size: 1.2em;
  font-weight: bold;
  text-align: center;
`;

const PlayerRating = styled.div`
  font-size: 0.9em;
  text-align: center;
`;

const TimeDisplay = styled.div`
  font-size: 1.8em;
  font-weight: bold;
  font-family: monospace;
  text-align: center;
`;

interface PlayerInfoProps {
  color: 'w' | 'b';
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ color }) => {
  const { state } = useGame();
  const player = color === 'w' ? state.playerWhite : state.playerBlack;
  const isActive = state.currentPlayer === color && state.status === 'playing';

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <PlayerContainer $active={isActive}>
      <PlayerName>{player.username}</PlayerName>
      <PlayerRating>{player.rating} ELO</PlayerRating>
      <TimeDisplay>{formatTime(player.timeLeft || 0)}</TimeDisplay>
      <Timer color={color} />
    </PlayerContainer>
  );
};

export default PlayerInfo;
