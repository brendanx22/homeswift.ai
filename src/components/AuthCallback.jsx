import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../lib/supabase.landing';

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session) {
          // Successfully authenticated, redirect to dashboard
          navigate('/dashboard');
        } else {
          // No session found, redirect to login
          navigate('/');
        }
      } catch (error) {
        console.error('Authentication error:', error.message);
        navigate('/?error=auth_failed');
      }
    };

    handleAuth();
  }, [navigate]);

  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
      <Typography variant="h6" gutterBottom>
        Signing you in...
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Please wait while we authenticate your account.
      </Typography>
    </Box>
  );
}

export default AuthCallback;
