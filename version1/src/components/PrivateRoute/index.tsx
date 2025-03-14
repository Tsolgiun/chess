import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import styled from 'styled-components';

interface PrivateRouteProps {
  children: ReactNode;
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #ffffff;
  font-size: 1.2rem;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  margin-right: 1rem;
  border: 4px solid #404040;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        Loading...
      </LoadingContainer>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
