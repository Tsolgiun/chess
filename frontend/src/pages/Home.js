import React from 'react';
import styled from 'styled-components';
import GameSetup from '../components/GameSetup/GameSetup';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h1`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
`;

const Home = () => {
  return (
    <Container>
      <Title>Online Chess</Title>
      <GameSetup />
    </Container>
  );
};

export default Home;
