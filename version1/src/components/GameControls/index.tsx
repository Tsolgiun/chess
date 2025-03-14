import React from 'react';
import './GameControls.css';

interface GameControlsProps {
  gameState: 'waiting' | 'playing' | 'checkmate' | 'draw' | 'stalemate' | 'resigned';
  isPlayersTurn: boolean;
  onResign: () => void;
  onDrawOffer: () => void;
  onDrawAccept: () => void;
  onDrawDecline: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  gameState,
  isPlayersTurn,
  onResign,
  onDrawOffer,
  onDrawAccept,
  onDrawDecline
}) => {
  const isGameOver = gameState !== 'playing' && gameState !== 'waiting';

  return (
    <div className="game-controls">
      {isGameOver ? (
        <div className="game-status">
          {gameState === 'checkmate' && 'Checkmate!'}
          {gameState === 'draw' && 'Game drawn'}
          {gameState === 'stalemate' && 'Stalemate'}
          {gameState === 'resigned' && 'Player resigned'}
        </div>
      ) : (
        <div className="controls">
          {isPlayersTurn && (
            <>
              <button 
                className="control-button draw"
                onClick={onDrawOffer}
                disabled={!isPlayersTurn}
              >
                Offer Draw
              </button>
              <button 
                className="control-button resign"
                onClick={onResign}
                disabled={!isPlayersTurn}
              >
                Resign
              </button>
            </>
          )}
          {!isPlayersTurn && (
            <div className="draw-response">
              <button 
                className="control-button accept"
                onClick={onDrawAccept}
              >
                Accept Draw
              </button>
              <button 
                className="control-button decline"
                onClick={onDrawDecline}
              >
                Decline Draw
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameControls;
