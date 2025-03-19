import React from 'react';
import styled, { keyframes } from 'styled-components';
import GameSetup from '../components/GameSetup/GameSetup';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 50px;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  color: #2c3e50;
  margin-bottom: 15px;
  font-weight: 700;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
`;

const ContentWrapper = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
`;

const Home = () => {
  return (
    <Container>
      <Header>
        <Title>Online Chess</Title>
        <Subtitle>
          Play chess with friends in real-time. Create a new game or join an existing one 
          to start playing immediately.
        </Subtitle>
      </Header>
      <ContentWrapper>
        <GameSetup />
      </ContentWrapper>
    </Container>
  );
};

export default Home;
