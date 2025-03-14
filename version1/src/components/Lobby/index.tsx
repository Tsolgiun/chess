import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useGameStore, useAuthStore } from '../../store';

const Container = styled.div`
  padding: 2rem;
  color: #ffffff;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin: 0;
`;

const CreateGameButton = styled.button`
  background-color: #007bff;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const GamesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
`;

const Section = styled.div``;

const SectionTitle = styled.h3`
  margin-bottom: 1rem;
  color: #888888;
`;

const GameList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const GameCard = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlayerInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PlayerName = styled.span`
  font-weight: bold;
`;

const PlayerRating = styled.span`
  color: #ffd700;
  background-color: #1a1a1a;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
`;

const TimeControl = styled.div`
  color: #888888;
  font-size: 0.9rem;
`;

const JoinButton = styled.button`
  background-color: #4caf50;
  color: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #388e3c;
  }

  &:disabled {
    background-color: #666666;
    cursor: not-allowed;
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2a2a2a;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 400px;
`;

const ModalTitle = styled.h3`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #888888;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #404040;
  border-radius: 4px;
  background-color: #1a1a1a;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  background-color: transparent;
  color: #ffffff;
  border: 1px solid #ffffff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ffffff;
    color: #1a1a1a;
  }
`;

const CreateButton = styled(CreateGameButton)`
  flex: 1;
`;

const Lobby = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    activeGames,
    availableGames,
    fetchActiveGames,
    fetchAvailableGames,
    createGame,
    joinGame
  } = useGameStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initial, setInitial] = useState('10');
  const [increment, setIncrement] = useState('5');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchActiveGames();
    fetchAvailableGames();
    const interval = setInterval(() => {
      fetchActiveGames();
      fetchAvailableGames();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchActiveGames, fetchAvailableGames]);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const gameId = await createGame({
        initial: parseInt(initial) * 60,
        increment: parseInt(increment)
      });
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to create game:', error);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await joinGame(gameId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Failed to join game:', error);
    }
  };

  const formatTimeControl = (initial: number, increment: number) => {
    const minutes = Math.floor(initial / 60);
    return `${minutes}+${increment}`;
  };

  return (
    <Container>
      <Header>
        <Title>Game Lobby</Title>
        <CreateGameButton onClick={() => setIsModalOpen(true)}>
          Create New Game
        </CreateGameButton>
      </Header>

      <GamesContainer>
        <Section>
          <SectionTitle>Your Active Games</SectionTitle>
          <GameList>
            {activeGames.map((game) => (
              <GameCard key={game._id}>
                <PlayerInfo>
                  <PlayerName>
                    {game.whitePlayer._id === user?._id
                      ? game.blackPlayer?.username || 'Waiting...'
                      : game.whitePlayer.username}
                  </PlayerName>
                  <PlayerRating>
                    {game.whitePlayer._id === user?._id
                      ? game.blackPlayer?.rating || '?'
                      : game.whitePlayer.rating}
                  </PlayerRating>
                </PlayerInfo>
                <TimeControl>
                  {formatTimeControl(game.timeControl.initial, game.timeControl.increment)}
                </TimeControl>
                <JoinButton onClick={() => navigate(`/game/${game._id}`)}>
                  Continue
                </JoinButton>
              </GameCard>
            ))}
          </GameList>
        </Section>

        <Section>
          <SectionTitle>Available Games</SectionTitle>
          <GameList>
            {availableGames.map((game) => (
              <GameCard key={game._id}>
                <PlayerInfo>
                  <PlayerName>{game.whitePlayer.username}</PlayerName>
                  <PlayerRating>{game.whitePlayer.rating}</PlayerRating>
                </PlayerInfo>
                <TimeControl>
                  {formatTimeControl(game.timeControl.initial, game.timeControl.increment)}
                </TimeControl>
                <JoinButton onClick={() => handleJoinGame(game._id)}>Join</JoinButton>
              </GameCard>
            ))}
          </GameList>
        </Section>
      </GamesContainer>

      {isModalOpen && (
        <Modal>
          <ModalContent>
            <ModalTitle>Create New Game</ModalTitle>
            <Form onSubmit={handleCreateGame}>
              <InputGroup>
                <Label>Initial Time (minutes)</Label>
                <Input
                  type="number"
                  min="1"
                  max="60"
                  value={initial}
                  onChange={(e) => setInitial(e.target.value)}
                  required
                />
              </InputGroup>
              <InputGroup>
                <Label>Increment (seconds)</Label>
                <Input
                  type="number"
                  min="0"
                  max="60"
                  value={increment}
                  onChange={(e) => setIncrement(e.target.value)}
                  required
                />
              </InputGroup>
              <ButtonGroup>
                <CancelButton type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </CancelButton>
                <CreateButton type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Game'}
                </CreateButton>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Lobby;
