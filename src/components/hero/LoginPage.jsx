import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppContext } from '../../contexts/AppContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ message: '', needsVerification: false });
  const [isVerified, setIsVerified] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useContext(AppContext);

  // Check for verification status and redirect if authenticated
  useEffect(() => {
    console.log('LoginPage - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
    
    // Only proceed if we're done loading
    if (isLoading) return;
    
    // Check for verification success in URL params
    const verified = searchParams.get('verified') === 'true';
    const redirectPath = searchParams.get('redirect') || '/app';
    
    if (verified) {
      setIsVerified(true);
      // Clear the URL params
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
    
    // If already authenticated, redirect to main or the specified path
    if (isAuthenticated) {
      console.log('Already authenticated, redirecting to', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, searchParams]);

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
      
      // Use the login function from AppContext
      const userData = await login({ email, password });
      
      console.log('Login successful:', userData);
      
      // Get redirect path from URL or default to '/app'
      const redirectPath = searchParams.get('redirect') || '/app';
      console.log('Redirecting to:', redirectPath);
      
      // If redirect is to chat subdomain, use window.location.href
      if (redirectPath.includes('chat.homeswift.co')) {
        window.location.href = redirectPath;
      } else {
        // Redirect to the specified path or main page
        navigate(redirectPath);
      }
      
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

  const handleGoogleLogin = () => {
    setError({
      message: 'Google Sign-In is temporarily disabled. Please use email login.',
      needsVerification: false
    });
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-start pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32 md:pb-40 px-6 bg-cover bg-center bg-no-repeat relative"
      style={{ 
        backgroundImage: 'url("/Hero Section Image.png")',
        backgroundSize: 'cover',
        backgroundColor: '#1a1a1a'
      }}
    >
      {/* Background overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 via-transparent to-gray-800/30"></div>
      
      {/* Back Button - Top Left Corner */}
      <button
        onClick={handleBackToHome}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 flex items-center space-x-2 bg-black/20 backdrop-blur-sm border border-gray-400/30 rounded-full px-3 py-2 sm:px-3 sm:py-2 text-gray-300 hover:text-white hover:bg-black/40 hover:border-gray-300/50 transition-all duration-300 min-w-[44px] min-h-[44px] sm:min-w-auto sm:min-h-auto"
      >
        <span className="text-lg font-bold">&lt;</span>
        <img src="/images/logo.png" alt="HomeSwift Logo" className="w-4 h-4 rounded" />
      </button>


      
      <div className="w-full max-w-md relative z-10">

        {/* Login Form */}
        <div className="bg-transparent border border-gray-400/50 rounded-[2rem] px-8 py-12 min-h-[560px] md:min-h-[640px]">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isVerified ? 'Email Verified!' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300">
              {isVerified 
                ? 'Your email has been successfully verified. You can now sign in to your account.' 
                : 'Sign in to your HomeSwift account'}
            </p>
            {isVerified && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
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
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-[2rem] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
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
            className="w-full flex items-center justify-center space-x-3 bg-transparent border border-gray-400/50 text-white py-4 rounded-[2rem] font-medium hover:bg-white/5 transition-colors"
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
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')} 
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
