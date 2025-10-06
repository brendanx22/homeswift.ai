import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, Users } from 'lucide-react';
import { useGoogleAuth } from '../../lib/googleAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ message: '', needsVerification: false });
  const [isVerified, setIsVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, isAuthenticated, loading: authLoading } = useAuth();
  const googleAuth = useGoogleAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // Handle authentication state and redirects
  useEffect(() => {
    // Only proceed if we're done loading
    if (authLoading) return;
    
    const redirectPath = searchParams.get('redirect');
    const verified = searchParams.get('verified') === 'true';
    const host = window.location.hostname;
    const isChatDomain = host === 'chat.homeswift.co';
    const isMainDomain = host === 'homeswift.co' || host === 'www.homeswift.co';
    
    // Handle email verification success
    if (verified) {
      setIsVerified(true);
      // Clear the URL params
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    
    // Handle authenticated state
    if (isAuthenticated) {
      // Small delay to ensure state is consistent
      const timer = setTimeout(() => {
        // If we have a valid redirect path that's not an auth page, use it
        if (redirectPath && !['/login', '/signup', '/verify-email'].some(p => redirectPath.includes(p))) {
          navigate(redirectPath, { replace: true });
        } 
        // If we're on the main domain, redirect to chat
        else if (isMainDomain) {
          window.location.href = 'https://chat.homeswift.co/';
        }
        // If we're on the chat domain, go to the root
        else if (isChatDomain) {
          navigate('/', { replace: true });
        }
        // Default to home
        else {
          navigate('/', { replace: true });
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError({ message: '', needsVerification: false });

    // Basic validation
    if (!email || !password) {
      setError({
        message: 'Please enter both email and password.',
        needsVerification: false
      });
      setLoading(false);
      return;
    }

    try {
      console.log('Login attempt with:', { email, password: '***' });
      
      // Use the signIn function from AuthContext (it will handle navigation)
      const userData = await signIn(email, password);
      console.log('Login successful:', userData);
      
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle email verification required case
      if (err.needsVerification) {
        setError({
          message: 'Please verify your email before logging in.',
          needsVerification: true,
          email: err.email || email
        });
      } else {
        // Handle other login errors
        let errorMessage = 'Login failed. Please check your credentials and try again.';
        
        // More specific error messages based on status code
        if (err.response?.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.response?.status === 429) {
          errorMessage = 'Too many login attempts. Please try again later.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError({
          message: errorMessage,
          needsVerification: false
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (emailToVerify) => {
    try {
      setLoading(true);
      await api.post('/auth/resend-verification', { email: emailToVerify });
      setError({
        message: `Verification email sent to ${emailToVerify}! Please check your inbox.`,
        needsVerification: false
      });
    } catch (err) {
      console.error('Failed to resend verification email:', err);
      setError({
        message: 'Failed to resend verification email. Please try again later.',
        needsVerification: true,
        email: emailToVerify
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError({ message: '', needsVerification: false });

    try {
      await googleAuth.signInWithGoogle({
        redirectTo: window.location.origin,
        userType: 'renter'
      });
      // The redirect will happen automatically via Supabase OAuth
    } catch (error) {
      console.error('Google login error:', error);
      setError({
        message: error.message || 'Google sign-in failed. Please try again.',
        needsVerification: false
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-start pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32 md:pb-40 px-6 bg-cover bg-center bg-no-repeat relative"
     
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-white"></div>
      
      {/* Back Button - Top Left Corner */}
      <button
        onClick={() => navigate('/user-type')}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center space-x-2 bg-white border border-[#2C3E50]/20 rounded-full px-4 py-2 text-[#2C3E50] hover:text-[#FF6B35] hover:border-[#FF6B35] transition-all duration-300 min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto shadow-sm"
      >
        <span className="text-lg font-bold">&lt;</span>
        <img src="/images/logo.png" alt="HomeSwift Logo" className="w-4 h-4 rounded" />
      </button>


      
      <div className="w-full max-w-md relative z-10">

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm border border-[#2C3E50]/20 rounded-[2rem] px-8 py-12 min-h-[560px] md:min-h-[640px] shadow-xl">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4"
            >
              <Users className="w-8 h-8 text-blue-600" />
            </motion.div>

            <h1 className="text-3xl font-bold text-[#2C3E50] mb-2">
              {isVerified ? 'Email Verified!' : 'Renter Login'}
            </h1>
            <p className="text-[#2C3E50]/80">
              {isVerified ? 'Your email has been verified successfully!' : 'Sign in to browse properties'}
            </p>
            {isVerified && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
                Email verification successful! You can now log in to your account.
              </div>
            )}
          </div>

          {error.message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${
              error.needsVerification ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
            }`}>
              {error.needsVerification ? (
                <div>
                  <p>{error.message}</p>
                  <button 
                    onClick={() => handleResendVerification(error.email)}
                    className="mt-2 text-sm font-medium text-yellow-700 hover:text-yellow-800 focus:outline-none"
                    disabled={loading}
                  >
                    {loading ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              ) : (
                error.message
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-4 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Enter your email"
                  autoComplete="username"
                  inputMode="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-12 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-gray-300 text-sm">Remember me</span>
              </label>
              <a href="#" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                Forgot password?
              </a>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-[2rem] font-semibold text-lg hover:bg-[#e85e2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>

          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center space-x-3 bg-transparent border border-gray-400/50 text-[#2C3E50] py-4 rounded-[2rem] font-medium hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Looking for landlord tools?{' '}
              <button 
                onClick={() => navigate('/user-type')} 
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Switch to Landlord Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
