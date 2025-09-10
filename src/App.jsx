import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CircularProgress, Box } from '@mui/material';

// Lazy load components for better performance
const HeroSection = React.lazy(() => import('./components/hero/HeroSection'));
const LoginPage = React.lazy(() => import('./components/hero/LoginPage'));
const SignupPage = React.lazy(() => import('./components/hero/SignupPage'));
const EmailVerification = React.lazy(() => import('./components/hero/EmailVerification'));
const MainLanding = React.lazy(() => import('./components/main/MainLanding'));
const Listings = React.lazy(() => import('./components/main/Listings'));
const AuthCallback = React.lazy(() => import('./pages/AuthCallback'));
const ResetPasswordPage = React.lazy(() => import('./pages/ResetPasswordPage'));
// PropertyDetails has been removed as part of property features cleanup

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { isLoading } = useAppContext();

  if (loading || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }

  return children;
};

// Animation variants for page transitions
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.2, 0, 0, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// Wrapper component for animated pages
const AnimatedPage = ({ children }) => (
  <motion.div
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    className="min-h-screen w-full"
  >
    {children}
  </motion.div>
);

function AppRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <AnimatedPage>
              <HeroSection />
            </AnimatedPage>
          }
        />
        
        <Route path="/login" element={
          <AnimatedPage>
            <LoginPage />
          </AnimatedPage>
        } />
        
        <Route path="/signup" element={
          <AnimatedPage>
            <SignupPage />
          </AnimatedPage>
        } />
        
        <Route path="/verify-email" element={
          <AnimatedPage>
            <EmailVerification />
          </AnimatedPage>
        } />
        
        {/* OAuth Callback Route */}
        <Route path="/auth/callback" element={
          <Suspense fallback={<div>Loading...</div>}>
            <AuthCallback />
          </Suspense>
        } />
        
        {/* Password Reset Callback */}
        <Route path="/reset-password" element={
          <AnimatedPage>
            <ResetPasswordPage />
          </AnimatedPage>
        } />
        
        {/* Protected Routes */}
        <Route
          path="/main"
          element={
            <ProtectedRoute>
              <AnimatedPage>
                <MainLanding />
              </AnimatedPage>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/listings"
          element={
            <ProtectedRoute>
              <AnimatedPage>
                <Listings />
              </AnimatedPage>
            </ProtectedRoute>
          }
        />
        
        {/* Property details route removed - feature not available */}
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute>
              <AnimatedPage>
                <Navigate to="/listings" replace />
              </AnimatedPage>
            </ProtectedRoute>
          }
        />
        
        {/* Catch-all route */}
        <Route path="*" element={
          <AnimatedPage>
            <Navigate to="/" replace />
          </AnimatedPage>
        } />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  // Loading component for Suspense fallback
  const LoadingSpinner = () => (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}>
      <CircularProgress />
    </Box>
  );

  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <AppProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </AppProvider>
      </Suspense>
    </Router>
  );
}