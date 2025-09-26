import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

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
import SessionChecker from './components/auth/SessionChecker';

// Styles
import './index.css';

// QueryClient is defined in main.jsx

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (typeof window !== 'undefined') {
    console.log('[ProtectedRoute] path=', location.pathname, 'authLoading=', loading, 'isAuthenticated=', isAuthenticated);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
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
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1]
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
    className="min-h-screen w-full"
    style={{ position: 'relative' }}
  >
    {children}
  </motion.div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  useEffect(() => {
    console.log('[Routes] Navigated to', location.pathname);
  }, [location.pathname]);
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
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
        
        {/* Public Properties Route for Search */}
        <Route path="/properties" element={
          <AnimatedPage>
            <HouseListings />
          </AnimatedPage>
        } />
        
        {/* Property Details Route */}
        <Route path="/properties/:id" element={
          <AnimatedPage>
            <PropertyDetails />
          </AnimatedPage>
        } />
        
        {/* Main App Routes - Protected */}
        <Route path="/main" element={
          <ProtectedRoute>
            <AnimatedPage>
              <MainLanding />
            </AnimatedPage>
          </ProtectedRoute>
        } />
        
        <Route path="/listings" element={
          <AnimatedPage>
            <HouseListings />
          </AnimatedPage>
        } />
        
        <Route path="/property/:id" element={
          <AnimatedPage>
            <PropertyDetails />
          </AnimatedPage>
        } />
        
        <Route path="/gallery" element={
          <AnimatedPage>
            <Gallery />
          </AnimatedPage>
        } />
        
        <Route path="/inquiry" element={
          <AnimatedPage>
            <InquiryForm />
          </AnimatedPage>
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
const isChatSubdomain = window.location.hostname.startsWith('chat.');

const App = () => {
  useEffect(() => {
    console.log('[App] Mounted. isChatSubdomain=', isChatSubdomain);
  }, []);
  // If on chat subdomain, only show MainLanding with its routes
  if (isChatSubdomain) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <SessionChecker>
          <Routes>
            <Route path="/*" element={
              <ProtectedRoute>
                <MainLanding />
              </ProtectedRoute>
            } />
          </Routes>
        </SessionChecker>
      </>
    );
  }

  // For main domain, show regular routes
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRoutes />
    </>
  );
}



export default App;
