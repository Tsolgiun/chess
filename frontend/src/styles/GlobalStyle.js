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
    background-color: #2f3542;
    color: ${AnalysisTheme.colors.text.primary};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${AnalysisTheme.typography.fontWeight.bold};
    margin-bottom: ${AnalysisTheme.spacing.medium};
    color: ${AnalysisTheme.colors.primaryDark};
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
  }

  a {
    text-decoration: none;
    color: ${AnalysisTheme.colors.primary};
    transition: ${AnalysisTheme.transitions.fast};

    &:hover {
      color: ${AnalysisTheme.colors.primaryDark};
    }
  }

  // Chess.com-like scrollbar
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${AnalysisTheme.colors.lightBg};
  }

  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #666;
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
