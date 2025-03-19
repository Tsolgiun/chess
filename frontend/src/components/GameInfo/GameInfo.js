import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';

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
    gap: 15px;
    padding: 20px;
    background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    animation: ${fadeIn} 0.5s ease-out;
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: transform 0.2s ease;

    &:hover {
        transform: translateX(5px);
    }
`;

const Label = styled.span`
    font-weight: 600;
    color: #2c3e50;
    font-size: 0.95rem;
`;

const Value = styled.span`
    color: #3498db;
    font-weight: 500;
    padding: 4px 8px;
    background: #f8f9fa;
    border-radius: 4px;
    font-size: 0.9rem;
`;

const Status = styled.div`
    text-align: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: ${props => props.isGameOver ? '#e74c3c' : '#2ecc71'};
    padding: 12px;
    background: ${props => props.isGameOver ? 
        'linear-gradient(135deg, #fdf2f2 0%, #fde8e8 100%)' : 
        'linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%)'};
    border-radius: 8px;
    margin-top: 5px;
    animation: ${pulse} 2s infinite ease-in-out;
    box-shadow: 0 2px 4px ${props => props.isGameOver ? 
        'rgba(231, 76, 60, 0.1)' : 
        'rgba(46, 204, 113, 0.1)'};
`;

const Button = styled.button`
    padding: 10px 20px;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        background: linear-gradient(135deg, #2980b9 0%, #2475a7 100%);
    }

    &:active {
        transform: translateY(0);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
`;

const GameInfo = () => {
    const {
        gameId,
        playerColor,
        status,
        isGameActive,
        gameOver,
        boardFlipped,
        setBoardFlipped,
        resetGame
    } = useGame();

    if (!isGameActive) {
        return null;
    }

    return (
        <Container>
            <InfoRow>
                <Label>Game ID:</Label>
                <Value>{gameId}</Value>
            </InfoRow>
            <InfoRow>
                <Label>Your Color:</Label>
                <Value>{playerColor}</Value>
            </InfoRow>
            <InfoRow>
                <Label>Board Orientation:</Label>
                <Button onClick={() => setBoardFlipped(!boardFlipped)}>
                    Flip Board
                </Button>
            </InfoRow>
            {gameOver && (
                <InfoRow>
                    <Button onClick={resetGame}>New Game</Button>
                </InfoRow>
            )}
            <Status isGameOver={gameOver}>{status}</Status>
        </Container>
    );
};

export default GameInfo;
