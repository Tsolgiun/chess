import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuthStore } from '../../store';

const Nav = styled.nav`
  background-color: #1a1a1a;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
`;

const Logo = styled.div`
  color: #ffffff;
  font-size: 1.5rem;
  font-weight: bold;
  cursor: pointer;

  &:hover {
    color: #007bff;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
`;

const UserName = styled.span`
  font-weight: bold;
`;

const Rating = styled.span`
  color: #ffd700;
  background-color: #2a2a2a;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  color: #888888;
  font-size: 0.9rem;
`;

const StatItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: #ff4444;
  border: 1px solid #ff4444;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:hover {
    background-color: #ff4444;
    color: #ffffff;
  }
`;

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate(user ? '/lobby' : '/');
  };

  if (!user) {
    return (
      <Nav>
        <Logo onClick={handleLogoClick}>Chess Online</Logo>
      </Nav>
    );
  }

  return (
    <Nav>
      <Logo onClick={handleLogoClick}>Chess Online</Logo>
      <UserInfo>
        <ProfileInfo>
          <UserName>{user.username}</UserName>
          <Rating>{user.rating}</Rating>
        </ProfileInfo>
        <Stats>
          <StatItem>
            Wins: <span style={{ color: '#4CAF50' }}>{user.wins}</span>
          </StatItem>
          <StatItem>
            Losses: <span style={{ color: '#f44336' }}>{user.losses}</span>
          </StatItem>
          <StatItem>
            Draws: <span style={{ color: '#ff9800' }}>{user.draws}</span>
          </StatItem>
        </Stats>
        <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
      </UserInfo>
    </Nav>
  );
};

export default NavBar;
