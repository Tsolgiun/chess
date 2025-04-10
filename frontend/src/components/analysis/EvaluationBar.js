import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    left: -30px;
    top: 0;
    bottom: 0;
    width: 20px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
`;

const Bar = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: ${props => props.percentage}%;
    height: ${props => 100 - props.percentage}%;
    background: ${props => props.advantage === 'white' ? '#fff' : '#000'};
    transition: all 0.3s ease;
`;

const Text = styled.div`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) rotate(-90deg);
    white-space: nowrap;
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.color};
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    z-index: 1;
`;

const getEvaluationPercentage = (evaluation) => {
    if (evaluation >= 10) return 100;
    if (evaluation <= -10) return 0;
    
    // Sigmoid function to convert evaluation to percentage
    const sigmoid = x => 1 / (1 + Math.exp(-x/1.5));
    return sigmoid(evaluation) * 100;
};

const formatEvaluation = (evaluation) => {
    if (evaluation === 0) return '0.0';
    if (evaluation > 0) return `+${evaluation.toFixed(1)}`;
    return evaluation.toFixed(1);
};

const EvaluationBar = ({ evaluation = 0 }) => {
    const percentage = getEvaluationPercentage(evaluation);
    const advantage = evaluation >= 0 ? 'white' : 'black';
    
    return (
        <Container>
            <Bar percentage={percentage} advantage={advantage} />
            <Text color={Math.abs(evaluation) > 3 ? '#fff' : '#666'}>
                {formatEvaluation(evaluation)}
            </Text>
        </Container>
    );
};

export default EvaluationBar;
