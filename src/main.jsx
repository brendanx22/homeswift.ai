import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@mui/material/styles';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext';
import GlobalStyles from './styles/GlobalStyles.jsx';
import theme from './styles/theme';
import { CircularProgress, Box } from '@mui/material';
import { AppRoutes } from './App.jsx';
import './styles.css';

// Create a cache for Emotion
const emotionCache = createCache({ 
  key: 'css', 
  prepend: true,
  stylisPlugins: []
})

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="100vh"
    bgcolor="background.default"
  >
    <CircularProgress />
  </Box>
);

// Debug log
console.log('Rendering app...');
const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Failed to find root element!');
  throw new Error('Failed to find root element');
}

const root = ReactDOM.createRoot(rootElement);

const App = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <GlobalStyles />
          <Suspense fallback={<LoadingSpinner />}>
            <BrowserRouter>
              <AppProvider>
                <AuthProvider>
                  <AppRoutes />
                </AuthProvider>
              </AppProvider>
            </BrowserRouter>
          </Suspense>
        </ThemeProvider>
      </CacheProvider>
    </ErrorBoundary>
  </React.StrictMode>
);