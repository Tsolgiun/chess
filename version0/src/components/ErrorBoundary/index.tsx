import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px;
  border-radius: 8px;
  background-color: var(--error-color);
  color: var(--text-primary);
  text-align: center;
`;

const ErrorButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  background-color: var(--accent-color);
  color: var(--primary-color);
  cursor: pointer;
  font-weight: bold;

  &:hover {
    opacity: 0.9;
  }
`;

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ChessErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chess Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message || 'An unexpected error occurred'}</p>
          <ErrorButton onClick={this.handleReset}>
            Try Starting a New Game
          </ErrorButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ChessErrorBoundary; 