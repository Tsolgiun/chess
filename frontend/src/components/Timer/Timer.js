import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const TimerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
`;

const PlayerTimer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: ${props => props.isActive ? ({ theme }) => theme.colors.accent : ({ theme }) => theme.colors.secondary};
    border-radius: 8px;
    transition: all 0.3s ease, background-color 0.3s ease;

    ${props => props.isActive && `
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateX(4px);
    `}
`;

const PlayerInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
`;

const Avatar = styled.div`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    font-size: 14px;
    transition: background-color 0.3s ease, color 0.3s ease;
`;

const PlayerName = styled.span`
    font-weight: 500;
    color: ${props => props.isActive ? ({ theme }) => theme.isDarkMode ? '#000000' : '#ffffff' : ({ theme }) => theme.colors.text};
    transition: color 0.3s ease;
`;

const Time = styled.span`
    font-family: 'Roboto Mono', monospace;
    font-size: 1.2rem;
    font-weight: 600;
    color: ${props => {
        if (props.isLow) return '#e74c3c';
        return props.isActive ? ({ theme }) => theme.isDarkMode ? '#000000' : '#ffffff' : ({ theme }) => theme.colors.text;
    }};
    transition: color 0.3s ease;
`;

const formatTime = (seconds) => {
    if (seconds < 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const Timer = ({ 
    whiteTime = 600, // 10 minutes default
    blackTime = 600,
    isWhiteTurn,
    isGameActive 
}) => {
    const theme = useTheme();
    const [whiteTimeLeft, setWhiteTimeLeft] = useState(whiteTime);
    const [blackTimeLeft, setBlackTimeLeft] = useState(blackTime);

    useEffect(() => {
        let interval;
        
        if (isGameActive) {
            interval = setInterval(() => {
                if (isWhiteTurn) {
                    setWhiteTimeLeft(prev => Math.max(0, prev - 1));
                } else {
                    setBlackTimeLeft(prev => Math.max(0, prev - 1));
                }
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isGameActive, isWhiteTurn]);

    return (
        <TimerContainer>
            <PlayerTimer isActive={!isWhiteTurn}>
                <PlayerInfo>
                    <Avatar>B</Avatar>
                    <PlayerName isActive={!isWhiteTurn}>Black</PlayerName>
                </PlayerInfo>
                <Time 
                    isActive={!isWhiteTurn} 
                    isLow={blackTimeLeft < 30}
                >
                    {formatTime(blackTimeLeft)}
                </Time>
            </PlayerTimer>
            
            <PlayerTimer isActive={isWhiteTurn}>
                <PlayerInfo>
                    <Avatar>W</Avatar>
                    <PlayerName isActive={isWhiteTurn}>White</PlayerName>
                </PlayerInfo>
                <Time 
                    isActive={isWhiteTurn} 
                    isLow={whiteTimeLeft < 30}
                >
                    {formatTime(whiteTimeLeft)}
                </Time>
            </PlayerTimer>
        </TimerContainer>
    );
};

export default Timer;
