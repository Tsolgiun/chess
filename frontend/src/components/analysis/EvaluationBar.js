import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
`;

const Container = styled.div`
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -40px;
    height: 30px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    animation: ${slideIn} 0.5s ease-out;
    
    &:hover {
        height: ${props => props.expanded ? '30px' : '60px'};
        
        .evaluation-details {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const Bar = styled.div`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.primary};
    
    &:before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: ${props => props.percentage}%;
        background: ${props => {
            if (props.advantage === 'white') {
                return props.decisive ? '#2ecc71' : ({ theme }) => theme.colors.accent;
            } else {
                return props.decisive ? '#e74c3c' : '#34495e';
            }
        }};
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
    }
`;

const Text = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    z-index: 1;
    transition: all 0.3s ease;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${({ theme }) => `${theme.colors.primary}80`};
    
    ${props => props.decisive && `
        animation: ${pulse} 2s infinite;
    `}
`;

const DetailContainer = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 30px;
    display: flex;
    justify-content: space-between;
    padding: 0 15px;
    align-items: center;
    background: ${({ theme }) => `${theme.colors.primary}90`};
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.3s ease;
    z-index: 2;
    class-name: evaluation-details;
`;

const DetailItem = styled.div`
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text};
    display: flex;
    align-items: center;
    gap: 5px;
    
    span {
        font-weight: 600;
        color: ${({ theme }) => theme.colors.accent};
    }
`;

const getEvaluationPercentage = (evaluation) => {
    if (evaluation >= 10) return 100;
    if (evaluation <= -10) return 0;
    
    // Convert evaluation to percentage (centered at 50%)
    const sigmoid = x => 1 / (1 + Math.exp(-x/1.5));
    return 50 + (sigmoid(evaluation) - 0.5) * 100;
};

const formatEvaluation = (evaluation) => {
    if (evaluation === 0) return '0.0';
    if (evaluation > 0) return `+${evaluation.toFixed(1)}`;
    return evaluation.toFixed(1);
};

const getAdvantageText = (evaluation) => {
    const absEval = Math.abs(evaluation);
    const side = evaluation > 0 ? 'White' : 'Black';
    
    if (absEval < 0.5) return 'Equal';
    if (absEval < 1.5) return `Slight ${side} advantage`;
    if (absEval < 3) return `${side} advantage`;
    if (absEval < 5) return `Strong ${side} advantage`;
    if (absEval < 10) return `Winning for ${side}`;
    return `Decisive ${side} advantage`;
};

const isDecisiveAdvantage = (evaluation) => {
    return Math.abs(evaluation) >= 5;
};

const EvaluationBar = ({ evaluation = 0, depth = 0, nodes = 0 }) => {
    const theme = useTheme();
    const [expanded, setExpanded] = useState(false);
    const percentage = getEvaluationPercentage(evaluation);
    const advantage = evaluation >= 0 ? 'white' : 'black';
    const decisive = isDecisiveAdvantage(evaluation);
    const advantageText = getAdvantageText(evaluation);
    
    return (
        <Container 
            theme={theme} 
            expanded={expanded}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}
        >
            <Bar 
                theme={theme} 
                percentage={percentage} 
                advantage={advantage}
                decisive={decisive}
            />
            <Text 
                theme={theme} 
                evaluation={evaluation}
                decisive={decisive}
            >
                {formatEvaluation(evaluation)}
            </Text>
            <DetailContainer theme={theme} className="evaluation-details">
                <DetailItem theme={theme}>
                    {advantageText}
                </DetailItem>
                {depth > 0 && (
                    <DetailItem theme={theme}>
                        Depth: <span>{depth}</span>
                    </DetailItem>
                )}
                {nodes > 0 && (
                    <DetailItem theme={theme}>
                        Nodes: <span>{(nodes / 1000).toFixed(1)}K</span>
                    </DetailItem>
                )}
            </DetailContainer>
        </Container>
    );
};

export default EvaluationBar;
