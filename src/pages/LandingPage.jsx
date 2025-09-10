import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Container, Typography, Box, Grid } from '@mui/material';
import { authHelpers } from '../lib/supabase.landing';

function LandingPage() {
  const handleGoogleSignIn = async () => {
    try {
      const { error } = await authHelpers.signInWithGoogle();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        py: 12,
        textAlign: 'center',
      }}>
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Welcome to HomeSwift
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Your smart home search starts here
          </Typography>
          <Button 
            variant="contained" 
            color="secondary" 
            size="large"
            onClick={handleGoogleSignIn}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Get Started with Google
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
          Why Choose HomeSwift?
        </Typography>
        <Grid container spacing={4}>
          {[
            {
              title: 'Smart Search',
              description: 'Find your dream home with our intelligent search algorithms.'
            },
            {
              title: 'AI-Powered',
              description: 'Get personalized recommendations based on your preferences.'
            },
            {
              title: 'Real-Time Updates',
              description: 'Be the first to know about new listings that match your criteria.'
            }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ 
                p: 3, 
                height: '100%',
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                },
              }}>
                <Typography variant="h6" component="h3" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {feature.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8, mt: 4 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to find your dream home?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
            Join thousands of happy home seekers who found their perfect match with HomeSwift.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            onClick={handleGoogleSignIn}
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: '50px',
              textTransform: 'none',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            Get Started for Free
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box component="footer" sx={{ py: 4, bgcolor: 'background.paper', mt: 'auto' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} HomeSwift. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default LandingPage;
