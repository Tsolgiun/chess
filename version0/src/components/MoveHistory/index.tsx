import React from 'react';
import styled from 'styled-components';
import { useGame } from '../../context/GameContext';

const HistoryContainer = styled.div`
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 15px;
  height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
`;

const HistoryTitle = styled.h3`
  color: var(--text-primary);
  margin-bottom: 15px;
  font-size: 1.1em;
`;

const MoveList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const MoveRow = styled.div`
  display: grid;
  grid-template-columns: 30px 1fr 1fr;
  gap: 10px;
  padding: 4px 0;
`;

const MoveNumber = styled.span`
  color: var(--text-secondary);
`;

const Move = styled.span`
  color: var(--text-primary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const MoveHistory: React.FC = () => {
  const { state } = useGame();

  // Group moves into pairs (white and black moves)
  const moveGroups = state.moveHistory.reduce<Array<[string, string?]>>((groups, move, index) => {
    if (index % 2 === 0) {
      groups.push([move]);
    } else {
      groups[Math.floor(index / 2)][1] = move;
    }
    return groups;
  }, []);

  return (
    <HistoryContainer>
      <HistoryTitle>Move History</HistoryTitle>
      <MoveList>
        {moveGroups.map((moves, index) => (
          <MoveRow key={index}>
            <MoveNumber>{index + 1}.</MoveNumber>
            <Move>{moves[0]}</Move>
            {moves[1] && <Move>{moves[1]}</Move>}
          </MoveRow>
        ))}
      </MoveList>
    </HistoryContainer>
  );
};

export default MoveHistory;
