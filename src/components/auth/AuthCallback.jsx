import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useGoogleAuth } from '../../lib/googleAuth';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const googleAuth = useGoogleAuth();
  const [message, setMessage] = useState('Finalizing sign-in...');

  useEffect(() => {
    let isMounted = true;

    const finalize = async () => {
      try {
        // Check if this is a Google OAuth callback
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        const redirect = searchParams.get('redirect') || '/auth/callback';

        if (access_token && refresh_token) {
          setMessage('Setting up your session...');

          // Use the Google auth utility to handle the callback
          const result = await googleAuth.handleCallback(searchParams);

          if (result.success) {
            setMessage('Redirecting you...');
            // Clean URL and redirect
            window.history.replaceState({}, document.title, '/auth/callback');
            if (!isMounted) return;
            navigate(result.redirectTo, { replace: true });
            return;
          }
        }

        // Handle other OAuth flows or direct Supabase auth
        const hasCode = window.location.search.includes('code=');
        const hasFragToken = window.location.hash.includes('access_token=');
        if (hasCode || hasFragToken) {
          setMessage('Completing authentication...');
          try {
            const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
            if (error) throw error;
          } catch (e) {
            // Some providers send hash token; ignore if exchange not applicable
          }
          // Clean URL
          window.history.replaceState({}, document.title, '/auth/callback');
          if (!isMounted) return;
          navigate('/', { replace: true });
          return;
        }

        // Nothing to process, go home
        navigate('/', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        if (!isMounted) return;
        setMessage(err.message || 'Failed to complete sign-in');
        // Give the user a way forward
        setTimeout(() => navigate('/login', { replace: true }), 1500);
      }
    };

    finalize();
    return () => { isMounted = false; };
  }, [navigate, searchParams, googleAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="text-gray-200 text-sm">{message}</p>
      </div>
    </div>
  );
}
