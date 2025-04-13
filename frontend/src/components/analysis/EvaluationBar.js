import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: -30px;
    height: 20px;
    background: ${({ theme }) => theme.colors.secondary};
    border-radius: 4px;
    overflow: hidden;
    transition: background-color 0.3s ease;
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
        background: ${({ theme }) => theme.colors.accent};
        transition: all 0.3s ease, background-color 0.3s ease;
    }
`;

const Text = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 1;
    transition: color 0.3s ease;
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

const EvaluationBar = ({ evaluation = 0 }) => {
    const theme = useTheme();
    const percentage = getEvaluationPercentage(evaluation);
    const advantage = evaluation >= 0 ? 'white' : 'black';
    
    return (
        <Container>
            <Bar percentage={percentage} advantage={advantage} />
            <Text evaluation={evaluation}>
                {formatEvaluation(evaluation)}
            </Text>
        </Container>
    );
};

export default EvaluationBar;
