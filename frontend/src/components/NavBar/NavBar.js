import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #3498db;
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
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#3498db'};
  background: ${props => props.variant === 'primary' ?
    'linear-gradient(135deg, #3498db 0%, #2980b9 100%)' :
    'transparent'};
  border: ${props => props.variant === 'primary' ? 'none' : '2px solid #3498db'};
  border-radius: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: ${props => props.variant === 'primary' ?
      'linear-gradient(135deg, #2980b9 0%, #2475a7 100%)' :
      'rgba(52, 152, 219, 0.1)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #e74c3c;
  background: transparent;
  border: 2px solid #e74c3c;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: rgba(231, 76, 60, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NavBar = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Nav>
      <Logo to="/">chess.mn</Logo>
      <ButtonGroup>
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
