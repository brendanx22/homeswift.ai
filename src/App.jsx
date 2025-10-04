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
  }, [loading, isAuthenticated, initialCheckComplete, location.pathname, user]);

  // Handle authentication state changes
  useEffect(() => {
    // Skip if still loading or already redirecting
    if (loading || redirecting || !initialCheckComplete) return;

    // Check if we're on a public path
    const publicPaths = [
      '/login', 
      '/signup', 
      '/auth', 
      '/list-login', 
      '/list-signup',
      '/verify-email',
      '/reset-password',
      '/',
      ''
    ];

    const isPublicPath = publicPaths.some(path => 
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );

    // If not authenticated and not on a public path, redirect to login
    if (!isAuthenticated && !isPublicPath) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      setRedirecting(true);
      const redirectUrl = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?redirect=${redirectUrl}`, { replace: true });
      return;
    }

    // If authenticated and on a login/signup page, redirect to dashboard
    if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
      console.log('[ProtectedRoute] Already authenticated, redirecting to dashboard');
      setRedirecting(true);
      navigate('/dashboard', { replace: true });
      return;
    }
  }, [isAuthenticated, loading, location, navigate, initialCheckComplete, redirecting]);

  // Show loading state while checking auth
  if (loading || !initialCheckComplete) {
    return <BrandedSpinner message="Checking your session..." />;
  }

  // If redirecting, show a loading message
  if (redirecting) {
    return <BrandedSpinner message="Redirecting..." />;
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
          <DashboardProvider>
            <AnimatedPage>
              <Index/>
            </AnimatedPage>
          </DashboardProvider>
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
        
        <Route path="/user-type" element={
          <AnimatedPage>
            <UserTypeSelection />
          </AnimatedPage>
        } />
        
        <Route path="/list-login" element={
          <AnimatedPage>
            <LandlordLoginPage />
          </AnimatedPage>
        } />
        
        <Route path="/list-signup" element={
          <AnimatedPage>
            <LandlordSignupPage />
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

        {/* Messages - requires authentication when used from dashboard navigation */}
        <Route path="/messages" element={
          <DashboardProvider>
            <ProtectedRoute>
              <AnimatedPage>
                <Messages />
              </AnimatedPage>
            </ProtectedRoute>
          </DashboardProvider>
        } />

        {/* Landlord/Owner property listing page */}
        <Route path="/list-property" element={
          <DashboardProvider>
            <ProtectedRoute>
              <AnimatedPage>
                <ListPropertyPage />
              </AnimatedPage>
            </ProtectedRoute>
          </DashboardProvider>
        } />
        
        {/* Property Details Route */}
        <Route path="/properties/:id" element={
          <AnimatedPage>
            <PropertyDetails />
          </AnimatedPage>
        } />
        
        {/* Main App Routes - Protected */}
        <Route path="/dashboard" element={
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
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
            {/* Public auth routes on chat subdomain */}
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
            <Route path="/user-type" element={
              <AnimatedPage>
                <UserTypeSelection />
              </AnimatedPage>
            } />
            
            <Route path="/list-login" element={
              <AnimatedPage>
                <LandlordLoginPage />
              </AnimatedPage>
            } />
            
            <Route path="/list-signup" element={
              <AnimatedPage>
                <LandlordSignupPage />
              </AnimatedPage>
            } />
            <Route path="/auth/callback" element={
              <AnimatedPage>
                <AuthCallback />
              </AnimatedPage>
            } />
            
            {/* Root path - redirect to dashboard if authenticated, otherwise to login */}
            <Route path="/" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <MainLanding />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <MainLanding />
                </AnimatedPage>
              </ProtectedRoute>
            } />

            {/* Protected chat sub-pages */}
            <Route path="/properties" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <HouseListings />
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
            <Route path="/properties/:id" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <PropertyDetails />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/saved" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <HouseListings showSaved={true} />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/neighborhoods" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <HouseListings showNeighborhoods={true} />
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
            <Route path="/messages" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Messages />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/calculator" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <InquiryForm type="calculator" />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/tours" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <Gallery showTours={true} />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/filters" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <HouseListings showFilters={true} />
                </AnimatedPage>
              </ProtectedRoute>
            } />
            <Route path="/recent" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <HouseListings showRecent={true} />
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
            <Route path="/profile" element={
              <ProtectedRoute>
                <AnimatedPage>
                  <div>Profile Page - Coming Soon</div>
                </AnimatedPage>
              </ProtectedRoute>
            } />
            {/* Catch-all on chat to avoid blank pages */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
      </AuthProvider>
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
