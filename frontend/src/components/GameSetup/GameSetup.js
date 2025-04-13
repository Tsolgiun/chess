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
    color: ${({ theme }) => theme.colors.text};
    transition: color 0.3s ease;
`;

const Section = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 25px;
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease, background-color 0.3s ease, color 0.3s ease;
    border: 1px solid ${({ theme }) => theme.colors.border};

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 20px rgba(0, 0, 0, 0.4);
    }
`;

const Button = styled.button`
    padding: ${props => props.size === 'large' ? '16px 32px' : '12px 24px'};
    font-size: ${props => props.size === 'large' ? '1.2rem' : '1rem'};
    font-weight: 600;
    color: ${props => props.variant === 'primary' ? 
        props.theme.colors.primary : 
        props.theme.colors.accent};
    background: ${props => props.variant === 'primary' ?
        props.theme.colors.accent :
        'transparent'};
    border: 2px solid ${props => props.variant === 'primary' ?
        'transparent' :
        props.theme.colors.accent};
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    min-width: 180px;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
        opacity: 0.9;
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        background: ${({ theme }) => theme.colors.border};
        border-color: transparent;
        color: ${({ theme }) => theme.colors.text};
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
    }
`;

const Input = styled.input`
    padding: 12px 16px;
    font-size: 1rem;
    border: 2px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    width: 240px;
    text-transform: uppercase;
    transition: all 0.3s ease;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.accent};
        box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.accent}33`};
    }

    &::placeholder {
        color: ${({ theme }) => `${theme.colors.text}99`};
    }
`;

const Status = styled.p`
    font-size: 1.1rem;
    color: ${props => props.variant === 'success' ? 
        props.theme.colors.accent : 
        props.theme.colors.text};
    margin: 0;
    text-align: center;
    font-weight: 500;
    line-height: 1.5;
`;

const GameId = styled.div`
    font-size: 1.8rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.accent};
    padding: 16px 24px;
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 8px;
    text-align: center;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    border: 2px solid ${({ theme }) => theme.colors.border};
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
    color: ${({ theme }) => `${theme.colors.text}99`};
    font-weight: 500;

    &::before,
    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: ${({ theme }) => theme.colors.border};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
`;

const GameSetup = () => {
    const navigate = useNavigate();
    const { createGame, joinGame, startAIGame, gameId, status, isGameActive } = useGame();
    const [joinGameId, setJoinGameId] = useState('');
    const [showAIOptions, setShowAIOptions] = useState(false);

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

    const handleAIGame = (color) => {
        startAIGame(color);
        navigate('/game/ai');
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
                
                <ButtonGroup>
                    <Button 
                        onClick={() => setShowAIOptions(false)}
                        variant={!showAIOptions ? "primary" : "secondary"}
                        size="large"
                    >
                        Play Online
                    </Button>
                    
                    <Button 
                        onClick={() => setShowAIOptions(true)}
                        variant={showAIOptions ? "primary" : "secondary"}
                        size="large"
                    >
                        Play vs AI
                    </Button>
                </ButtonGroup>

                {showAIOptions ? (
                    <ButtonGroup>
                        <Button
                            onClick={() => handleAIGame('white')}
                            variant="primary"
                        >
                            Play as White
                        </Button>
                        <Button
                            onClick={() => handleAIGame('black')}
                            variant="primary"
                        >
                            Play as Black
                        </Button>
                    </ButtonGroup>
                ) : (
                    <>
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
                    </>
                )}
            </Section>
        </Container>
    );
};

export default GameSetup;
