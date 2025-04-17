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

const MoveTable = styled.div`
    display: table;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.9rem;
`;

const MoveRow = styled.div`
    display: table-row;
    
    &:nth-child(even) {
        background-color: ${({ theme }) => `${theme.colors.primary}33`};
    }
    
    &:hover {
        background-color: ${({ theme }) => `${theme.colors.primary}66`};
    }
`;

const MoveCell = styled.div`
    display: table-cell;
    padding: 8px 4px;
    vertical-align: middle;
    border-bottom: 1px solid ${({ theme }) => `${theme.colors.border}33`};
`;

const MoveNumber = styled(MoveCell)`
    color: ${({ theme }) => `${theme.colors.text}99`};
    font-weight: 500;
    width: 40px;
    text-align: center;
    transition: color 0.3s ease;
`;

const MoveWhite = styled(MoveCell)`
    width: calc(50% - 20px);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-weight: ${props => props.isLatest ? '600' : '400'};
    background: ${props => props.isLatest ? ({ theme }) => `${theme.colors.accent}33` : 'transparent'};
    
    &:hover {
        background: ${({ theme }) => `${theme.colors.accent}33`};
    }
`;

const MoveBlack = styled(MoveCell)`
    width: calc(50% - 20px);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.2s ease;
    font-weight: ${props => props.isLatest ? '600' : '400'};
    background: ${props => props.isLatest ? ({ theme }) => `${theme.colors.accent}33` : 'transparent'};
    
    &:hover {
        background: ${({ theme }) => `${theme.colors.accent}33`};
    }
`;

const EmptyMove = styled(MoveCell)`
    width: calc(50% - 20px);
`;

const MoveHistory = ({ moves = [] }) => {
    const theme = useTheme();
    
    // Group moves by pairs (White and Black)
    const groupedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
        const whiteMove = moves[i];
        const blackMove = i + 1 < moves.length ? moves[i + 1] : null;
        groupedMoves.push({
            moveNumber: Math.floor(i / 2) + 1,
            whiteMove,
            blackMove
        });
    }
    
    return (
        <Container theme={theme}>
            <Title theme={theme}>Move History</Title>
            <MoveTable>
                {groupedMoves.map((group, index) => (
                    <MoveRow key={index} theme={theme}>
                        <MoveNumber theme={theme}>
                            {group.moveNumber}.
                        </MoveNumber>
                        <MoveWhite 
                            theme={theme}
                            isLatest={moves.length - 1 === index * 2}
                        >
                            {group.whiteMove}
                        </MoveWhite>
                        {group.blackMove ? (
                            <MoveBlack 
                                theme={theme}
                                isLatest={moves.length - 1 === index * 2 + 1}
                            >
                                {group.blackMove}
                            </MoveBlack>
                        ) : (
                            <EmptyMove theme={theme} />
                        )}
                    </MoveRow>
                ))}
            </MoveTable>
        </Container>
    );
};

export default MoveHistory;
