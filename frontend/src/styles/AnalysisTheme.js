const AnalysisTheme = {
    colors: {
        primary: '#31708f',
        primaryDark: '#2c3e50',
        lightBg: '#f8f9fa',
        darkBg: '#343a40',
        boardLight: '#ebecd0',
        boardDark: '#779556',
        text: {
            primary: '#2c3e50',
            secondary: '#6c757d',
            light: '#95a5a6'
        },
        evaluation: {
            winning: '#2ecc71',
            advantage: '#27ae60',
            equal: '#95a5a6',
            disadvantage: '#e74c3c',
            losing: '#c0392b'
        }
    },
    shadows: {
        small: '0 2px 4px rgba(0, 0, 0, 0.1)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 20px rgba(0, 0, 0, 0.1)'
    },
    gradients: {
        primary: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
        secondary: 'linear-gradient(135deg, #2c3e50 0%, #2c3e50 100%)',
        success: 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)'
    },
    borders: {
        radius: {
            small: '4px',
            medium: '8px',
            large: '16px'
        }
    },
    typography: {
        fontFamily: {
            primary: '"Roboto", sans-serif',
            mono: '"Roboto Mono", monospace'
        },
        fontSize: {
            small: '0.875rem',
            medium: '1rem',
            large: '1.25rem',
            heading: '1.5rem'
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            bold: 700
        }
    },
    spacing: {
        small: '8px',
        medium: '16px',
        large: '24px',
        xlarge: '32px'
    },
    transitions: {
        fast: 'all 0.2s ease',
        normal: 'all 0.3s ease',
        slow: 'all 0.5s ease'
    },
    breakpoints: {
        mobile: '576px',
        tablet: '768px',
        desktop: '1024px',
        large: '1200px'
    },
    animations: {
        moveIn: `
            @keyframes moveIn {
                0% {
                    opacity: 0;
                    transform: translateY(10px);
                }
                100% {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `,
        fadeIn: `
            @keyframes fadeIn {
                0% { opacity: 0; }
                100% { opacity: 1; }
            }
        `,
        pulse: `
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
        `
    }
};

export default AnalysisTheme;
