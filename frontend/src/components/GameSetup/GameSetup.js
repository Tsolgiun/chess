import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useGame } from '../../context/GameContext';

const slideUp = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Container = styled.div`
    display: grid;
    gap: 30px;
    padding: 20px;
    animation: ${slideUp} 0.5s ease-out forwards;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 25px;
    background: ${props => props.variant === 'primary' ? 
        'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' : 
        'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

const Button = styled.button`
    padding: ${props => props.size === 'large' ? '16px 32px' : '12px 24px'};
    font-size: ${props => props.size === 'large' ? '1.2rem' : '1rem'};
    font-weight: 600;
    color: ${props => props.variant === 'primary' ? '#ffffff' : '#3498db'};
    background: ${props => props.variant === 'primary' ?
        'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' :
        'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'};
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
        background: ${props => props.variant === 'primary' ?
            'linear-gradient(135deg, #2980b9 0%, #2475a7 100%)' :
            'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'};
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        background: #cbd5e0;
        cursor: not-allowed;
        transform: none;
    }
`;

const Input = styled.input`
    padding: 12px 16px;
    font-size: 1rem;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    width: 240px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    background: white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }

    &::placeholder {
        color: #a0aec0;
    }
`;

const Status = styled.p`
    font-size: 1.1rem;
    color: ${props => props.variant === 'success' ? '#2ecc71' : '#2c3e50'};
    margin: 0;
    text-align: center;
    font-weight: 500;
    line-height: 1.5;
`;

const GameId = styled.div`
    font-size: 1.8rem;
    font-weight: 700;
    color: #2ecc71;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f0fff4 0%, #dcfce7 100%);
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(46, 204, 113, 0.1);
`;

const FormWrapper = styled.form`
    display: flex;
    gap: 12px;
    width: 100%;
    max-width: 500px;
    margin: 0 auto;
`;

const OrDivider = styled.div`
    display: flex;
    align-items: center;
    gap: 15px;
    width: 100%;
    margin: 20px 0;
    color: #a0aec0;
    font-weight: 500;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: #e2e8f0;
    }
`;

const GameSetup = () => {
    const navigate = useNavigate();
    const { createGame, joinGame, gameId, status, isGameActive } = useGame();
    const [joinGameId, setJoinGameId] = useState('');

    useEffect(() => {
        if (gameId && isGameActive) {
            navigate(`/game/${gameId}`);
        }
    }, [gameId, isGameActive, navigate]);

    const handleJoinGame = (e) => {
        e.preventDefault();
        if (joinGameId) {
            navigate(`/game/${joinGameId.toUpperCase()}`);
        }
    };

    if (isGameActive) {
        return (
            <Container>
                <Section variant="primary">
                    <Status variant="success">{status}</Status>
                    {gameId && <GameId>Game ID: {gameId}</GameId>}
                </Section>
            </Container>
        );
    }

    return (
        <Container>
            <Section>
                <Status>{status}</Status>
                <Button 
                    onClick={createGame} 
                    variant="primary" 
                    size="large"
                >
                    Create New Game
                </Button>
                
                <OrDivider>OR</OrDivider>
                
                <FormWrapper onSubmit={handleJoinGame}>
                    <Input
                        type="text"
                        placeholder="Enter Game ID to Join"
                        value={joinGameId}
                        onChange={(e) => setJoinGameId(e.target.value.toUpperCase())}
                        maxLength={6}
                    />
                    <Button 
                        type="submit" 
                        disabled={!joinGameId}
                        variant="primary"
                    >
                        Join Game
                    </Button>
                </FormWrapper>
            </Section>
        </Container>
    );
};

export default GameSetup;
