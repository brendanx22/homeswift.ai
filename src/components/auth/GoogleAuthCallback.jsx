import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens, getUserInfo, storeUserSession } from '../../lib/googleAuth';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        console.log('Processing OAuth callback...');
        console.log('Authorization code:', code);
        console.log('State parameter:', state);
        setStatus('exchanging_tokens');

        // Exchange code for tokens (server handles both token exchange and user info)
        const authData = await exchangeCodeForTokens(code, state);
        console.log('Auth data received successfully:', authData);

        // Server returns both tokens and user info
        const { tokens, user: userInfo } = authData;

        // Store session
        storeUserSession(userInfo, tokens);

        // Redirect immediately to main app (local or production)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          window.location.href = '/main';
        } else {
          window.location.href = 'https://chat-homeswift-ai.vercel.app/main';
        }

      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.message);
        setStatus('error');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Processing authentication...';
      case 'exchanging_tokens':
        return 'Exchanging authorization code...';
      case 'getting_user_info':
        return 'Getting user information...';
      case 'success':
        return 'Authentication successful! Redirecting...';
      case 'error':
        return 'Authentication failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {status === 'error' ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Authentication Failed</h2>
                <p className="mt-2 text-sm text-red-600">{error}</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Home
                </button>
              </>
            ) : status === 'success' ? (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Success!</h2>
                <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <h2 className="mt-4 text-lg font-medium text-gray-900">Authenticating</h2>
                <p className="mt-2 text-sm text-gray-600">{getStatusMessage()}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthCallback;
