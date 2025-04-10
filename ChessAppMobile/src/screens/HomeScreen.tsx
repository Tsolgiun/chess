import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/NewGameContext';
import { currentPlatform } from '../utils/platform/PlatformFactory';

type RootStackParamList = {
  Home: undefined;
  Game: { gameId?: string };
  Profile: undefined;
  Analysis: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const { createGame, startAIGame, resetGameState } = useGame();
  const [gameCode, setGameCode] = useState('');

  // Reset game state when returning to home screen
  useEffect(() => {
    resetGameState();
  }, [resetGameState]);

  // Handle creating a new online game
  const handleCreateGame = () => {
    createGame();
    navigation.navigate('Game', {});
  };

  // Handle joining an existing game
  const handleJoinGame = () => {
    if (gameCode.trim()) {
      navigation.navigate('Game', { gameId: gameCode.trim() });
    }
  };

  // Handle starting a game against AI
  const handlePlayAI = () => {
    startAIGame('white');
    navigation.navigate('Game', {});
  };

  // Handle starting a game against AI as black
  const handlePlayAIAsBlack = () => {
    startAIGame('black');
    navigation.navigate('Game', {});
  };

  // Handle navigating to the analysis screen
  const handleAnalysis = () => {
    navigation.navigate('Analysis');
  };

  // Handle navigating to the profile screen
  const handleProfile = () => {
    navigation.navigate('Profile');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Chess App</Text>
          {user && (
            <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
              <Text style={styles.profileButtonText}>Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateGame}
          >
            <Text style={styles.buttonText}>Create Online Game</Text>
          </TouchableOpacity>

          <View style={styles.joinGameContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Game Code"
              value={gameCode}
              onChangeText={setGameCode}
              autoCapitalize="characters"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, styles.joinButton]}
              onPress={handleJoinGame}
              disabled={!gameCode.trim()}
            >
              <Text style={styles.buttonText}>Join Game</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.aiButtonsContainer}>
            <TouchableOpacity
              style={[styles.button, styles.aiButton]}
              onPress={handlePlayAI}
            >
              <Text style={styles.buttonText}>Play AI as White</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.aiButton]}
              onPress={handlePlayAIAsBlack}
            >
              <Text style={styles.buttonText}>Play AI as Black</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleAnalysis}
          >
            <Text style={styles.buttonText}>Analysis Board</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.platformText}>
            Running on {currentPlatform.getPlatformName()} platform
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  profileButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  profileButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 15,
  },
  joinGameContainer: {
    marginBottom: 15,
  },
  aiButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  aiButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#2c3e50',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  joinButton: {
    marginBottom: 0,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  platformText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
});

export default HomeScreen;
