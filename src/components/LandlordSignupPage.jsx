import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Building, CheckCircle, Users, User, Mail, Lock } from 'lucide-react';
import { useGoogleAuth } from "/src/lib/googleAuth";
import { useAuth } from '../contexts/AuthContext';

const LandlordSignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    userType: 'landlord'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const { signUp } = useAuth();
  const googleAuth = useGoogleAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await signUp({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'landlord'
      });

      // Redirect to dashboard after successful signup
      navigate('/dashboard');

    } catch (error) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        setErrors({ email: 'An account with this email already exists' });
      } else {
        setErrors({ general: 'Signup failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setErrors({});

    try {
      await googleAuth.signInWithGoogle({
        redirectTo: window.location.origin,
        userType: 'landlord'
      });
      // The redirect will happen automatically via Supabase OAuth
    } catch (error) {
      console.error('Google signup error:', error);
      setErrors({
        general: error.message || 'Google sign-up failed. Please try again.'
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >

        {/* Signup Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-sm border border-[#2C3E50]/20 rounded-[2rem] px-8 py-12 min-h-[560px] md:min-h-[640px] shadow-xl"
        >
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
              Landlord Signup
            </h1>
            <p className="text-[#2C3E50]/80">
              Create your landlord account to manage properties
            </p>
          </div>
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-4 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                    placeholder="First name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-4 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                    placeholder="Last name"
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] pl-12 pr-4 py-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full bg-white/50 border border-[#2C3E50]/30 rounded-[2rem] px-4 py-3 pl-4 pr-4 text-[#2C3E50] placeholder-[#2C3E50]/60 focus:outline-none focus:border-[#FF6B35] focus:bg-white/80 transition-all"
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Confirm Password */}
            <div>
              <label className="block text-[#2C3E50] text-sm font-medium mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#FF6B35] text-white py-4 px-6 rounded-[2rem] font-semibold text-lg hover:bg-[#e85e2f] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="w-full flex items-center justify-center space-x-3 bg-transparent border border-gray-400/50 text-[#2C3E50] py-4 rounded-[2rem] font-medium hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                'Create Landlord Account'
              )}
            </motion.button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have a landlord account?{' '}
              <Link
                to="/list-login"
                className="text-orange-600 hover:text-orange-700 font-semibold"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Looking for renter signup?{' '}
            <button 
              onClick={() => navigate('/user-type')} 
              className="text-blue-400 hover:text-blue-300 transition-colors underline"
            >
              Switch to Renter Signup
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LandlordSignupPage;
