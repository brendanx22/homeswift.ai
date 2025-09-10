import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, ArrowLeft, Loader2, ArrowRight } from 'lucide-react';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [status, setStatus] = useState(location.state?.status || 'pending');
  const [message, setMessage] = useState(location.state?.message || '');
  const [resendLoading, setResendLoading] = useState(false);
  const [email, setEmail] = useState(location.state?.email || '');
  const token = searchParams.get('token');

  // Check if we have a verification token in the URL
  useEffect(() => {
    if (token) {
      setStatus('verifying');
      verifyEmail(token);
    } else if (status === 'pending' && !email) {
      setStatus('unverified');
      setMessage('No verification token found. Please check your email for the verification link.');
    }
  }, [token]);

  const handleBackToHome = () => navigate('/');
  const handleGoToLogin = () => navigate('/login');

  const handleResendVerification = async () => {
    setResendLoading(true);
    
    try {
      let emailToUse = email;
      
      // If no email in state, try to get it from the current user or prompt
      if (!emailToUse) {
        if (currentUser?.email) {
          emailToUse = currentUser.email;
        } else {
          emailToUse = prompt('Please enter your email address:');
          if (!emailToUse) {
            setResendLoading(false);
            return;
          }
        }
      }

      const response = await api.post('/auth/resend-verification', { email: emailToUse });
      
      if (response.data.success) {
        setEmail(emailToUse);
        setStatus('pending');
        setMessage(`A new verification link has been sent to ${emailToUse}. Please check your inbox.`);
      } else {
        throw new Error(response.data.error || 'Failed to resend verification email');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setStatus('error');
      setMessage(error.response?.data?.error || error.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await api.get(`/auth/verify-email?token=${verificationToken}`);
      if (response.data.success) {
        setStatus('success');
        setMessage('Your email has been verified successfully! Redirecting to the main page...');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
          navigate('/main', { replace: true });
        }, 2000);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage(error.response?.data?.message || 'Failed to verify email. The link may have expired or is invalid.');
    }
  };

  // Handle the case when user is redirected after signup
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setStatus('pending');
      setMessage(`We've sent a verification link to ${location.state.email}. Please check your email to verify your account.`);
    }
  }, [location.state]);

  // Render different states
  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="h-5 w-5 text-white animate-spin" />
            <span className="text-white">Verifying your email...</span>
          </div>
        );
      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Email Verified!</h3>
            <p className="text-gray-300 mb-6">You can now log in to your account.</p>
            <button
              onClick={handleGoToLogin}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
            >
              Continue to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            
            <div className="mt-6 pt-4 border-t border-gray-700 text-center">
              <button
                onClick={handleBackToHome}
                className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center mx-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Home
              </button>
            </div>
          </div>
        );
      case 'error':
      case 'unverified':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Verification Failed</h3>
            <p className="text-gray-300 mb-6">{message}</p>
            <div className="space-y-3">
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </button>
              <button
                onClick={handleBackToHome}
                className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200"
              >
                Back to Home
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Error or unverified state
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(\"/Hero Section Image.png\")',
        backgroundSize: 'cover',
        backgroundColor: '#1a1a1a',
        backgroundPosition: 'center',
        position: 'relative'
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
        {/* Verification Card */}
        <div className="bg-transparent border border-gray-400/50 rounded-[2rem] p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {status === 'verifying' ? 'Verifying...' : 
               status === 'success' ? 'Email Verified!' : 
               'Verify Your Email'}
            </h1>
            <p className="text-gray-300">
              {status === 'verifying' ? 'Please wait while we verify your email' : 
               status === 'success' ? 'Your email has been verified successfully' : 
               'Check your email for the verification link'}
            </p>
          </div>
          
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
