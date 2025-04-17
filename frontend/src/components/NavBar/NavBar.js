import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: ${({ theme }) => theme.colors.primary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transition: background-color 0.3s ease;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
`;

const Button = styled(Link)`
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.accent};
  background: ${props => props.variant === 'primary' ?
    props.theme.colors.accent :
    'transparent'};
  border: ${props => props.variant === 'primary' ? 'none' : `2px solid ${props.theme.colors.accent}`};
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: ${({ theme }) => theme.colors.highlight};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ThemeToggle = styled.button`
  padding: 8px;
  background: ${({ theme, isDarkMode }) => 
    isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border: none;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  position: relative;
  overflow: hidden;

  &:hover {
    color: ${({ theme }) => theme.colors.accent};
    background: ${({ theme, isDarkMode }) => 
      isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  svg {
    position: absolute;
    transition: all 0.3s ease;
    opacity: 1;
    transform: ${({ isDarkMode }) => 
      isDarkMode ? 'translateY(0)' : 'translateY(0)'};
  }

  .sun-icon {
    opacity: ${({ isDarkMode }) => isDarkMode ? 1 : 0};
    transform: ${({ isDarkMode }) => 
      isDarkMode ? 'rotate(0)' : 'rotate(-90deg)'};
  }

  .moon-icon {
    opacity: ${({ isDarkMode }) => isDarkMode ? 0 : 1};
    transform: ${({ isDarkMode }) => 
      isDarkMode ? 'rotate(90deg)' : 'rotate(0)'};
  }
`;

const NavBar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <Nav>
      <Logo to="/">chess.mn</Logo>
      <ButtonGroup>
        <ThemeToggle 
          onClick={handleThemeToggle} 
          aria-label="Toggle theme"
          isDarkMode={isDarkMode}
        >
          <FaSun className="sun-icon" />
          <FaMoon className="moon-icon" />
        </ThemeToggle>
        <Button to="/blog">Blog</Button>
        {!user ? (
          <>
            <Button to="/login">Login</Button>
            <Button to="/register" variant="primary">Register</Button>
          </>
        ) : (
          <>
            <Button to="/profile">Profile</Button>
            <Button to="/analysis">Analysis</Button>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </>
        )}
      </ButtonGroup>
    </Nav>
  );
};

export default NavBar;
