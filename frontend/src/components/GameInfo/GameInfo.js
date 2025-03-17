import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin: 20px auto;
    max-width: 600px;
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background-color: white;
    border-radius: 4px;
`;

const Label = styled.span`
    font-weight: bold;
    color: #495057;
`;

const Value = styled.span`
    color: #007bff;
`;

const Status = styled.div`
    text-align: center;
    font-size: 18px;
    color: ${props => props.isGameOver ? '#dc3545' : '#28a745'};
    padding: 10px;
    background-color: ${props => props.isGameOver ? '#f8d7da' : '#d4edda'};
    border-radius: 4px;
    margin-top: 10px;
`;

const Button = styled.button`
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0056b3;
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
