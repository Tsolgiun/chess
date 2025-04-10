import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Chess } from 'chess.js';
import ChessBoard from '../components/Board/ChessBoard';

type RootStackParamList = {
  Home: undefined;
  Analysis: undefined;
};

type AnalysisScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Analysis'>;

const AnalysisScreen: React.FC = () => {
  const navigation = useNavigation<AnalysisScreenNavigationProp>();
  const [game, setGame] = useState<Chess>(new Chess());
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  // Update move history when the game changes
  useEffect(() => {
    setMoveHistory(game.history());
  }, [game]);

  // Handle board flip
  const handleFlipBoard = () => {
    setBoardFlipped(!boardFlipped);
  };

  // Handle reset board
  const handleResetBoard = () => {
    const newGame = new Chess();
    setGame(newGame);
  };

  // Handle going back to home screen
  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  // Render move history
  const renderMoveHistory = () => {
    if (moveHistory.length === 0) {
      return (
        <View style={styles.emptyHistoryContainer}>
          <Text style={styles.emptyHistoryText}>No moves yet</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.moveHistoryScroll}>
        <View style={styles.moveHistoryContainer}>
          {moveHistory.map((move, index) => (
            <View key={index} style={styles.moveItem}>
              <Text style={styles.moveNumber}>{Math.floor(index / 2) + 1}.</Text>
              <Text style={styles.moveText}>{move}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Analysis Board</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToHome}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.boardContainer}>
        <ChessBoard flipped={boardFlipped} />
      </View>

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={handleFlipBoard}
        >
          <Text style={styles.controlButtonText}>Flip Board</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={handleResetBoard}
        >
          <Text style={styles.controlButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.sectionTitle}>Move History</Text>
        {renderMoveHistory()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  backButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  controlButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  moveHistoryScroll: {
    flex: 1,
  },
  moveHistoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moveItem: {
    flexDirection: 'row',
    marginRight: 10,
    marginBottom: 8,
  },
  moveNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 2,
  },
  moveText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
});

export default AnalysisScreen;
