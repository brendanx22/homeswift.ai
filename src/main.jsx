import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { ThemeProvider } from '@emotion/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

// Create a cache for Emotion
const emotionCache = createCache({ 
  key: 'css', 
  prepend: true,
  stylisPlugins: []
});

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Create a custom history object to access the history API
import { createBrowserHistory } from 'history';

// Create a browser history object
const history = createBrowserHistory();

// Wrap the app with all necessary providers
const Root = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <CacheProvider value={emotionCache}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <AppProvider>
                <App />
              </AppProvider>
            </AuthProvider>
          </QueryClientProvider>
        </CacheProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Render the app
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Check if root already exists to prevent multiple creation
let root;
if (container._reactRootContainer) {
  root = container._reactRootContainer;
} else {
  root = ReactDOM.createRoot(container);
  container._reactRootContainer = root;
}

root.render(<Root />);
