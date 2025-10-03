import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Users } from 'lucide-react';
import { useGoogleAuth } from '../../lib/googleAuth';
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
  const [emailStatus, setEmailStatus] = useState(''); // '', 'checking', 'available', 'taken', 'error'
  const [emailCheckError, setEmailCheckError] = useState('');
  const navigate = useNavigate();
  const googleAuth = useGoogleAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signUp, isAuthenticated, loading: authLoading, checkEmailExists } = useAuth();
  const emailCheckTimeoutRef = useRef(null);
  const emailAbortRef = useRef(null);
  const lastRequestedEmailRef = useRef('');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test((formData.email || '').trim());
  const passwordsMatch = formData.password && formData.confirmPassword && (formData.password === formData.confirmPassword);
  const hasNames = Boolean(formData.firstName && formData.lastName);
  const isEmailAvailable = emailStatus === 'available';
  const canSubmit = hasNames && isEmailValid && isEmailAvailable && passwordsMatch;

  // Dynamic email border color based on validity and availability
  const emailBorder = !formData.email
    ? 'border-gray-400/50 focus:border-gray-300'
    : (!isEmailValid
        ? 'border-red-500 focus:border-red-400'
        : (emailStatus === 'taken'
            ? 'border-red-500 focus:border-red-400'
            : (emailStatus === 'available'
                ? 'border-green-500 focus:border-green-400'
                : 'border-gray-400/50 focus:border-gray-300')));

  // Cleanup any in-flight email check requests and timers on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeoutRef.current) {
        try { clearTimeout(emailCheckTimeoutRef.current); } catch {}
      }
      if (emailAbortRef.current) {
        try { emailAbortRef.current.abort(); } catch {}
      }
    };
  }, []);

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

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      await googleAuth.signInWithGoogle({
        redirectTo: window.location.origin,
        userType: 'renter'
      });
      // The redirect will happen automatically via Supabase OAuth
    } catch (error) {
      console.error('Google signup error:', error);
      setError(error.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleEmailBlur = () => {
    const value = (formData.email || '').trim();
    if (!value) {
      setEmailStatus('');
      return;
    }
    if (emailRegex.test(value)) {
      if (emailStatus !== 'available' && emailStatus !== 'taken') {
        checkEmailAvailability(value);
      }
    } else {
      setEmailStatus('');
    }
  };

  const checkEmailAvailability = async (email) => {
    const sanitized = (email || '').trim().toLowerCase();
    
    // Clear previous state
    setEmailCheckError('');
    
    // Validate email format
    if (!emailRegex.test(sanitized)) {
      setEmailStatus('');
      return;
    }
    
    // Cancel any in-flight request
    if (emailAbortRef.current) {
      try { emailAbortRef.current.abort(); } catch {}
    }
    
    // Set up new request
    const controller = new AbortController();
    emailAbortRef.current = controller;
    lastRequestedEmailRef.current = sanitized;
    
    // Show checking status
    setEmailStatus('checking');
    
    try {
      console.log('Starting email check for:', sanitized);
      const result = await checkEmailExists(sanitized, { signal: controller.signal });
      console.log('Email check result:', result);
      // Defensive: log the type and keys of result
      if (!result || typeof result !== 'object') {
        console.error('Email check: result is not an object:', result);
        setEmailStatus('error');
        setEmailCheckError('Unexpected response from server');
        return;
      }
      // Check if this response is for the current email
      const currentEmail = (formData.email || '').trim().toLowerCase();
      if (currentEmail !== sanitized) {
        console.log('Stale response, ignoring');
        return;
      }
      
      if (result.error) {
        setEmailStatus('error');
        setEmailCheckError(result.message || 'Unable to verify email availability');
      } else if (typeof result.exists === 'boolean') {
        setEmailStatus(result.exists ? 'taken' : 'available');
        if (result.message && !result.exists) {
          setEmailCheckError('');
        }
      } else {
        // Defensive: handle unexpected structure
        setEmailStatus('error');
        setEmailCheckError('Malformed response from server');
        console.error('Email check: malformed response:', result);
      }
    } catch (error) {
      // Ignore aborted requests
      if (error.name === 'AbortError') {
        console.log('Email check aborted');
        return;
      }
      
      console.error('Email check error:', error);
      // Only update state if this was for the current email
      const currentEmail = (formData.email || '').trim().toLowerCase();
      if (currentEmail === sanitized) {
        setEmailStatus('error');
        setEmailCheckError(
          error.message || 'We could not verify your email right now. Please try again.'
        );
      }
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

      if (value && emailRegex.test(value.trim())) {
        // Debounce the email check
        emailCheckTimeoutRef.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 500);
      } else {
        setEmailStatus('');
        if (emailAbortRef.current) {
          try { emailAbortRef.current.abort(); } catch {}
        }
      }
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div 
      className="min-h-screen flex justify-center items-start pt-24 sm:pt-32 md:pt-40 pb-24 sm:pb-32 md:pb-40 px-6 bg-cover bg-center bg-no-repeat relative w-full"
    
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

        {/* Signup Form */}
        <div className="bg-white/90 backdrop-blur-sm border border-[#2C3E50]/20 rounded-[2rem] px-10 py-12 min-h-[560px] md:min-h-[640px] shadow-xl w-full">
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
              Renter Signup
            </h1>
            <p className="text-[#2C3E50]/80">
              Create your account to start browsing properties
            </p>
          </div>

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
                    autoComplete="given-name"
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
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-4 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Enter email address"
                  required
                />
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
                </div>
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
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-12 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Create password"
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

            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-12 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Confirm password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#FF6B35] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-[2rem] font-semibold text-lg hover:bg-[#e85e2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>

            {/* Disabled reasons for clarity */}
            {(!canSubmit && !loading) && (
              <div className="mt-2 text-xs text-gray-400">
                <ul className="list-disc pl-5 space-y-1">
                  {!hasNames && <li>Enter your first and last name</li>}
                  {formData.email && !isEmailValid && <li>Enter a valid email address</li>}
                  {isEmailValid && emailStatus === '' && <li>Validate your email availability</li>}
                  {emailStatus === 'error' && <li className="text-yellow-400">Email availability service is temporarily unavailable</li>}
                  {emailStatus === 'checking' && <li>Checking email availability...</li>}
                  {emailStatus === 'taken' && <li className="text-red-400">This email is already registered</li>}
                  {!passwordsMatch && <li>Passwords must match</li>}
                </ul>
              </div>
            )}
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

          <div className="mt-4 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-gray-400">
              Need landlord tools?{' '}
              <button 
                onClick={() => navigate('/user-type')} 
                className="text-blue-400 hover:text-blue-300 transition-colors underline"
              >
                Switch to Landlord Signup
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
