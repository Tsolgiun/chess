import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
`;

const tickAnimation = keyframes`
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

const TimerContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
    padding: 15px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
`;

const PlayerTimer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 12px 16px;
    background: ${props => props.isActive ? ({ theme }) => theme.colors.primary : ({ theme }) => `${theme.colors.primary}80`};
    border-radius: 10px;
    transition: all 0.3s ease, background-color 0.3s ease;
    position: relative;
    overflow: hidden;

    ${props => props.isActive && `
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
    `}
    
    ${props => props.isLow && props.isActive && css`
        animation: ${pulse} 1.5s infinite;
    `}
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => props.isActive ? ({ theme }) => theme.colors.accent : 'transparent'};
    }
`;

const TimerHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
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
    background: ${props => props.isActive ? ({ theme }) => theme.colors.accent : ({ theme }) => theme.colors.secondary};
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    color: ${props => props.isActive ? '#fff' : ({ theme }) => theme.colors.text};
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: ${props => props.isActive ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none'};
    
    ${props => props.isActive && css`
        animation: ${tickAnimation} 1s infinite;
    `}
`;

const PlayerName = styled.span`
    font-weight: ${props => props.isActive ? '600' : '500'};
    color: ${({ theme }) => theme.colors.text};
    transition: all 0.3s ease;
`;

const Time = styled.span`
    font-family: 'Roboto Mono', monospace;
    font-size: 1.3rem;
    font-weight: 600;
    color: ${props => {
        if (props.isLow) return '#e74c3c';
        return ({ theme }) => theme.colors.text;
    }};
    transition: color 0.3s ease;
    letter-spacing: 0.5px;
`;

const TimerProgressBar = styled.div`
    height: 4px;
    background: ${({ theme }) => `${theme.colors.secondary}80`};
    border-radius: 2px;
    margin-top: 8px;
    overflow: hidden;
    
    &::after {
        content: '';
        display: block;
        height: 100%;
        width: ${props => props.percentage}%;
        background: ${props => props.isLow ? '#e74c3c' : ({ theme }) => theme.colors.accent};
        transition: width 1s linear;
    }
`;

const formatTime = (seconds) => {
    if (seconds === undefined || seconds < 0) return '0:00';
    
    if (seconds >= 3600) {
        // Format as h:mm:ss for times >= 1 hour
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
        // Format as m:ss for times < 1 hour
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
};

// Calculate percentage of time remaining based on initial time
const calculateTimePercentage = (currentTime, initialTime = 600) => {
    if (currentTime <= 0) return 0;
    if (currentTime >= initialTime) return 100;
    return (currentTime / initialTime) * 100;
};

const Timer = ({ 
    whiteTime = 600, // 10 minutes default
    blackTime = 600,
    isWhiteTurn,
    isGameActive,
    initialTime = 600 // Initial time in seconds (10 minutes)
}) => {
    const theme = useTheme();
    const whiteTimePercentage = calculateTimePercentage(whiteTime, initialTime);
    const blackTimePercentage = calculateTimePercentage(blackTime, initialTime);
    
    const isWhiteLow = whiteTime < 30;
    const isBlackLow = blackTime < 30;

    return (
        <TimerContainer>
            <PlayerTimer 
                isActive={!isWhiteTurn && isGameActive} 
                isLow={isBlackLow}
            >
                <TimerHeader>
                    <PlayerInfo>
                        <Avatar 
                            isActive={!isWhiteTurn && isGameActive}
                        >
                            B
                        </Avatar>
                        <PlayerName 
                            isActive={!isWhiteTurn && isGameActive}
                        >
                            Black
                        </PlayerName>
                    </PlayerInfo>
                    <Time 
                        isLow={isBlackLow}
                    >
                        {formatTime(blackTime)}
                    </Time>
                </TimerHeader>
                <TimerProgressBar 
                    percentage={blackTimePercentage}
                    isLow={isBlackLow}
                />
            </PlayerTimer>
            
            <PlayerTimer 
                isActive={isWhiteTurn && isGameActive}
                isLow={isWhiteLow}
            >
                <TimerHeader>
                    <PlayerInfo>
                        <Avatar 
                            isActive={isWhiteTurn && isGameActive}
                        >
                            W
                        </Avatar>
                        <PlayerName 
                            isActive={isWhiteTurn && isGameActive}
                        >
                            White
                        </PlayerName>
                    </PlayerInfo>
                    <Time 
                        isLow={isWhiteLow}
                    >
                        {formatTime(whiteTime)}
                    </Time>
                </TimerHeader>
                <TimerProgressBar 
                    percentage={whiteTimePercentage}
                    isLow={isWhiteLow}
                />
            </PlayerTimer>
        </TimerContainer>
    );
};

export default Timer;
