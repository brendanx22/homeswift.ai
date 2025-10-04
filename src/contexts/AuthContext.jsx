import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Create auth context
const AuthContext = createContext(undefined);

// Helper: debug logging only in development
const debug = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('[AuthContext]', ...args);
  }
};

// Small helper to guard long network waits
const withTimeout = (promise, ms = 8000) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckComplete, setInitialCheckComplete] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile without blocking auth gating
  const fetchAndMergeUserProfile = useCallback(async (supabaseUser) => {
    if (!supabaseUser?.id) return;
    try {
      // Try to fetch existing profile (timeout guarded)
      let { data: userData } = await withTimeout(
        supabase.from('user_profiles').select('*').eq('id', supabaseUser.id).single(),
        6000,
      ).catch(() => ({ data: null }));

      if (!userData) {
        // Attempt RPC creation first (timeout guarded)
        const { data: newProfile } = await withTimeout(
          supabase.rpc('create_user_profile', {
            user_id: supabaseUser.id,
            user_email: supabaseUser.email,
            first_name: supabaseUser.user_metadata?.first_name || '',
            last_name: supabaseUser.user_metadata?.last_name || '',
          }),
          6000,
        ).catch(() => ({ data: null }));

        if (newProfile) {
          userData = newProfile;
        } else {
          // Fallback to direct insert (timeout guarded)
          const { data: directProfile } = await withTimeout(
            supabase
              .from('user_profiles')
              .insert({
                id: supabaseUser.id,
                email: supabaseUser.email,
                first_name: supabaseUser.user_metadata?.first_name || '',
                last_name: supabaseUser.user_metadata?.last_name || '',
              })
              .select()
              .single(),
            6000,
          ).catch(() => ({ data: null }));

          if (directProfile) userData = directProfile;
        }
      }

      // Merge into user state if we have any profile data
      if (userData) {
        setUser((prev) => ({ ...prev, ...userData }));
      }
    } catch (e) {
      // Non-fatal: log but don't break auth
      console.warn('[AuthProvider] fetchAndMergeUserProfile warning:', e?.message || e);
    }
  }, []);

  // Check active session and set the user
  const checkSession = useCallback(async () => {
    debug('checkSession: Starting session check');
    let currentSession = null;

    try {
      setLoading(true);

      // First check if there's a session in localStorage
      const storedSession = localStorage.getItem('homeswift-auth-token');
      if (storedSession) {
        try {
          debug('Found stored session in localStorage');
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.currentSession) {
            debug('Valid session found in localStorage');
            currentSession = parsedSession.currentSession;
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            // Don't return here; we'll still verify with Supabase
          }
        } catch (e) {
          debug('Error parsing stored session:', e);
          localStorage.removeItem('homeswift-auth-token');
        }
      }

      // Always verify with Supabase, but don't block on it
      try {
        debug('Checking session with Supabase...');
        const { data: { session: supabaseSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          debug('Error getting session from Supabase:', sessionError);
          throw sessionError;
        }

        if (supabaseSession) {
          debug('Valid session from Supabase');
          currentSession = supabaseSession;
          setSession(currentSession);
          setUser(currentSession.user ?? null);

          // Update localStorage with fresh session
          try {
            localStorage.setItem('homeswift-auth-token', JSON.stringify({ currentSession: supabaseSession }));
          } catch (e) {
            debug('Failed to write session to localStorage', e);
          }
        } else if (currentSession) {
          // We had a session in localStorage but not in Supabase - clear it
          debug('Session in localStorage but not in Supabase, clearing');
          setSession(null);
          setUser(null);
          localStorage.removeItem('homeswift-auth-token');
          currentSession = null;
        }
      } catch (err) {
        console.error('Error verifying session with Supabase:', err);
        // Don't throw — continue with the session we have (if any)
      }

      // Fetch user profile in background if we have a session
      if (currentSession?.user) {
        debug('Fetching user profile in background');
        fetchAndMergeUserProfile(currentSession.user).catch((e) => {
          console.error('Error fetching user profile:', e);
        });
      }

      debug('Session check complete', { hasSession: !!currentSession });
      return currentSession;
    } catch (error) {
      console.error('Error in checkSession:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
      setInitialCheckComplete(true);
    }
  }, [fetchAndMergeUserProfile]);

  // Redirect helper used on sign-in / auth change
  const redirectAfterLogin = useCallback((sess) => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      const userType = sess?.user?.user_metadata?.user_type || sess?.user?.app_metadata?.user_type || 'renter';
      const defaultAfterLogin = userType === 'landlord' ? 'https://list.homeswift.co/dashboard' : 'https://chat.homeswift.co/';
      let target = redirectTo || defaultAfterLogin;

      const authPages = ['/login', '/signup', '/verify-email', '/reset-password', '/list-login', '/list-signup'];
      const isAbsolute = /^https?:\/\//i.test(target);

      if (isAbsolute) {
        window.location.assign(target);
      } else if (!authPages.some((page) => target.includes(page))) {
        navigate(target);
      } else {
        window.location.assign(defaultAfterLogin);
      }
    } catch (e) {
      console.warn('redirectAfterLogin failed:', e);
    }
  }, [navigate]);

  // Single useEffect to initialize auth, listen to auth changes, and sync storage
  useEffect(() => {
    let mounted = true;
    let subscription = null;

    const handleStorageChange = (e) => {
      if (!mounted) return;
      if (e.key === 'homeswift-auth-token') {
        debug('Storage event detected, updating session from storage');
        if (e.newValue) {
          try {
            const parsedSession = JSON.parse(e.newValue);
            if (parsedSession.currentSession) {
              setSession(parsedSession.currentSession);
              setUser(parsedSession.currentSession?.user ?? null);
            }
          } catch (err) {
            console.error('Error parsing stored session on storage event:', err);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
    };

    const initialize = async () => {
      debug('Initializing auth...');
      try {
        await checkSession();

        const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          if (!mounted) return;

          debug('Auth state changed:', event);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            debug('User signed in / session refreshed');
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession) {
              try {
                localStorage.setItem('homeswift-auth-token', JSON.stringify({ currentSession: newSession }));
              } catch (e) {
                debug('Failed to write session to localStorage on auth change', e);
              }

              if (newSession.user) {
                // Fetch user profile in background
                fetchAndMergeUserProfile(newSession.user).catch(console.error);
              }

              // Only redirect if we are on an auth page
              const authPages = ['/login', '/signup', '/verify-email', '/landlord-login', '/landlord-signup', '/list-login', '/list-signup'];
              if (authPages.includes(window.location.pathname)) {
                redirectAfterLogin(newSession);
              }
            }
          } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
            debug('User signed out');
            setSession(null);
            setUser(null);
            try { localStorage.removeItem('homeswift-auth-token'); } catch (e) { debug('LocalStorage remove failed', e); }
          }
        });

        subscription = data?.subscription;

        window.addEventListener('storage', handleStorageChange);
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
        setLoading(false);
        setInitialCheckComplete(true);
      }
    };

    initialize();

    return () => {
      mounted = false;
      try { subscription?.unsubscribe(); } catch (e) { debug('Subscription cleanup error', e); }
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkSession, fetchAndMergeUserProfile, redirectAfterLogin]);

  // Check if email already exists
  const checkEmailExists = useCallback(async (email, options = {}) => {
    const sanitizedEmail = (email || '').trim().toLowerCase();

    if (!sanitizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
      return { exists: false, message: 'Invalid email format', error: true };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sanitizedEmail }),
        signal: controller.signal,
        ...options,
      }).finally(() => clearTimeout(timeoutId));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      return {
        exists: !!data.exists,
        message: data.message || (data.exists ? 'Email is already registered' : 'Email is available'),
        code: data.code,
        success: true,
      };
    } catch (err) {
      console.error('Check email exists error:', err);
      if (err.name === 'AbortError') {
        return { exists: false, message: 'Request timed out', error: true, code: 'TIMEOUT' };
      }
      return { exists: false, message: err.message || 'Failed to check email availability', error: true, code: 'CHECK_ERROR' };
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const email = (userData.email || '').trim().toLowerCase();
      const password = (userData.password || '').trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) throw new Error('Please enter a valid email address');

      const isProd = typeof window !== 'undefined' && window.location.hostname.endsWith('homeswift.co');
      const verifyRedirect = isProd ? 'https://chat.homeswift.co/verify-email' : `${window.location.origin}/verify-email`;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
            user_type: userData.userType || 'renter',
          },
          emailRedirectTo: verifyRedirect,
        },
      });

      if (signUpError) {
        if (String(signUpError.message).includes('already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        throw signUpError;
      }

      return data?.user ?? null;
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Sign up failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const attemptSignIn = async (timeoutMs) => {
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Network timeout while contacting Auth service')), timeoutMs));
        return Promise.race([
          supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: password.trim() }),
          timeoutPromise,
        ]);
      };

      let data, signInError;
      try {
        ({ data, error: signInError } = await attemptSignIn(10000));
      } catch (err) {
        console.warn('[AuthProvider.signIn] first attempt failed:', err?.message || err);
        if (String(err?.message || '').includes('Network timeout')) {
          const supaUrl = import.meta.env.VITE_SUPABASE_URL;
          try {
            const ping = await Promise.race([
              fetch(`${supaUrl}/auth/v1/settings`, { method: 'GET' }),
              new Promise((_, reject) => setTimeout(() => reject(new Error('Ping timeout')), 4000)),
            ]);
            console.log('[AuthProvider.signIn] auth settings ping status=', ping?.status);
          } catch (e) {
            console.warn('[AuthProvider.signIn] auth settings ping failed:', e?.message || e);
          }
          ({ data, error: signInError } = await attemptSignIn(20000));
        } else {
          throw err;
        }
      }

      if (signInError) {
        if (String(signInError.message).includes('Invalid login credentials')) throw new Error('Invalid email or password');
        if (String(signInError.message).includes('Email not confirmed')) throw new Error('Please verify your email before logging in');
        throw signInError;
      }

      // Force a session refresh to ensure we have the latest data
      const { data: { session: freshSession } = {} } = await supabase.auth.getSession();
      setSession(freshSession ?? data?.session ?? null);
      setUser((freshSession ?? data?.session)?.user ?? null);

      // Redirect after login
      redirectAfterLogin(freshSession ?? data?.session ?? null);

      return (data?.user) || (freshSession?.user) || null;
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.message || 'An error occurred during sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [redirectAfterLogin]);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut().catch((err) => debug('Supabase signOut warning:', err?.message || err));
    } finally {
      try { localStorage.removeItem('homeswift-auth-token'); } catch (e) { debug('remove localstorage failed', e); }
      setUser(null);
      setSession(null);
      navigate('/login');
      setLoading(false);
    }
  }, [navigate]);

  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      const isProd = typeof window !== 'undefined' && window.location.hostname.endsWith('homeswift.co');
      const resetRedirect = isProd ? 'https://chat.homeswift.co/reset-password' : `${window.location.origin}/reset-password`;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: resetRedirect });
      if (err) throw err;
      return true;
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Resend email verification
  const resendVerification = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: (typeof window !== 'undefined' && window.location.hostname.endsWith('homeswift.co'))
            ? 'https://chat.homeswift.co/verify-email'
            : `${window.location.origin}/verify-email`,
        },
      });
      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Resend verification error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    if (!user?.id) throw new Error('No active user to update');
    try {
      setLoading(true);
      setError(null);

      // Update auth user data
      const { data: authData, error: authError } = await supabase.auth.updateUser({ data: { ...updates } });
      if (authError) throw authError;

      // Update user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (profileError) throw profileError;

      // Update local user state
      setUser((prev) => ({ ...prev, ...updates }));

      return authData?.user ?? null;
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Role helpers
  const isLandlord = useCallback(() => {
    return user?.user_metadata?.user_type === 'landlord' || user?.app_metadata?.user_type === 'landlord';
  }, [user]);

  const isRenter = useCallback(() => !isLandlord(), [isLandlord]);

  const getUserType = useCallback(() => user?.user_metadata?.user_type || user?.app_metadata?.user_type || 'renter', [user]);

  // Memoize context value to avoid unnecessary re-renders
  const value = useMemo(() => ({
    user,
    session,
    loading,
    error,
    initialCheckComplete,
    isAuthenticated: !!session?.user,
    isLandlord,
    isRenter,
    getUserType,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerification,
    checkEmailExists,
    updateProfile,
    checkSession,
  }), [user, session, loading, error, initialCheckComplete, isLandlord, isRenter, getUserType, signUp, signIn, signOut, resetPassword, resendVerification, checkEmailExists, updateProfile, checkSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export { AuthContext };
