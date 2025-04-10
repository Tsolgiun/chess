import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    background: #fafafa;
    border-radius: 8px;
    padding: 16px;
    height: 300px;
    overflow-y: auto;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;

    /* Scrollbar styling */
    &::-webkit-scrollbar {
        width: 8px;
    }
    
    &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }
    
    &::-webkit-scrollbar-thumb {
        background: #bbb;
        border-radius: 4px;
        
        &:hover {
            background: #999;
        }
    }
`;

const Title = styled.h3`
    margin: 0 0 12px 0;
    font-size: 1rem;
    color: #333;
    font-weight: 600;
`;

const MoveList = styled.div`
    display: grid;
    grid-template-columns: auto 1fr 1fr;
    gap: 8px;
    font-size: 0.9rem;
`;

const MoveNumber = styled.span`
    color: #888;
    font-weight: 500;
    padding-right: 8px;
`;

const Move = styled.span`
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #2c3e50;
    font-weight: ${props => props.isLatest ? '600' : '400'};
    background: ${props => props.isLatest ? 'rgba(52, 152, 219, 0.1)' : 'transparent'};

    &:hover {
        background: rgba(52, 152, 219, 0.1);
    }
`;

const MoveHistory = ({ moves = [] }) => {
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
