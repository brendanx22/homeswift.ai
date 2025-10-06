import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Check, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function WaitlistPage() {
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email) {
      setError('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          name: formData.name.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to join waitlist');

      setIsSuccess(true);
      setFormData({ email: '', name: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative flex min-h-screen">
        {/* Form Section - Full width on mobile, half on larger screens */}
        <div className="w-full lg:w-1/2 flex flex-col justify-start pt-8 sm:pt-12 px-4 sm:px-6 lg:px-12 xl:px-24 mx-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Logo and Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <div className="mb-4 sm:mb-6 text-center">
                <Link to="/" className="inline-block">
                  <img
                    className="h-40 w-auto mx-auto mb-2"
                    src="/images/logo.png"
                    alt="HomeSwift"
                  />
                </Link>
                <div className="py-4">
                  <h1 className="text-3xl font-light tracking-wider text-[#2C3E50]">
                    Join Our Waitlist
                  </h1>
                  <p className="mt-2 text-[#2C3E50]/80">
                    Be the first to know when we launch
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center">
                    <XCircle className="h-5 w-5 text-red-500 mr-3" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="rounded-xl bg-green-50 p-6 border border-green-100"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        You're on the list! 🎉
                      </h3>
                      <p className="mt-1 text-gray-600">
                        Thanks for joining our waitlist. We'll keep you updated with exclusive content and early access!
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            {!isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <form className="space-y-8" onSubmit={handleSubmit}>
                  {/* Email field */}
                  <div className="border-b border-gray-200 pb-1">
                    <label htmlFor="email" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-0 py-2 border-0 border-b border-[#2C3E50]/20 focus:border-[#FF6B35] focus:ring-0 focus:outline-none text-[#2C3E50] placeholder-[#2C3E50]/50 text-sm bg-transparent"
                      placeholder="Enter your email"
                    />
                  </div>

                  {/* Name field */}
                  <div className="border-b border-gray-200 pb-1">
                    <label htmlFor="name" className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Your Name <span className="text-gray-400 normal-case">(Optional)</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-0 py-2 border-0 border-b border-[#2C3E50]/20 focus:border-[#FF6B35] focus:ring-0 focus:outline-none text-[#2C3E50] placeholder-[#2C3E50]/50 text-sm bg-transparent"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Phone Number field */}
                  <div className="border-b border-[#2C3E50]/20 pb-1">
                    <label htmlFor="phone" className="block text-xs font-medium text-[#2C3E50]/80 uppercase tracking-wider mb-1">
                      Phone Number <span className="text-[#2C3E50]/50 normal-case">(Optional)</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-0 py-2 border-0 border-b border-[#2C3E50]/20 focus:border-[#FF6B35] focus:ring-0 focus:outline-none text-[#2C3E50] placeholder-[#2C3E50]/50 text-sm bg-transparent"
                      placeholder="(123) 456-7890"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3.5 text-sm tracking-wider font-medium text-white uppercase transition-all duration-300 mt-6 ${
                      isSubmitting 
                        ? 'bg-[#2C3E50]/50 cursor-not-allowed' 
                        : 'bg-[#2C3E50] hover:bg-[#1E2B38] shadow-md hover:shadow-lg'
                    }`}
                  >
                    {isSubmitting ? 'Processing...' : 'Join Waitlist'}
                  </button>

                  <div className="pt-4 text-center">
                    <p className="text-xs text-[#2C3E50]/70">
                      Already have an account?{' '}
                      <Link to="/login" className="font-medium text-[#FF6B35] hover:underline">
                        Sign In
                      </Link>
                    </p>
                  </div>
                  
                  {/* Back to Home Button */}
                  <div className="mt-8 text-center">
                    <Link
                      to="/"
                      className="inline-flex items-center text-[#2C3E50] hover:text-[#1A2C38] transition-colors duration-200"
                    >
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="hidden lg:block absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#2C3E50]/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>
      </div>
    </div>
  );
}
