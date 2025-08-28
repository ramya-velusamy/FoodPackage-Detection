import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Dashboard from './components/Dashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#64ffda', // Vibrant teal
    },
    secondary: {
      main: '#ff6b6b', // Vibrant coral
    },
    background: {
      default: '#0a192f', // Deep navy
      paper: '#112240',   // Slightly lighter navy
    },
    text: {
      primary: '#e6f1ff', // Light blue-white
      secondary: '#8892b0', // Muted blue-gray
    },
    success: {
      main: '#64ffda', // Vibrant teal for success
    },
    warning: {
      main: '#f7cc7f', // Warm yellow
    },
    error: {
      main: '#ff6b6b', // Vibrant coral for errors
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none', // Remove default paper texture
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundImage: 'none',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  );
}

export default App;
