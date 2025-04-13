import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../../context/ThemeContext';

const Container = styled.div`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    padding: 16px;
    height: 300px;
    overflow-y: auto;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: background-color 0.3s ease, color 0.3s ease;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: ${({ theme }) => theme.colors.primary};
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: ${({ theme }) => theme.colors.border};
        border-radius: 4px;
        
        &:hover {
            background: ${({ theme }) => theme.colors.accent};
        }
    }
`;

const Title = styled.h3`
    margin: 0 0 12px 0;
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    transition: color 0.3s ease;
`;

const MoveList = styled.div`
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: 8px;
    font-size: 0.9rem;
`;

const MoveNumber = styled.span`
    color: ${({ theme }) => `${theme.colors.text}99`};
    font-weight: 500;
    padding-right: 8px;
    transition: color 0.3s ease;
`;

const Move = styled.span`
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease, background-color 0.3s ease, color 0.3s ease;
    color: ${({ theme }) => theme.colors.text};
    font-weight: ${props => props.isLatest ? '600' : '400'};
    background: ${props => props.isLatest ? ({ theme }) => `${theme.colors.accent}33` : 'transparent'};

    &:hover {
        background: ${({ theme }) => `${theme.colors.accent}33`};
    }
`;

const MoveHistory = ({ moves = [] }) => {
    const theme = useTheme();
    return (
        <Container>
            <Title>Move History</Title>
            <MoveList>
                {moves.map((move, idx) => {
                    const moveNumber = Math.floor(idx / 2) + 1;
                    const isWhiteMove = idx % 2 === 0;
                    const isLatest = idx === moves.length - 1;

                    if (isWhiteMove) {
                        return (
                            <React.Fragment key={idx}>
                                <MoveNumber>{moveNumber}.</MoveNumber>
                                <Move isLatest={isLatest}>{move}</Move>
                                {idx + 1 < moves.length && (
                                    <Move isLatest={false}>{moves[idx + 1]}</Move>
                                )}
                            </React.Fragment>
                        );
                    }
                    return null;
                })}
            </MoveList>
        </Container>
    );
};

export default MoveHistory;
