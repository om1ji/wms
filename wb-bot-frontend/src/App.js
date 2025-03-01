import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Fade } from '@mui/material';
import styled from 'styled-components';
import Calculator from './components/Calculator.tsx';
import { useTelegram } from './hooks/useTelegram';
import './App.css';

const MainContent = styled.main`
  background-color: var(--tg-theme-bg-color, #fff);
  color: var(--tg-theme-text-color, #000);
  height: 100vh;
    `;

const Hero = styled.section`
  background: linear-gradient(135deg, #E4017D 0%, #A601B4 100%);
  color: white;
  text-align: center;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;

  h1 {
    font-size: 2.5rem;
    margin-bottom: 2rem;
    font-weight: 500;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
  }
`;

const CalculateButton = styled.button`
  background-color: white;
  color: #E4017D;
  border: none;
  padding: 12px 32px;
  font-size: 1.1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
`;

const theme = createTheme({
  palette: {
    primary: {
      main: '#E4017D',
      light: '#FF4DA1',
      dark: '#B1015F',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#A601B4',
      light: '#D601E8',
      dark: '#7A0086',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
      disabled: '#999999',
    },
    error: {
      main: '#FF3B30',
      light: '#FF6B61',
      dark: '#CC2F26',
    },
    success: {
      main: '#34C759',
      light: '#5FD37E',
      dark: '#289F47',
    },
    warning: {
      main: '#FF9500',
      light: '#FFAA33',
      dark: '#CC7700',
    },
    info: {
      main: '#007AFF',
      light: '#3395FF',
      dark: '#0062CC',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      lineHeight: 1.2,
      color: '#000000',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.3,
      color: '#000000',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#000000',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#000000',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#000000',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.4,
      color: '#000000',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#000000',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      color: '#000000',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 24px',
          fontSize: '1rem',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 2px 4px rgba(0,0,0,0.05)',
    '0 4px 8px rgba(0,0,0,0.05)',
    '0 8px 16px rgba(0,0,0,0.05)',
    '0 12px 24px rgba(0,0,0,0.05)',
  ],
});

function App() {
  const { tg } = useTelegram();
  const [showHero, setShowHero] = useState(true);
  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    tg.ready();
    tg.expand();
  }, [tg]);

  const handleCalculateClick = () => {
    setShowHero(false);
    // Небольшая задержка перед показом калькулятора для плавности анимации
    setTimeout(() => setShowCalculator(true), 300);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">       
          <MainContent>
            <Fade in={showHero} timeout={300} unmountOnExit>
              <Hero>
                <HeroContent>
                  <h1>Расчёт стоимости отправки груза на склады Wildberries, Яндекс.Маркет, Ozon</h1>
                  <CalculateButton onClick={handleCalculateClick}>
                    Рассчитать
                  </CalculateButton>
                </HeroContent>
              </Hero>
            </Fade>
            
            <Fade in={showCalculator} timeout={300}>
              <div>
                <Calculator />
              </div>
            </Fade>
          </MainContent>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
