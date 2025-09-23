import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';

export default function AuthCallback() {
  const { error } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If there's an error, show it and redirect to login after a delay
    if (error) {
      const timer = setTimeout(() => {
        navigate('/login', { state: { error } });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
        p: 3,
        textAlign: 'center'
      }}
    >
      {error ? (
        <>
          <Alert severity="error" sx={{ mb: 2, maxWidth: 500, width: '100%' }}>
            {error}
          </Alert>
          <Typography>Redirecting to login page...</Typography>
        </>
      ) : (
        <>
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" component="div" sx={{ mt: 2 }}>
            Signing you in...
          </Typography>
        </>
      )}
    </Box>
  );
}
