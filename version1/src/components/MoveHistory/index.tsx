import React from 'react';
import { Move } from '../../types/game';
import './MoveHistory.css';

interface MoveHistoryProps {
  moves: Move[];
  currentMove: Move | null;
}

const MoveHistory: React.FC<MoveHistoryProps> = ({ moves, currentMove }) => {
  const formatMove = (move: Move) => {
    const base = `${move.from}-${move.to}`;
    return move.promotion ? `${base}=${move.promotion.toUpperCase()}` : base;
  };

  return (
    <div className="move-history">
      <h3 className="move-history-title">Move History</h3>
      <div className="moves-container">
        {moves.map((move, index) => {
          const moveNumber = Math.floor(index / 2) + 1;
          const isWhiteMove = index % 2 === 0;
          const isCurrentMove = currentMove && 
            move.from === currentMove.from && 
            move.to === currentMove.to;

          // Start of a new move pair
          if (isWhiteMove) {
            return (
              <div key={`${moveNumber}-${move.from}-${move.to}`} className="move-pair">
                <span className="move-number">{moveNumber}.</span>
                <span className={`move ${isCurrentMove ? 'current' : ''}`}>
                  {formatMove(move)}
                </span>
                {/* Add empty black move if this is the last move */}
                {index === moves.length - 1 && <span className="move empty" />}
              </div>
            );
          }

          // Black's move (completes the pair)
          return (
            <span 
              key={`${moveNumber}-${move.from}-${move.to}`}
              className={`move ${isCurrentMove ? 'current' : ''}`}
            >
              {formatMove(move)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MoveHistory;
