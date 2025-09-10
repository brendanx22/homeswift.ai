import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { supabase, authHelpers } from './lib/supabase.landing';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AuthCallback from './components/AuthCallback';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a1a1a',
    },
    secondary: {
      main: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, sans-serif',
  },
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route 
            path="/" 
            element={user ? <Navigate to="/dashboard" /> : <LandingPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage user={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/auth/callback" 
            element={<AuthCallback />} 
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
