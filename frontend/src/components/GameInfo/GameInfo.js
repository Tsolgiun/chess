import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';
import { useTheme } from '../../context/ThemeContext';
import GameResultModal from '../GameResultModal/GameResultModal';
import Timer from '../Timer/Timer';
import CapturedPieces from '../CapturedPieces/CapturedPieces';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    animation: ${fadeIn} 0.5s ease-out;
    transition: background-color 0.3s ease, color 0.3s ease;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.secondary};
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

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease, background-color 0.3s ease;

    &:hover {
        transform: translateX(4px);
        background: ${({ theme }) => theme.colors.highlight};
    }
`;

const Label = styled.span`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 0.95rem;
    transition: color 0.3s ease;
`;

const Value = styled.span`
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 500;
    padding: 4px 8px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 4px;
    font-size: 0.9rem;
    transition: color 0.3s ease, background-color 0.3s ease;
`;

const Status = styled.div`
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    padding: 12px;
    background: ${({ theme }) => theme.colors.highlight};
    border-radius: 8px;
    margin-top: 5px;
    animation: ${pulse} 2s infinite ease-in-out;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: color 0.3s ease, background-color 0.3s ease;
`;

const Button = styled.button`
    padding: 10px 20px;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.isDarkMode ? '#000000' : '#ffffff'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease, background-color 0.3s ease, color 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        opacity: 0.9;
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;

const GameInfo = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const {
        game,
        gameId,
        playerColor,
        status,
        isGameActive,
        gameOver,
        boardFlipped,
        setBoardFlipped,
        resetGameState,
        resignGame,
        offerDraw,
        acceptDraw,
        declineDraw,
        drawOffered,
        drawOfferFrom,
        isAIGame,
        opponentPlatform,
        timeRemaining
    } = useGame();

    const handleNewGame = () => {
        resetGameState();
        navigate('/');
    };

    if (!isGameActive) {
        return null;
    }

    return (
        <Container>
            <Timer 
                whiteTime={timeRemaining.white}
                blackTime={timeRemaining.black}
                isWhiteTurn={game.turn() === 'w'}
                isGameActive={isGameActive}
            />
            <CapturedPieces position={game.fen()} />
            <InfoRow>
                <Label>Game ID:</Label>
                <Value>{gameId}</Value>
            </InfoRow>
            <InfoRow>
                <Label>Your Color:</Label>
                <Value>{playerColor}</Value>
            </InfoRow>
            {opponentPlatform && (
                <InfoRow>
                    <Label>Opponent Platform:</Label>
                    <Value>{opponentPlatform}</Value>
                </InfoRow>
            )}
            <InfoRow>
                <Label>Board Orientation:</Label>
                <Button onClick={() => setBoardFlipped(!boardFlipped)}>
                    Flip Board
                </Button>
            </InfoRow>
            {!gameOver && isGameActive && (
                <InfoRow>
                    <Label>Game Controls:</Label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {!drawOffered && !isAIGame && (
                            <Button onClick={offerDraw}>
                                Offer Draw
                            </Button>
                        )}
                        {drawOffered && drawOfferFrom !== playerColor && (
                            <>
                                <Button onClick={acceptDraw}>
                                    Accept Draw
                                </Button>
                                <Button onClick={declineDraw}>
                                    Decline Draw
                                </Button>
                            </>
                        )}
                        <Button 
                            onClick={resignGame}
                            style={{ 
                                background: theme.isDarkMode ? '#c0392b' : '#e74c3c'
                            }}
                        >
                            Resign
                        </Button>
                    </div>
                </InfoRow>
            )}
            {gameOver && (
                <InfoRow>
                    <Button onClick={handleNewGame}>New Game</Button>
                </InfoRow>
            )}
            {!gameOver && <Status>{status}</Status>}
            <GameResultModal 
                show={gameOver}
                result={status}
                onNewGame={handleNewGame}
            />
        </Container>
    );
};

export default GameInfo;
