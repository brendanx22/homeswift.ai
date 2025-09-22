import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailStatus, setEmailStatus] = useState(''); // '', 'checking', 'available', 'taken'
  const navigate = useNavigate();
  const { signUp, isAuthenticated, loading: authLoading, checkEmailExists } = useAuth();
  const emailCheckTimeoutRef = useRef(null);

  // Log auth state for debugging
  useEffect(() => {
    console.log('Auth state changed:', { isAuthenticated, authLoading });
    
    if (!authLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting to app');
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Check if user is already authenticated
      if (isAuthenticated) {
        setError('You are already logged in. Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/app');
        }, 1500);
        return;
      }

      console.log('Registration attempt with:', { 
        email: formData.email, 
        name: `${formData.firstName} ${formData.lastName}`
      });

      // Use the signUp function from AuthContext
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };
      
      // Register the user
      const user = await signUp({
        ...userData,
        email: formData.email,
        password: formData.password
      });

      console.log('User registered successfully:', user);
      
      // Check if user is already verified (for development/testing)
      if (user?.email_confirmed_at) {
        setSuccess(`Registration successful! Your email is already verified. Redirecting to dashboard...`);
        setTimeout(() => {
          navigate('/app');
        }, 1500);
      } else {
        // Show success message
        setSuccess(`Registration successful! Please check your email (${formData.email}) to verify your account.`);
        
        // Redirect to email verification page immediately
        navigate('/verify-email', { 
          state: { 
            email: formData.email,
            message: 'Registration successful! Please check your email to verify your account.',
            status: 'pending'
          } 
        });
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    setError('Google Sign-Up is temporarily disabled. Please use email registration.');
  };

  const checkEmailAvailability = async (email) => {
    if (!email || !email.includes('@')) return;
    
    setEmailStatus('checking');
    try {
      const result = await checkEmailExists(email);
      setEmailStatus(result.exists ? 'taken' : 'available');
    } catch (error) {
      console.error('Email check error:', error);
      setEmailStatus('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check email availability when email field changes
    if (name === 'email') {
      // Clear existing timeout
      if (emailCheckTimeoutRef.current) {
        clearTimeout(emailCheckTimeoutRef.current);
      }

      if (value && value.includes('@')) {
        // Debounce the email check
        emailCheckTimeoutRef.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500);
      } else {
        setEmailStatus('');
      }
    }
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


      
      <div className="w-full max-w-sm relative z-10">

        {/* Signup Form */}
        <div className="bg-transparent border border-gray-400/50 rounded-[2rem] px-8 py-12 min-h-[560px] md:min-h-[640px]">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-gray-300 text-sm">Join HomeSwift and find your dream home</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-4 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                  placeholder="Enter your email"
                  required
                />
                {/* Email status indicator */}
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                  {emailStatus === 'checking' && (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {emailStatus === 'available' && (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {emailStatus === 'taken' && (
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              {/* Email status message */}
              {emailStatus === 'available' && (
                <p className="mt-1 text-sm text-green-400">✓ Email is available</p>
              )}
              {emailStatus === 'taken' && (
                <p className="mt-1 text-sm text-red-400">✗ This email is already registered</p>
              )}
              {emailStatus === 'checking' && (
                <p className="mt-1 text-sm text-gray-400">Checking email availability...</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                  placeholder="Create a password"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-gray-400/50 rounded-[2rem] pl-12 pr-12 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-300 focus:bg-white/5 transition-all"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-transparent border-gray-400 rounded focus:ring-blue-500 focus:ring-2 mt-1"
                required
              />
              <label className="ml-2 text-gray-300 text-sm">
                I agree to the{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-4 rounded-[2rem] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-400/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
            </div>
          </div>

          {/* Google Signup */}
          <button
            onClick={handleGoogleSignup}
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

          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
