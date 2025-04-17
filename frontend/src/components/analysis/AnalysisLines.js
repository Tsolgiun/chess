import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const Container = styled.div`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h3`
    margin: 0 0 15px 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    transition: color 0.3s ease;
    border-bottom: 1px solid ${({ theme }) => `${theme.colors.border}40`};
    padding-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const EngineInfo = styled.span`
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text}99;
    font-weight: normal;
`;

const Line = styled.div`
    padding: 15px;
    border-radius: 8px;
    background: ${props => props.isMain ? ({ theme }) => `${theme.colors.primary}` : ({ theme }) => `${theme.colors.primary}40`};
    margin-bottom: 12px;
    transition: all 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &:hover {
        background: ${({ theme }) => `${theme.colors.primary}`};
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        background: ${props => props.isMain ? ({ theme }) => theme.colors.accent : 'transparent'};
    }
    
    ${props => props.isMain && `
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    `}
`;

const LineHeader = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 8px;
`;

const EvalText = styled.span`
    font-weight: 600;
    color: ${props => props.value > 0 ? ({ theme }) => theme.colors.accent : props.value < 0 ? '#e74c3c' : ({ theme }) => theme.colors.text};
    margin-right: 12px;
    padding: 2px 8px;
    border-radius: 4px;
    background: ${({ theme }) => `${theme.colors.secondary}80`};
    transition: all 0.3s ease;
`;

const DepthText = styled.span`
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    font-size: 0.85rem;
    margin-right: 12px;
    padding: 2px 6px;
    border-radius: 4px;
    background: ${({ theme }) => `${theme.colors.secondary}60`};
`;

const MoveSequence = styled.div`
    font-family: 'Roboto Mono', monospace;
    color: ${({ theme }) => theme.colors.text};
    transition: color 0.3s ease;
    line-height: 1.5;
    font-size: 0.95rem;
`;

const Move = styled.span`
    display: inline-block;
    margin: 0 2px;
    padding: 2px 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${({ theme }) => `${theme.colors.accent}40`};
    }
    
    ${props => props.isHighlighted && `
        background: ${({ theme }) => `${theme.colors.accent}40`};
        font-weight: 600;
    `}
`;

const MoveNumber = styled.span`
    color: ${({ theme }) => theme.colors.text}99;
    margin-right: 4px;
    font-size: 0.85rem;
`;

const Info = styled.div`
    margin-top: 10px;
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.8;
    padding: 8px;
    border-radius: 6px;
    background: ${({ theme }) => `${theme.colors.secondary}40`};
`;

const NoAnalysis = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: ${({ theme }) => theme.colors.text};
    opacity: 0.7;
    font-style: italic;
`;

const LoadingContainer = styled.div`
    text-align: center;
    padding: 40px 20px;
    color: ${({ theme }) => theme.colors.text};
`;

const LoadingBar = styled.div`
    height: 4px;
    width: 200px;
    margin: 20px auto;
    background: linear-gradient(90deg, 
        ${({ theme }) => theme.colors.accent}, 
        ${({ theme }) => theme.colors.primary}, 
        ${({ theme }) => theme.colors.accent}
    );
    background-size: 200% 200%;
    border-radius: 2px;
    animation: ${pulse} 2s infinite;
`;

const formatMoves = (moves) => {
    if (!moves || !Array.isArray(moves)) return [];
    
    const formattedMoves = [];
    let moveNumber = 1;
    let isWhiteMove = true;
    
    moves.forEach((move, index) => {
        if (isWhiteMove) {
            formattedMoves.push({
                number: moveNumber,
                move,
                isWhite: true,
                index
            });
            isWhiteMove = false;
        } else {
            formattedMoves.push({
                number: moveNumber,
                move,
                isWhite: false,
                index
            });
            isWhiteMove = true;
            moveNumber++;
        }
    });
    
    return formattedMoves;
};

const AnalysisLines = ({ 
    lines = [], 
    isAnalyzing = false,
    engineName = 'Stockfish'
}) => {
    const theme = useTheme();
    const [highlightedMove, setHighlightedMove] = useState(null);
    
    if (isAnalyzing) {
        return (
            <Container theme={theme}>
                <Title theme={theme}>
                    Engine Analysis
                    <EngineInfo theme={theme}>{engineName}</EngineInfo>
                </Title>
                <LoadingContainer theme={theme}>
                    <div>Analyzing position...</div>
                    <LoadingBar theme={theme} />
                </LoadingContainer>
            </Container>
        );
    }

    if (!lines || lines.length === 0) {
        return (
            <Container theme={theme}>
                <Title theme={theme}>
                    Engine Analysis
                    <EngineInfo theme={theme}>{engineName}</EngineInfo>
                </Title>
                <NoAnalysis theme={theme}>
                    No analysis available. Click "Show Analysis" to analyze the current position.
                </NoAnalysis>
            </Container>
        );
    }

    return (
        <Container theme={theme}>
            <Title theme={theme}>
                Engine Analysis
                <EngineInfo theme={theme}>{engineName}</EngineInfo>
            </Title>
            {lines.map((line, index) => {
                const formattedMoves = formatMoves(line.moves);
                
                return (
                    <Line 
                        key={index} 
                        isMain={index === 0}
                        theme={theme}
                        onClick={() => console.log(`Play line: ${line.moves.join(' ')}`)}
                    >
                        <LineHeader>
                            <EvalText value={line.evaluation} theme={theme}>
                                {line.evaluation > 0 ? '+' : ''}{line.evaluation.toFixed(2)}
                            </EvalText>
                            <DepthText theme={theme}>
                                Depth {line.depth}
                            </DepthText>
                        </LineHeader>
                        
                        <MoveSequence theme={theme}>
                            {formattedMoves.map((moveObj, moveIndex) => (
                                <React.Fragment key={moveIndex}>
                                    {moveObj.isWhite && (
                                        <MoveNumber theme={theme}>
                                            {moveObj.number}.
                                        </MoveNumber>
                                    )}
                                    <Move 
                                        theme={theme}
                                        isHighlighted={highlightedMove === moveObj.index}
                                        onMouseEnter={() => setHighlightedMove(moveObj.index)}
                                        onMouseLeave={() => setHighlightedMove(null)}
                                    >
                                        {moveObj.move}
                                    </Move>
                                    {' '}
                                </React.Fragment>
                            ))}
                        </MoveSequence>
                        
                        {index === 0 && line.info && (
                            <Info theme={theme}>{line.info}</Info>
                        )}
                    </Line>
                );
            })}
        </Container>
    );
};

export default AnalysisLines;
