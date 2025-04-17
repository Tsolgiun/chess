import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../../context/ThemeContext';
import { useGame } from '../../context/GameContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
    background: ${({ theme }) => theme.colors.secondary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 12px;
    padding: 16px;
    height: 350px;
    overflow-y: auto;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    transition: background-color 0.3s ease, color 0.3s ease;
    position: relative;

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

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    position: sticky;
    top: 0;
    background: ${({ theme }) => theme.colors.secondary};
    padding: 4px 0;
    z-index: 10;
`;

const Title = styled.h3`
    margin: 0;
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    transition: color 0.3s ease;
`;

const Controls = styled.div`
    display: flex;
    gap: 8px;
`;

const ControlButton = styled.button`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border: none;
    border-radius: 4px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
        background: ${({ theme }) => theme.colors.accent};
        color: #fff;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        
        &:hover {
            background: ${({ theme }) => theme.colors.primary};
            color: ${({ theme }) => theme.colors.text};
        }
    }
`;

const MoveTable = styled.div`
    display: table;
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 0.95rem;
`;

const MoveRow = styled.div`
    display: table-row;
    animation: ${fadeIn} 0.3s ease-out;
    
    &:nth-child(even) {
        background-color: ${({ theme }) => `${theme.colors.primary}33`};
    }
    
    &:hover {
        background-color: ${({ theme }) => `${theme.colors.primary}66`};
    }
`;

const MoveCell = styled.div`
    display: table-cell;
    padding: 10px 6px;
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

const Move = styled(MoveCell)`
    width: calc(50% - 20px);
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: ${props => (props.isLatest || props.isSelected) ? '600' : '400'};
    background: ${props => {
        if (props.isSelected) return ({ theme }) => `${theme.colors.accent}66`;
        if (props.isLatest) return ({ theme }) => `${theme.colors.accent}33`;
        return 'transparent';
    }};
    
    &:hover {
        background: ${({ theme }) => `${theme.colors.accent}33`};
    }
`;

const EmptyMove = styled(MoveCell)`
    width: calc(50% - 20px);
`;

const MoveAnnotation = styled.span`
    font-size: 0.85rem;
    color: ${props => {
        if (props.type === 'brilliant') return '#1abc9c';
        if (props.type === 'good') return '#2ecc71';
        if (props.type === 'inaccuracy') return '#f39c12';
        if (props.type === 'mistake') return '#e67e22';
        if (props.type === 'blunder') return '#e74c3c';
        return ({ theme }) => theme.colors.accent;
    }};
    margin-left: 4px;
    font-weight: 600;
`;

const NoMovesMessage = styled.div`
    text-align: center;
    padding: 30px 0;
    color: ${({ theme }) => theme.colors.text}99;
    font-style: italic;
`;

// Helper function to parse move annotations
const parseMoveWithAnnotation = (move) => {
    if (!move) return { move: '', annotation: null };
    
    // Check for annotation symbols
    const annotations = {
        '!!': 'brilliant',
        '!': 'good',
        '?!': 'inaccuracy',
        '?': 'mistake',
        '??': 'blunder',
        '#': 'checkmate',
        '+': 'check'
    };
    
    let annotation = null;
    let cleanMove = move;
    
    Object.entries(annotations).forEach(([symbol, type]) => {
        if (move.includes(symbol)) {
            annotation = { symbol, type };
            cleanMove = move.replace(symbol, '');
        }
    });
    
    return { move: cleanMove, annotation };
};

const MoveHistory = ({ moves = [] }) => {
    const theme = useTheme();
    const { game } = useGame();
    const [selectedMoveIndex, setSelectedMoveIndex] = useState(-1);
    const containerRef = useRef(null);
    const latestMoveRef = useRef(null);
    
    // Group moves by pairs (White and Black)
    const groupedMoves = [];
    for (let i = 0; i < moves.length; i += 2) {
        const whiteMove = moves[i];
        const blackMove = i + 1 < moves.length ? moves[i + 1] : null;
        groupedMoves.push({
            moveNumber: Math.floor(i / 2) + 1,
            whiteMove,
            blackMove,
            whiteIndex: i,
            blackIndex: i + 1
        });
    }
    
    // Scroll to the latest move when moves are updated
    useEffect(() => {
        if (latestMoveRef.current && containerRef.current) {
            latestMoveRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [moves.length]);
    
    const handleMoveClick = (index) => {
        setSelectedMoveIndex(index);
        // Here you would typically navigate to this position in the game
        // This would require integration with your game state management
        console.log(`Navigate to move ${index + 1}`);
    };
    
    const handleFirstMove = () => {
        setSelectedMoveIndex(-1);
        // Navigate to starting position
    };
    
    const handlePreviousMove = () => {
        if (selectedMoveIndex > -1) {
            setSelectedMoveIndex(selectedMoveIndex - 1);
            // Navigate to previous move
        } else {
            setSelectedMoveIndex(-1);
        }
    };
    
    const handleNextMove = () => {
        if (selectedMoveIndex < moves.length - 1) {
            setSelectedMoveIndex(selectedMoveIndex + 1);
            // Navigate to next move
        }
    };
    
    const handleLastMove = () => {
        setSelectedMoveIndex(moves.length - 1);
        // Navigate to last move
    };
    
    return (
        <Container ref={containerRef} theme={theme}>
            <Header>
                <Title theme={theme}>Move History</Title>
                <Controls>
                    <ControlButton 
                        onClick={handleFirstMove}
                        disabled={moves.length === 0}
                        title="First move"
                    >
                        ⏮
                    </ControlButton>
                    <ControlButton 
                        onClick={handlePreviousMove}
                        disabled={selectedMoveIndex === -1}
                        title="Previous move"
                    >
                        ◀
                    </ControlButton>
                    <ControlButton 
                        onClick={handleNextMove}
                        disabled={selectedMoveIndex === moves.length - 1 || moves.length === 0}
                        title="Next move"
                    >
                        ▶
                    </ControlButton>
                    <ControlButton 
                        onClick={handleLastMove}
                        disabled={selectedMoveIndex === moves.length - 1 || moves.length === 0}
                        title="Last move"
                    >
                        ⏭
                    </ControlButton>
                </Controls>
            </Header>
            
            {moves.length === 0 ? (
                <NoMovesMessage theme={theme}>No moves yet</NoMovesMessage>
            ) : (
                <MoveTable>
                    {groupedMoves.map((group, index) => {
                        const { move: whiteMove, annotation: whiteAnnotation } = parseMoveWithAnnotation(group.whiteMove);
                        const { move: blackMove, annotation: blackAnnotation } = parseMoveWithAnnotation(group.blackMove);
                        
                        const isLatestWhite = moves.length - 1 === group.whiteIndex;
                        const isLatestBlack = moves.length - 1 === group.blackIndex;
                        
                        return (
                            <MoveRow key={index} theme={theme}>
                                <MoveNumber theme={theme}>
                                    {group.moveNumber}.
                                </MoveNumber>
                                <Move 
                                    theme={theme}
                                    isLatest={isLatestWhite}
                                    isSelected={selectedMoveIndex === group.whiteIndex}
                                    onClick={() => handleMoveClick(group.whiteIndex)}
                                    ref={isLatestWhite ? latestMoveRef : null}
                                >
                                    {whiteMove}
                                    {whiteAnnotation && (
                                        <MoveAnnotation type={whiteAnnotation.type}>
                                            {whiteAnnotation.symbol}
                                        </MoveAnnotation>
                                    )}
                                </Move>
                                {group.blackMove ? (
                                    <Move 
                                        theme={theme}
                                        isLatest={isLatestBlack}
                                        isSelected={selectedMoveIndex === group.blackIndex}
                                        onClick={() => handleMoveClick(group.blackIndex)}
                                        ref={isLatestBlack ? latestMoveRef : null}
                                    >
                                        {blackMove}
                                        {blackAnnotation && (
                                            <MoveAnnotation type={blackAnnotation.type}>
                                                {blackAnnotation.symbol}
                                            </MoveAnnotation>
                                        )}
                                    </Move>
                                ) : (
                                    <EmptyMove theme={theme} />
                                )}
                            </MoveRow>
                        );
                    })}
                </MoveTable>
            )}
        </Container>
    );
};

export default MoveHistory;
