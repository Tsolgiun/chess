import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
`;

const Line = styled.div`
    padding: 12px;
    border-radius: 6px;
    background: ${props => props.isMain ? '#f8f9fa' : 'transparent'};
    margin-bottom: 8px;
    transition: all 0.2s ease;

    &:hover {
        background: #f1f3f5;
    }
`;

const EvalText = styled.span`
    font-weight: 600;
    color: ${props => props.value > 0 ? '#2ecc71' : props.value < 0 ? '#e74c3c' : '#666'};
    margin-right: 12px;
`;

const DepthText = styled.span`
    color: #95a5a6;
    font-size: 0.8em;
    margin-right: 12px;
`;

const MoveText = styled.span`
    font-family: 'Roboto Mono', monospace;
`;

const Info = styled.div`
    margin-top: 4px;
    font-size: 0.9em;
    color: #7f8c8d;
`;

const NoAnalysis = styled.div`
    text-align: center;
    padding: 20px;
    color: #95a5a6;
    font-style: italic;
`;

const AnalysisLines = ({ lines = [], isAnalyzing = false }) => {
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
