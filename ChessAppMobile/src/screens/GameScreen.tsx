import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useGame } from '../context/NewGameContext';
import ChessBoard from '../components/Board/ChessBoard';

// Define the parameter list for the stack navigator
type RootStackParamList = {
  Home: undefined;
  Game: { gameId?: string };
  Profile: undefined;
  Analysis: undefined;
};

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

const GameScreen: React.FC = () => {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { 
    gameState,
    isAIThinking,
    opponentPlatform,
    joinGame,
    resignGame
  } = useGame();

  // Join game if gameId is provided in route params
  useEffect(() => {
    const routeGameId = route.params?.gameId;
    if (routeGameId && !gameState.gameId) {
      joinGame(routeGameId);
    }
  }, [route.params, gameState.gameId, joinGame]);

  // Handle resignation
  const handleResign = () => {
    Alert.alert(
      'Resign Game',
      'Are you sure you want to resign?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Resign', 
          style: 'destructive',
          onPress: () => {
            resignGame();
            if (gameState.gameType === 'ai') {
              // For AI games, we can navigate back immediately
              navigation.goBack();
            }
          }
        },
      ]
    );
  };

  // Handle going back to home screen
  const handleBackToHome = () => {
    navigation.navigate('Home');
  };

  // Render game status
  const renderGameStatus = () => {
    if (isAIThinking) {
      return (
        <View style={styles.statusContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.statusText}>AI is thinking...</Text>
        </View>
      );
    }

    return (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{gameState.status}</Text>
      </View>
    );
  };

  // Render game info
  const renderGameInfo = () => {
    return (
      <View style={styles.infoContainer}>
        {gameState.gameId && (
          <Text style={styles.gameIdText}>Game ID: {gameState.gameId}</Text>
        )}
        {gameState.playerColor && (
          <Text style={styles.playerColorText}>
            You are playing as {gameState.playerColor}
          </Text>
        )}
        {opponentPlatform && (
          <Text style={styles.platformText}>
            Opponent is playing on {opponentPlatform}
          </Text>
        )}
      </View>
    );
  };

  // Render game controls
  const renderGameControls = () => {
    if (gameState.gameOver) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={handleBackToHome}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.resignButton]}
          onPress={handleResign}
          disabled={!gameState.isPlayerTurn}
        >
          <Text style={styles.buttonText}>Resign</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderGameStatus()}
      {renderGameInfo()}
      
      <View style={styles.boardContainer}>
        <ChessBoard flipped={gameState.playerColor === 'black'} />
      </View>
      
      {renderGameControls()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 8,
  },
  infoContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  gameIdText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  playerColorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  platformText: {
    fontSize: 14,
    color: '#3498db',
    fontStyle: 'italic',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resignButton: {
    backgroundColor: '#e74c3c',
  },
  backButton: {
    backgroundColor: '#3498db',
    alignSelf: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default GameScreen;
