import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import NavBar from '../components/NavBar/NavBar';

const Container = styled.div`
  max-width: 800px;
  margin: 120px auto;
  padding: 20px;
`;

const ProfileCard = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  padding: 30px;
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  margin: 0;
  color: #2c3e50;
  font-size: 24px;
`;

const UserMeta = styled.div`
  color: #7f8c8d;
  font-size: 14px;
  margin-top: 5px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-top: 20px;
`;

const StatCard = styled.div`
  background: ${props => props.color || '#f8f9fa'};
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  background: ${props => props.variant === 'outline' ? 'transparent' : '#3498db'};
  color: ${props => props.variant === 'outline' ? '#3498db' : 'white'};
  border: ${props => props.variant === 'outline' ? '2px solid #3498db' : 'none'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Profile = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const getInitials = (name) => {
    return name.charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <NavBar />
      <Container>
      <ProfileCard>
        <Header>
          <Avatar>{getInitials(user.username)}</Avatar>
          <UserInfo>
            <Username>{user.username}</Username>
            <UserMeta>
              Member since {formatDate(user.joinedDate)}
              <br />
              Rating: {user.rating}
            </UserMeta>
          </UserInfo>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </Button>
        </Header>

        <Stats>
          <StatCard color="#2ecc71">
            <StatValue>0</StatValue>
            <StatLabel>Wins</StatLabel>
          </StatCard>
          <StatCard color="#e74c3c">
            <StatValue>0</StatValue>
            <StatLabel>Losses</StatLabel>
          </StatCard>
          <StatCard color="#f39c12">
            <StatValue>0</StatValue>
            <StatLabel>Draws</StatLabel>
          </StatCard>
        </Stats>
      </ProfileCard>
      </Container>
    </>
  );
};

export default Profile;
