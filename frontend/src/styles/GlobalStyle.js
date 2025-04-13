import { createGlobalStyle } from 'styled-components';
import AnalysisTheme from './AnalysisTheme';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${AnalysisTheme.typography.fontFamily.primary};
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${AnalysisTheme.typography.fontWeight.bold};
    margin-bottom: ${AnalysisTheme.spacing.medium};
    color: ${({ theme }) => theme.colors.text};
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.75rem; }
  h4 { font-size: 1.5rem; }
  h5 { font-size: 1.25rem; }
  h6 { font-size: 1rem; }

  p {
    margin-bottom: ${AnalysisTheme.spacing.medium};
  }

  button {
    font-family: inherit;
    border: none;
    cursor: pointer;
    transition: ${AnalysisTheme.transitions.normal};
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.secondary};
    border: 1px solid ${({ theme }) => theme.colors.border};
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accent};
    }
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.accent};
    transition: ${AnalysisTheme.transitions.fast};

    &:hover {
      opacity: 0.8;
    }
  }

  // Chess.com-like scrollbar
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.secondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.accent};
    }
  }

  // Add animation classes
  .fadeIn {
    animation: fadeIn 0.3s ease-in;
  }

  .moveIn {
    animation: moveIn 0.3s ease-out;
  }

  .pulse {
    animation: pulse 1s infinite;
  }

  ${AnalysisTheme.animations.fadeIn}
  ${AnalysisTheme.animations.moveIn}
  ${AnalysisTheme.animations.pulse}

  @media (max-width: ${AnalysisTheme.breakpoints.mobile}) {
    html {
      font-size: 14px;
    }
  }
`;

export default GlobalStyle;
