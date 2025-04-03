import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Game from './pages/Game';

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
          <Route path="/" element={<Home />} />
          <Route path="/game/:gameId" element={<Game />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <div className="App">
          <AnimatedRoutes />
        </div>
      </GameProvider>
    </BrowserRouter>
  );
}

export default App;
