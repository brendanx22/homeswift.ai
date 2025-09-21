import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

const emotionCache = createCache({ key: 'css', prepend: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const Root = () => (
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
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

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');

const root = ReactDOM.createRoot(container);
root.render(<Root />);
