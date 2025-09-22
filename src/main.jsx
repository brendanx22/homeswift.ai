import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

console.log('main.jsx loaded');

// Create Emotion cache
const emotionCache = createCache({ 
  key: 'css', 
  prepend: true 
});

// Configure QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Root component with all providers
const Root = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <CacheProvider value={emotionCache}>
          <QueryClientProvider client={queryClient}>
            <AppProvider>
              <AuthProvider>
                <App />
              </AuthProvider>
            </AppProvider>
          </QueryClientProvider>
        </CacheProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);

// Get the root element
const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

// Create a root and render the app
const root = createRoot(container);
root.render(<Root />);
