import React, { useState } from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
    padding: 10px 20px;
    font-size: 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
        background-color: #0056b3;
    }

    &:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
`;

const Input = styled.input`
    padding: 10px;
    font-size: 16px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    width: 200px;
    text-transform: uppercase;

    &:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }
`;

const Status = styled.p`
    font-size: 18px;
    color: #495057;
    margin: 10px 0;
    text-align: center;
`;

const GameId = styled.div`
    font-size: 24px;
    font-weight: bold;
    color: #28a745;
    padding: 10px;
    background-color: #e9ecef;
    border-radius: 4px;
    text-align: center;
`;

const GameSetup = () => {
    const { createGame, joinGame, gameId, status, isGameActive } = useGame();
    const [joinGameId, setJoinGameId] = useState('');

    const handleJoinGame = (e) => {
        e.preventDefault();
        if (joinGameId) {
            joinGame(joinGameId);
        }
    };

    if (isGameActive) {
        return (
            <Container>
                <Status>{status}</Status>
                {gameId && <GameId>Game ID: {gameId}</GameId>}
            </Container>
        );
    }

    return (
        <Container>
            <Status>{status}</Status>
            <Button onClick={createGame}>Create New Game</Button>
            <form onSubmit={handleJoinGame} style={{ display: 'flex', gap: '10px' }}>
                <Input
                    type="text"
                    placeholder="Enter Game ID"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
                    maxLength={6}
                />
                <Button type="submit" disabled={!joinGameId}>
                    Join Game
                </Button>
            </form>
        </Container>
    );
};

export default GameSetup;
