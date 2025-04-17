import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { GameProvider } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import GlobalStyle from './styles/GlobalStyle';
import AnalysisTheme from './styles/AnalysisTheme';
import Home from './pages/Home';
import Game from './pages/Game';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Analysis from './pages/Analysis';
import Review from './pages/Review';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import NavBar from './components/NavBar/NavBar';

import './App.css';

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.95
  },
  enter: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : children;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        style={{ width: '100%', height: '100%' }}
      >
        <Routes location={location}>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={
            <PrivateRoute>
              <Game />
            </PrivateRoute>
          } />
          <Route path="/analysis" element={<Analysis />} />
          <Route path="/review/:reviewGameId" element={<Review />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const AppContent = () => {
  const theme = useTheme();
  return (
    <StyledThemeProvider theme={{ ...AnalysisTheme, colors: theme.colors }}>
      <GlobalStyle />
      <BrowserRouter>
        <AuthProvider>
          <GameProvider>
            <div className="App">
              <NavBar />
              <AnimatedRoutes />
            </div>
          </GameProvider>
        </AuthProvider>
      </BrowserRouter>
    </StyledThemeProvider>
  );
};

export default App;
