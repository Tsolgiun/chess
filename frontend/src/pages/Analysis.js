import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chess } from 'chess.js';
import NavBar from '../components/NavBar/NavBar';
import Board from '../components/Board/Board';
import { motion } from 'framer-motion';
import StockfishService from '../services/StockfishService';
import EvaluationBar from '../components/analysis/EvaluationBar';
import AnalysisLines from '../components/analysis/AnalysisLines';

const PageContainer = styled.div`
    padding-top: 80px;
`;

const Container = styled(motion.div)`
    max-width: 1400px;
    margin: 20px auto;
    padding: 20px;
    display: grid;
    grid-template-columns: minmax(auto, 700px) minmax(300px, 1fr);
    gap: 40px;
    align-items: start;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
        max-width: 800px;
    }
`;

const BoardWrapper = styled(motion.div)`
    position: relative;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
`;

const ControlsWrapper = styled(motion.div)`
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
`;

const Button = styled.button`
    padding: 10px 20px;
    margin: 5px;
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    &:active {
        transform: translateY(0);
    }
`;

const Input = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.9rem;

    &:focus {
        outline: none;
        border-color: #3498db;
        box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
    }
`;

const Text = styled.p`
    margin: 10px 0;
    color: #666;
    font-size: 0.9rem;
`;

const Analysis = () => {
    const [position, setPosition] = useState(new Chess());
    const [fenInput, setFenInput] = useState('');
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [analysisLines, setAnalysisLines] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [currentEvaluation, setCurrentEvaluation] = useState(0);
    const [engineDepth, setEngineDepth] = useState(20);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initEngine = async () => {
            try {
                await StockfishService.init();
                StockfishService.setAnalysisCallback(handleAnalysisLine);
                setIsEngineReady(true);
                startAnalysis();
            } catch (error) {
                console.error('Failed to initialize engine:', error);
                setError('Failed to initialize chess engine. Please refresh the page to try again.');
            }
        };

        initEngine();

        return () => {
            StockfishService.terminate();
        };
    }, []);

    useEffect(() => {
        startAnalysis();
    }, [position]);

    const handleAnalysisLine = (line) => {
        setAnalysisLines(prev => {
            const newLines = [...prev];
            const index = line.multipv - 1;
            newLines[index] = line;
            
            if (index === 0) {
                setCurrentEvaluation(line.evaluation);
            }
            
            return newLines;
        });
    };

    const startAnalysis = () => {
        setIsAnalyzing(true);
        setAnalysisLines([]);
        StockfishService.setDepth(engineDepth);
        StockfishService.startAnalysis(position.fen());
    };

    const handleDepthChange = (depth) => {
        setEngineDepth(depth);
        StockfishService.setDepth(depth);
        startAnalysis();
    };

    const handleFenSubmit = () => {
        try {
            const newPosition = new Chess();
            newPosition.load(fenInput);
            setPosition(newPosition);
        } catch (error) {
            console.error('Invalid FEN:', error);
            // You could add a toast notification here
        }
    };

    const handleReset = () => {
        setPosition(new Chess());
        setFenInput('');
    };

    const containerVariants = {
        initial: { opacity: 0 },
        animate: { 
            opacity: 1,
            transition: { duration: 0.8 }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.5 }
        }
    };

    return (
        <PageContainer>
            <NavBar />
            {error ? (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#e74c3c',
                    background: 'white',
                    borderRadius: '8px',
                    margin: '20px auto',
                    maxWidth: '600px'
                }}>
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            ) : !isEngineReady ? (
                <div style={{ 
                    padding: '20px', 
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '8px',
                    margin: '20px auto',
                    maxWidth: '600px'
                }}>
                    <h3>Initializing Chess Engine</h3>
                    <p>Please wait while we set up the analysis tools...</p>
                </div>
            ) : (
                <Container
                    variants={containerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
            <BoardWrapper>
                <EvaluationBar evaluation={currentEvaluation} />
                <Board 
                    boardFlipped={boardFlipped}
                    analysisMode={true}
                    position={position}
                />
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Button onClick={() => setBoardFlipped(!boardFlipped)}>
                        Flip Board
                    </Button>
                </div>
            </BoardWrapper>
            <ControlsWrapper>
                <h2>Position Setup</h2>
                <Text>Enter FEN notation:</Text>
                <Input
                    type="text"
                    value={fenInput}
                    onChange={(e) => setFenInput(e.target.value)}
                    placeholder="Enter FEN string..."
                />
                <Button onClick={handleFenSubmit}>Load Position</Button>
                <Button onClick={handleReset}>Reset to Start</Button>
                
                <div style={{ marginTop: '20px' }}>
                    <h3>Current FEN:</h3>
                    <Text>{position.fen()}</Text>
                </div>

                <div style={{ marginTop: '20px' }}>
                    <h3>Engine Analysis</h3>
                    <Text>Analysis Depth:</Text>
                    <select 
                        value={engineDepth}
                        onChange={(e) => handleDepthChange(Number(e.target.value))}
                        style={{ marginBottom: '10px', padding: '5px' }}
                    >
                        {[10, 15, 20, 25, 30].map(depth => (
                            <option key={depth} value={depth}>
                                Depth {depth}
                            </option>
                        ))}
                    </select>
                    <AnalysisLines 
                        lines={analysisLines} 
                        isAnalyzing={isAnalyzing} 
                    />
                </div>
            </ControlsWrapper>
                </Container>
            )}
        </PageContainer>
    );
};

export default Analysis;
