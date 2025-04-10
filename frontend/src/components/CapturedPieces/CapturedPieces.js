import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
`;

const Row = styled.div`
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: ${props => props.isLight ? '#f8f9fa' : '#edf2f7'};
    border-radius: 8px;
    min-height: 40px;
`;

const PiecesContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
`;

const Piece = styled.div`
    width: 24px;
    height: 24px;
    background-image: url(${props => props.image});
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: ${props => props.isDimmed ? 'brightness(0.8)' : 'none'};
    transition: transform 0.2s ease;

    &:hover {
        transform: scale(1.1);
    }
`;

const AdvantageText = styled.span`
    margin-left: auto;
    font-weight: 600;
    font-size: 0.9rem;
    color: ${props => props.advantage > 0 ? '#27ae60' : props.advantage < 0 ? '#e74c3c' : '#666'};
`;

const CapturedPieces = ({ position }) => {
    // Calculate captured pieces from position
    const calculateCapturedPieces = () => {
        const initialPieces = {
            'p': 8, 'n': 2, 'b': 2, 'r': 2, 'q': 1
        };
        
        const currentPieces = {
            'w': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 },
            'b': { 'p': 0, 'n': 0, 'b': 0, 'r': 0, 'q': 0 }
        };

        // Count current pieces on board
        for (let piece of position.split(' ')[0].split('')) {
            if (piece === '/') continue;
            if (!isNaN(piece)) continue;

            const color = piece === piece.toUpperCase() ? 'w' : 'b';
            const pieceType = piece.toLowerCase();
            
            if (currentPieces[color][pieceType] !== undefined) {
                currentPieces[color][pieceType]++;
            }
        }

        // Calculate captured pieces
        const captured = {
            'w': {},
            'b': {}
        };

        for (let pieceType in initialPieces) {
            captured['w'][pieceType] = initialPieces[pieceType] - currentPieces['w'][pieceType];
            captured['b'][pieceType] = initialPieces[pieceType] - currentPieces['b'][pieceType];
        }

        return captured;
    };

    const pieceValues = {
        'p': 1,
        'n': 3,
        'b': 3,
        'r': 5,
        'q': 9
    };

    const calculateAdvantage = (captured) => {
        let whiteAdvantage = 0;
        
        for (let pieceType in captured['b']) {
            whiteAdvantage += captured['b'][pieceType] * pieceValues[pieceType];
        }
        
        for (let pieceType in captured['w']) {
            whiteAdvantage -= captured['w'][pieceType] * pieceValues[pieceType];
        }
        
        return whiteAdvantage;
    };

    const captured = calculateCapturedPieces();
    const advantage = calculateAdvantage(captured);

    const renderPieces = (color) => {
        const pieces = [];
        const pieceTypes = ['q', 'r', 'b', 'n', 'p'];
        
        pieceTypes.forEach(type => {
            for (let i = 0; i < captured[color][type]; i++) {
                pieces.push(
                    <Piece 
                        key={`${color}-${type}-${i}`}
                        image={`/pieces/${color === 'w' ? 'black' : 'white'}-${
                            type === 'p' ? 'pawn' :
                            type === 'n' ? 'knight' :
                            type === 'b' ? 'bishop' :
                            type === 'r' ? 'rook' :
                            'queen'
                        }.png`}
                        isDimmed={advantage === 0}
                    />
                );
            }
        });
        
        return pieces;
    };

    return (
        <Container>
            <Row isLight>
                <PiecesContainer>
                    {renderPieces('b')}
                </PiecesContainer>
                {advantage !== 0 && <AdvantageText advantage={advantage}>
                    {Math.abs(advantage)}
                </AdvantageText>}
            </Row>
            <Row>
                <PiecesContainer>
                    {renderPieces('w')}
                </PiecesContainer>
                {advantage !== 0 && <AdvantageText advantage={-advantage}>
                    {Math.abs(advantage)}
                </AdvantageText>}
            </Row>
        </Container>
    );
};

export default CapturedPieces;
