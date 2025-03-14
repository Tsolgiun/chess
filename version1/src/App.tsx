import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import styled from 'styled-components';

import NavBar from './components/NavBar';
import Register from './components/Auth/Register';
import Login from './components/Auth/Login';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import PrivateRoute from './components/PrivateRoute';

const AppContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background-color: #121212;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 2rem;
`;

const App = () => {
  const { user } = useAuthStore();

  return (
    <Router>
      <AppContainer>
        <NavBar />
        <MainContent>
          <Routes>
            <Route 
              path="/" 
              element={
                user ? 
                <Navigate to="/lobby" replace /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/lobby" replace /> : <Register />} 
            />
            <Route 
              path="/login" 
              element={user ? <Navigate to="/lobby" replace /> : <Login />} 
            />
            <Route
              path="/lobby"
              element={
                <PrivateRoute>
                  <Lobby />
                </PrivateRoute>
              }
            />
            <Route
              path="/game/:gameId"
              element={
                <PrivateRoute>
                  <GameRoom />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
};

export default App;
