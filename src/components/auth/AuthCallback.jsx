import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Finalizing sign-in...');

  useEffect(() => {
    let isMounted = true;

    const finalize = async () => {
      try {
        // 1) If we received tokens from main domain login, set session directly
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');
        let redirect = searchParams.get('redirect') || '/';

        // Only allow relative redirect paths for safety
        try {
          if (/^https?:\/\//i.test(redirect)) {
            const u = new URL(redirect);
            // only permit chat.homeswift.co absolute redirects
            if (u.hostname === 'chat.homeswift.co') {
              redirect = u.pathname + (u.search || '');
            } else {
              redirect = '/';
            }
          }
        } catch {}

        if (access_token && refresh_token) {
          setMessage('Signing you in...');
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (error) throw error;

          // Clean URL
          window.history.replaceState({}, document.title, '/auth/callback');
          if (!isMounted) return;
          navigate(redirect, { replace: true });
          return;
        }

        // 2) Handle OAuth PKCE flows (if ever used)
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

        // 3) Nothing to process, go home
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
  }, [navigate, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        <p className="text-gray-200 text-sm">{message}</p>
      </div>
    </div>
  );
}
