import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Chess } from 'chess.js';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import NavBar from '../components/NavBar/NavBar';
import Board from '../components/Board/Board';
import MoveHistory from '../components/MoveHistory/MoveHistory';
import CapturedPieces from '../components/CapturedPieces/CapturedPieces';
import EvaluationBar from '../components/analysis/EvaluationBar';
import AnalysisLines from '../components/analysis/AnalysisLines';
import StockfishService from '../services/StockfishService';
import { useTheme } from '../context/ThemeContext';
import { useGame } from '../context/GameContext';

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
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
    transition: background-color 0.3s ease, color 0.3s ease;
`;

const ControlsWrapper = styled(motion.div)`
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 16px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    padding: 30px;
    transition: background-color 0.3s ease, color 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
`;

const Button = styled.button`
    padding: 10px 20px;
    margin: 5px;
    background: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.isDarkMode ? '#000000' : '#ffffff'};
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.9rem;
    transition: all 0.3s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        opacity: 0.9;
    }

    &:active {
        transform: translateY(0);
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    margin-top: 0;
    margin-bottom: 20px;
    color: ${({ theme }) => theme.colors.text};
    font-size: 1.5rem;
    font-weight: 600;
`;

const TabContainer = styled.div`
    display: flex;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 20px;
`;

const Tab = styled.div`
    padding: 12px 20px;
    cursor: pointer;
    font-weight: ${props => props.active ? '600' : '400'};
    color: ${props => props.active ? ({ theme }) => theme.colors.accent : ({ theme }) => theme.colors.text};
    border-bottom: 2px solid ${props => props.active ? ({ theme }) => theme.colors.accent : 'transparent'};
    transition: all 0.2s ease;
    
    &:hover {
        color: ${({ theme }) => theme.colors.accent};
    }
`;

const TabContent = styled.div`
    display: ${props => props.active ? 'block' : 'none'};
    flex: 1;
    overflow-y: auto;
`;

const ErrorDiv = styled.div`
    padding: 20px;
    text-align: center;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    margin: 20px auto;
    max-width: 600px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease, color 0.3s ease;
`;

const LoadingDiv = styled.div`
    padding: 20px;
    text-align: center;
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    border-radius: 8px;
    margin: 20px auto;
    max-width: 600px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transition: background-color 0.3s ease, color 0.3s ease;
`;

const Review = () => {
    const { reviewGameId: urlGameId } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const { reviewFen, reviewMoves, reviewGameId: contextGameId } = useGame();
    
    const [chess, setChess] = useState(() => new Chess());
    const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
    const [boardFlipped, setBoardFlipped] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [activeTab, setActiveTab] = useState('moves');
    const [analysisLines, setAnalysisLines] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isEngineReady, setIsEngineReady] = useState(false);
    const [currentEvaluation, setCurrentEvaluation] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [localReviewMoves, setLocalReviewMoves] = useState([]);

    // Initialize the engine
    useEffect(() => {
        const initEngine = async () => {
            try {
                await StockfishService.init();
                StockfishService.setAnalysisCallback(handleAnalysisLine);
                setIsEngineReady(true);
            } catch (error) {
                console.error('Failed to initialize engine:', error);
                setError('Failed to initialize chess engine. Please refresh the page to try again.');
            } finally {
                setLoading(false);
            }
        };

        initEngine();

        return () => {
            StockfishService.terminate();
        };
    }, []);

    // Initialize the engine
    useEffect(() => {
        setLocalReviewMoves(reviewMoves || []);
    }, [reviewMoves]);

    // Load the review game
    useEffect(() => {
        const loadGameData = async () => {
            try {
                setLoading(true);
                // Use URL param first, fall back to context
                const gameIdToUse = urlGameId || contextGameId;
                console.log(`Loading game data for review: ${gameIdToUse}`);
                
                // First try to use context data
                if (reviewFen) {
                    console.log("Using game data from context");
                    try {
                        const newChess = new Chess(reviewFen);
                        setChess(newChess);
                        setCurrentMoveIndex(-1);
                        
                        // Start analysis if engine is ready
                        if (isEngineReady && showAnalysis) {
                            startAnalysis(newChess.fen());
                        }
                        
                        setLoading(false);
                        return;
                    } catch (error) {
                        console.error("Error using context data:", error);
                        // Continue to server fetch as fallback
                    }
                }
                
                // If we don't have context data or it failed, try to fetch from server
                if (gameIdToUse) {
                    try {
                        console.log("Fetching game data from server");
                        const response = await fetch(`http://localhost:3001/api/games/${gameIdToUse}/review`);
                        
                        if (!response.ok) {
                            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                        }
                        
                        const gameData = await response.json();
                        console.log("Received game data from server:", gameData);
                        
                        if (!gameData.fen) {
                            throw new Error("Server returned game data without FEN position");
                        }
                        
                        // Initialize the chess instance with the FEN from the server
                        const newChess = new Chess(gameData.fen);
                        setChess(newChess);
                        setCurrentMoveIndex(-1);
                        
                        // Set the moves from the server
                        if (gameData.moveHistory && Array.isArray(gameData.moveHistory)) {
                            setLocalReviewMoves(gameData.moveHistory);
                        }
                        
                        // Start analysis if engine is ready
                        if (isEngineReady && showAnalysis) {
                            startAnalysis(newChess.fen());
                        }
                        
                        setLoading(false);
                        return;
                    } catch (error) {
                        console.error('Error fetching from server:', error);
                        throw error; // Re-throw to be caught by the outer catch
                    }
                } else {
                    throw new Error("No game ID provided for review");
                }
                
            } catch (error) {
                console.error('Error loading game for review:', error);
                setError(`Failed to load game data: ${error.message}`);
                setLoading(false);
            }
        };
        
        loadGameData();
    }, [urlGameId, contextGameId, reviewFen, isEngineReady, showAnalysis]);

    // Handle analysis line callback
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

    // Start analysis of the current position
    const startAnalysis = (fen) => {
        if (!isEngineReady || !showAnalysis) return;
        
        setIsAnalyzing(true);
        setAnalysisLines([]);
        StockfishService.startAnalysis(fen);
    };

    // Navigate to a specific move
    const goToMove = (moveIndex) => {
        // Reset to starting position with the saved FEN if available
        const newChess = reviewFen ? new Chess(reviewFen) : new Chess();
        
        // Apply moves up to the selected index
        for (let i = 0; i <= moveIndex && i < localReviewMoves.length; i++) {
            try {
                newChess.move(localReviewMoves[i]);
            } catch (error) {
                console.error('Invalid move:', localReviewMoves[i], error);
            }
        }
        
        setChess(newChess);
        setCurrentMoveIndex(moveIndex);
        
        // Start analysis of the new position
        if (isEngineReady && showAnalysis) {
            startAnalysis(newChess.fen());
        }
    };

    // Navigation controls
    const goToStart = () => goToMove(-1);
    const goToPrevious = () => currentMoveIndex > -1 && goToMove(currentMoveIndex - 1);
    const goToNext = () => currentMoveIndex < localReviewMoves.length - 1 && goToMove(currentMoveIndex + 1);
    const goToEnd = () => goToMove(localReviewMoves.length - 1);

    // Toggle analysis
    const toggleAnalysis = () => {
        setShowAnalysis(!showAnalysis);
        if (!showAnalysis && isEngineReady) {
            startAnalysis(chess.fen());
        }
    };

    // Return to home
    const handleReturnHome = () => {
        navigate('/');
    };

    // Animation variants
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

    if (error) {
        return (
            <PageContainer>
                <NavBar />
                <ErrorDiv>
                    <h3>Error</h3>
                    <p>{error}</p>
                    <Button onClick={handleReturnHome}>Return to Home</Button>
                </ErrorDiv>
            </PageContainer>
        );
    }

    if (loading) {
        return (
            <PageContainer>
                <NavBar />
                <LoadingDiv>
                    <h3>Initializing Review</h3>
                    <p>Please wait while we set up the review tools...</p>
                </LoadingDiv>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <NavBar />
            <Container
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
            >
                <BoardWrapper>
                    {showAnalysis && <EvaluationBar evaluation={currentEvaluation} />}
                    <Board 
                        boardFlipped={boardFlipped}
                        analysisMode={true}
                        position={chess}
                        // Pass the setBoardFlipped function to allow the Board component to update the parent state
                        onBoardFlip={(flipped) => setBoardFlipped(flipped)}
                    />
                    <ButtonGroup>
                        <Button onClick={() => setBoardFlipped(!boardFlipped)}>
                            Flip Board
                        </Button>
                        <Button onClick={toggleAnalysis}>
                            {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                        </Button>
                        <Button onClick={handleReturnHome}>
                            Return to Home
                        </Button>
                    </ButtonGroup>
                </BoardWrapper>
                
                <ControlsWrapper>
                    <Title>Game Review</Title>
                    
                    <TabContainer>
                        <Tab 
                            active={activeTab === 'moves'} 
                            onClick={() => setActiveTab('moves')}
                        >
                            Moves
                        </Tab>
                        <Tab 
                            active={activeTab === 'analysis'} 
                            onClick={() => setActiveTab('analysis')}
                        >
                            Analysis
                        </Tab>
                    </TabContainer>
                    
                    <TabContent active={activeTab === 'moves'}>
                        <CapturedPieces position={chess.fen()} />
                        <MoveHistory 
                            moves={localReviewMoves} 
                            selectedMoveIndex={currentMoveIndex}
                            onMoveClick={goToMove}
                            onFirstMove={goToStart}
                            onPreviousMove={goToPrevious}
                            onNextMove={goToNext}
                            onLastMove={goToEnd}
                        />
                    </TabContent>
                    
                    <TabContent active={activeTab === 'analysis'}>
                        {showAnalysis && (
                            <AnalysisLines 
                                lines={analysisLines}
                                isAnalyzing={isAnalyzing}
                                engineName="Stockfish"
                            />
                        )}
                    </TabContent>
                </ControlsWrapper>
            </Container>
        </PageContainer>
    );
};

export default Review;
