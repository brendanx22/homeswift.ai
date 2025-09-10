import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Avatar, Paper } from '@mui/material';
import { authHelpers } from '../lib/supabase.landing';

function DashboardPage({ user }) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await authHelpers.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Welcome, {user?.user_metadata?.full_name || 'User'}!
        </Typography>
        <Button 
          variant="outlined" 
          color="error"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.email?.charAt(0).toUpperCase()}
            sx={{ width: 80, height: 80, mr: 3 }}
          />
          <Box>
            <Typography variant="h6">{user?.email}</Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user?.created_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>Your Account</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
          {[
            { label: 'Email', value: user?.email },
            { label: 'Name', value: user?.user_metadata?.full_name || 'Not set' },
            { label: 'Account Status', value: user?.confirmed_at ? 'Verified' : 'Pending Verification' },
            { label: 'Last Sign In', value: new Date(user?.last_sign_in_at).toLocaleString() },
          ].map((item, index) => (
            <Box key={index} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography>{item.value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>Get Started</Typography>
        <Typography paragraph>
          Welcome to your HomeSwift dashboard. Here are some quick actions to get you started:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" color="primary">
            Search Homes
          </Button>
          <Button variant="outlined" color="primary">
            Save Searches
          </Button>
          <Button variant="outlined" color="primary">
            View Favorites
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default DashboardPage;
