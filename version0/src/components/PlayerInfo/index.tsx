import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

interface PlayerInfoProps {
  color: 'w' | 'b';
}

const PlayerContainer = styled.div`
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.2);
  margin-bottom: 20px;
`;

const PlayerHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: var(--primary-color);
`;

const PlayerDetails = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: bold;
  color: var(--text-primary);
`;

const Rating = styled.div`
  color: var(--text-secondary);
  font-size: 0.9em;
`;

const CapturedPieces = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
`;

const PlayerInfo: React.FC<PlayerInfoProps> = ({ color }) => {
  const { state } = useGame();
  const player = color === 'w' ? state.playerWhite : state.playerBlack;

  return (
    <PlayerContainer>
      <PlayerHeader>
        <Avatar>{player.username[0].toUpperCase()}</Avatar>
        <PlayerDetails>
          <Username>{player.username}</Username>
          <Rating>{player.rating}</Rating>
        </PlayerDetails>
      </PlayerHeader>
      <CapturedPieces>
        {/* TODO: Add captured pieces display */}
      </CapturedPieces>
    </PlayerContainer>
  );
};

export default PlayerInfo;
