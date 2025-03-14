import React from 'react';
import { User } from '../../types/game';
import './PlayerInfo.css';

interface PlayerInfoProps {
  player: User;
  color: 'white' | 'black';
  isCurrentTurn: boolean;
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player, color, isCurrentTurn }) => {
  return (
    <div className={`player-info ${color} ${isCurrentTurn ? 'active' : ''}`}>
      <div className="player-details">
        <span className="username">{player.username}</span>
        <span className="rating">({player.rating})</span>
      </div>
      <div className="time-info">
        {/* Timer will be added later */}
      </div>
    </div>
  );
};

export default PlayerInfo;
