import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
    transition: background-color 0.3s ease, color 0.3s ease;
`;

const Line = styled.div`
    padding: 12px;
    border-radius: 6px;
    background: ${props => props.isMain ? ({ theme }) => `${theme.colors.primary}` : 'transparent'};
    margin-bottom: 8px;
    transition: all 0.3s ease;

    &:hover {
        background: ${({ theme }) => `${theme.colors.primary}`};
    }
`;

const EvalText = styled.span`
    font-weight: 600;
    color: ${props => props.value > 0 ? ({ theme }) => theme.colors.accent : props.value < 0 ? '#e74c3c' : ({ theme }) => theme.colors.text};
    margin-right: 12px;
    transition: color 0.3s ease;
`;

const DepthText = styled.span`
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.6;
    font-size: 0.8em;
    margin-right: 12px;
    transition: color 0.3s ease;
`;

const MoveText = styled.span`
    font-family: 'Roboto Mono', monospace;
    color: ${({ theme }) => theme.colors.text};
    transition: color 0.3s ease;
`;

const Info = styled.div`
    margin-top: 4px;
    font-size: 0.9em;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    transition: color 0.3s ease;
`;

const NoAnalysis = styled.div`
    text-align: center;
    padding: 20px;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.6;
    font-style: italic;
    transition: color 0.3s ease;
`;

const AnalysisLines = ({ lines = [], isAnalyzing = false }) => {
    const theme = useTheme();
    if (isAnalyzing) {
        return (
            <Container>
                <NoAnalysis>Analyzing position...</NoAnalysis>
            </Container>
        );
    }

    if (!lines || lines.length === 0) {
        return (
            <Container>
                <NoAnalysis>No analysis available</NoAnalysis>
            </Container>
        );
    }

    return (
        <Container>
            {lines.map((line, index) => (
                <Line key={index} isMain={index === 0}>
                    <div>
                        <EvalText value={line.evaluation}>
                            {line.evaluation > 0 ? '+' : ''}{line.evaluation.toFixed(1)}
                        </EvalText>
                        <DepthText>d{line.depth}</DepthText>
                        <MoveText>{line.moves.join(' ')}</MoveText>
                    </div>
                    {index === 0 && line.info && (
                        <Info>{line.info}</Info>
                    )}
                </Line>
            ))}
        </Container>
    );
};

export default AnalysisLines;
