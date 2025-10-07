import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ChatRoutes from './routes/ChatRoutes';

// Pages
import Index from './pages/Index';
import LoginPage from './components/hero/LoginPage';
import SignupPage from './components/hero/SignupPage';
import EmailVerification from './components/hero/EmailVerification';
import MainLanding from './components/main/MainLanding';
import HouseListings from './pages/HouseListings';
import PropertyDetails from './pages/PropertyDetails';
import Gallery from './pages/Gallery';
import InquiryForm from './pages/InquiryForm';
import NotFound from './pages/NotFound';
import Messages from './components/dashboard/Messages/Messages';
import SessionChecker from './components/auth/SessionChecker';
import AuthCallback from './components/auth/AuthCallback';
import BrandedSpinner from './components/common/BrandedSpinner';
import ListPropertyPage from './components/dashboard/ListProperty/index';
import Dashboard from './components/dashboard/Dashboard';
import { DashboardProvider } from './contexts/DashboardContext';
import UserTypeSelection from './components/UserTypeSelection';
import LandlordLoginPage from './components/LandlordLoginPage';
import LandlordSignupPage from './components/LandlordSignupPage';
import TestConnection from './pages/TestConnection';
import WaitlistPage from './pages/WaitlistPage';

// Styles
import './index.css';

// QueryClient is defined in main.jsx

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user, initialCheckComplete } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // Log auth state for debugging
  React.useEffect(() => {
    console.log('[ProtectedRoute] Auth state:', { 
      loading, 
      isAuthenticated, 
      initialCheckComplete,
      path: location.pathname,
      user: user ? 'User exists' : 'No user'
    });

    if (!loading && !isAuthenticated && initialCheckComplete) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      navigate('/login', { state: { from: location }, replace: true });
    }
  }, [isAuthenticated, loading, initialCheckComplete, location, navigate]);

  if (loading || !initialCheckComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <BrandedSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect will happen in the effect
  }

  return children;
};

// Animation variants for page transitions
const variants = {
  hidden: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Wrapper component for animated pages
const AnimatedPage = ({ children }) => (
  <motion.div
    initial="hidden"
    animate="enter"
    exit="exit"
    variants={variants}
    className="min-h-screen"
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={
            <AnimatedPage>
            <Index />
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
        <Route path="/auth/callback" element={
          <AnimatedPage>
            <AuthCallback />
          </AnimatedPage>
        } />
        <Route path="/test-connection" element={
          <AnimatedPage>
            <TestConnection />
          </AnimatedPage>
        } />
        <Route path="/user-type" element={
          <AnimatedPage>
            <UserTypeSelection />
          </AnimatedPage>
        } />
        <Route path="/waitlist" element={
          <AnimatedPage>
            <WaitlistPage />
          </AnimatedPage>
        } />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <AnimatedPage>
              <Dashboard />
            </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/properties" element={
          <ProtectedRoute>
          <AnimatedPage>
            <HouseListings />
          </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/properties/:id" element={
          <ProtectedRoute>
          <AnimatedPage>
            <PropertyDetails />
          </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/gallery" element={
          <ProtectedRoute>
          <AnimatedPage>
            <Gallery />
          </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/inquiry" element={
          <ProtectedRoute>
          <AnimatedPage>
            <InquiryForm />
          </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <AnimatedPage>
              <Messages />
            </AnimatedPage>
          </ProtectedRoute>
        } />
        <Route path="/list-property" element={
          <ProtectedRoute>
            <AnimatedPage>
              <ListPropertyPage />
            </AnimatedPage>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={
          <AnimatedPage>
            <NotFound />
          </AnimatedPage>
        } />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  return <AnimatedRoutes />;
};

// Check if we're on the chat subdomain
const isChatSubdomain = window.location.hostname.startsWith('chat.') || 
                       (window.location.hostname === 'localhost' && import.meta.env.VITE_APP_MODE === 'chat');

function App() {
  const queryClient = new QueryClient();
  
  useEffect(() => {
    console.log('[App] Mounted. isChatSubdomain=', isChatSubdomain, 'VITE_APP_MODE=', import.meta.env.VITE_APP_MODE);
  }, []);

  // If on chat subdomain, use the ChatRoutes component
  if (isChatSubdomain) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChatRoutes />
        </AuthProvider>
      </QueryClientProvider>
    );
  }

  // For main domain, show regular routes
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <AppRoutes />
      </AuthProvider>
    </QueryClientProvider>
  );
}



export default App;
