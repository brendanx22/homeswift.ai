import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import HeroSection from './components/hero/HeroSection';
import LoginPage from './components/hero/LoginPage';
import SignupPage from './components/hero/SignupPage';
import EmailVerification from './components/hero/EmailVerification';
import MainLanding from './components/main/MainLanding';
import PropertyDetails from './components/main/PropertyDetails';
import Listings from './components/main/Listings';
import './index.css';

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
        <Route path="/" element={
          <AnimatedPage>
            <HeroSection />
          </AnimatedPage>
        } />
        
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
        
        <Route
          path="/property/:id"
          element={
            <ProtectedRoute>
              <AnimatedPage>
                <PropertyDetails />
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
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}