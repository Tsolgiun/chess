import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to false (light mode)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    // Optional: Add a data-theme attribute to the document for potential CSS selectors
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode ? {
      primary: '#1e1e1e',
      secondary: '#2d2d2d',
      text: '#ffffff',
      border: '#404040',
      highlight: '#3d3d3d',
      accent: '#90caf9',
      moveHighlight: 'rgba(144, 202, 249, 0.4)',
      lightSquare: '#4b4b4b',
      darkSquare: '#2b2b2b'
    } : {
      primary: '#ffffff',
      secondary: '#f5f5f5',
      text: '#000000',
      border: '#e0e0e0',
      highlight: '#e3f2fd',
      accent: '#1976d2',
      moveHighlight: 'rgba(25, 118, 210, 0.2)',
      lightSquare: '#f0d9b5',
      darkSquare: '#b58863'
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
