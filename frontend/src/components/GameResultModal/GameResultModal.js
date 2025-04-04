import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translate(-50%, -60%);
    opacity: 0;
  }
  to {
    transform: translate(-50%, -50%);
    opacity: 1;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.show ? 'block' : 'none'};
  animation: ${fadeIn} 0.3s ease-out;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
  min-width: 300px;
  animation: ${slideIn} 0.3s ease-out;
  z-index: 1001;
`;

const ResultText = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
`;

const Button = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    background: linear-gradient(135deg, #2980b9 0%, #2475a7 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const GameResultModal = ({ show, result, onNewGame }) => {
  if (!show) return null;

  return (
    <Overlay show={show}>
      <ModalContainer>
        <ResultText>{result}</ResultText>
        <Button onClick={onNewGame}>New Game</Button>
      </ModalContainer>
    </Overlay>
  );
};

export default GameResultModal;
