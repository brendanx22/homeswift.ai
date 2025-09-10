import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ message: '', needsVerification: false });
  const [isPasswordResetSent, setIsPasswordResetSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading, resetPassword, signInWithGoogle } = useAuth();

  // Redirect if authenticated
  useEffect(() => {
    const redirectPath = searchParams.get('redirect') || '/';
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError({ message: errorParam });
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      return;
    }

    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, searchParams]);

  // Handle login with Supabase
  const handleLogin = async () => {
    if (!email || !password) {
      setError({ message: 'Please enter both email and password' });
      return;
    }

    setLoading(true);
    setError({ message: '', needsVerification: false });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw { message: 'Please verify your email before logging in.', needsVerification: true };
        }
        throw error;
      }

      // Get the full user data
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update the auth context
      await login({ email, password });
      
      const redirectPath = searchParams.get('redirect') || '/main';
      navigate(redirectPath);
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'Login failed. Please check your credentials and try again.';

      if (err.status === 400) errorMessage = 'Invalid email or password.';
      else if (err.status === 429) errorMessage = 'Too many login attempts. Please try again later.';
      else if (err.needsVerification) {
        setError({ message: err.message, needsVerification: true });
        return;
      } else if (err.message) errorMessage = err.message;

      setError({ message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Handle password reset with Supabase
  const handlePasswordReset = async () => {
    if (!email) {
      setError({ message: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setError({ message: '' });

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      setIsPasswordResetSent(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError({ message: err.message || 'Failed to send password reset email.' });
    } finally {
      setLoading(false);
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showResetForm) {
      await handlePasswordReset();
    } else {
      await handleLogin();
    }
  };

  // Google login with Supabase
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError({ message: '' });
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;
    } catch (err) {
      console.error('Google login error:', err);
      setError({ 
        message: err.message || 'Failed to sign in with Google. Please try again.',
        needsVerification: false 
      });
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 bg-cover bg-center bg-no-repeat relative"
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
        className="absolute top-6 left-6 z-20 flex items-center space-x-3 bg-black/20 backdrop-blur-sm border border-gray-400/30 rounded-full px-4 py-2 text-gray-300 hover:text-white hover:bg-black/40 hover:border-gray-300/50 transition-all duration-300 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="font-medium text-sm">Back to Home</span>
      </button>
      
      <div className="w-full max-w-md relative z-10">
        {/* Login Form */}
        <div className="bg-transparent border border-gray-400/50 rounded-[2rem] p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              {showResetForm ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-300 text-sm">
              {showResetForm 
                ? 'Enter your email to receive a password reset link'
                : 'Sign in to your account to continue'}
            </p>
          </div>

          {isPasswordResetSent && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              Password reset link sent to {email}. Check your email.
            </div>
          )}

          {error.message && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
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
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {!showResetForm && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetForm(true);
                      setError({ ...error, message: '' });
                    }}
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                    placeholder="Enter your password"
                    disabled={loading}
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
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-gray-900 font-medium rounded-[2rem] py-4 px-6 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 transition-colors duration-300 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  {showResetForm ? 'Sending...' : 'Signing in...'}
                </>
              ) : showResetForm ? (
                'Send Reset Link'
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/30"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-transparent text-sm text-gray-300">Or continue with</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-transparent border border-gray-400/50 text-white rounded-[2rem] py-4 px-6 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20 transition-colors duration-300"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="mt-6 text-center">
            {showResetForm ? (
              <button
                onClick={() => {
                  setShowResetForm(false);
                  setError({ ...error, message: '' });
                }}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Back to sign in
              </button>
            ) : (
              <p className="text-sm text-gray-300">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="text-white font-medium hover:underline focus:outline-none"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
