import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

// Create auth context
const AuthContext = createContext(undefined);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check active session and set the user
  const checkSession = useCallback(async () => {
    console.log('[AuthProvider] checkSession: start');
    try {
      setLoading(true);
      
      // First check if there's a session in localStorage
      const storedSession = localStorage.getItem('homeswift-auth-token');
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          if (parsedSession.currentSession) {
            setSession(parsedSession.currentSession);
            setUser(parsedSession.currentSession?.user ?? null);
            return parsedSession.currentSession;
          }
        } catch (e) {
          console.log('No valid stored session found');
        }
      }
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Fetch additional user data if needed
        let { data: userData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();
          
        // If no profile exists, try to create one using the secure function
        if (!userData && !profileError) {
          console.log('No user profile found, creating one...');
          
          // Try to create profile using RPC function
          const { data: newProfile, error: rpcError } = await supabase
            .rpc('create_user_profile', {
              user_id: currentSession.user.id,
              user_email: currentSession.user.email,
              first_name: currentSession.user.user_metadata?.first_name || '',
              last_name: currentSession.user.user_metadata?.last_name || ''
            });
            
          if (rpcError) {
            console.warn('RPC profile creation failed, trying direct insert:', rpcError);
            
            // Fallback: try direct insert
            const { data: directProfile, error: directError } = await supabase
              .from('user_profiles')
              .insert({
                id: currentSession.user.id,
                email: currentSession.user.email,
                first_name: currentSession.user.user_metadata?.first_name || '',
                last_name: currentSession.user.user_metadata?.last_name || ''
              })
              .select()
              .single();
              
            if (directError) {
              console.warn('Direct profile creation also failed:', directError);
              // Continue without profile data - user can still use the app
            } else {
              userData = directProfile;
            }
          } else {
            userData = newProfile;
          }
        }
          
        setUser({
          ...currentSession.user,
          ...userData
        });
      }
      
      console.log('[AuthProvider] checkSession: done, user=', Boolean(currentSession?.user));
      return currentSession;
    } catch (error) {
      console.error('Error checking session:', error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle auth state changes
  useEffect(() => {
    // Check session on mount
    checkSession();
    
    // Listen for storage changes (cross-domain session sync)
    const handleStorageChange = (e) => {
      if (e.key === 'homeswift-auth-token') {
        if (e.newValue) {
          try {
            const parsedSession = JSON.parse(e.newValue);
            if (parsedSession.currentSession) {
              setSession(parsedSession.currentSession);
              setUser(parsedSession.currentSession?.user ?? null);
            }
          } catch (error) {
            console.log('Error parsing stored session:', error);
          }
        } else {
          setSession(null);
          setUser(null);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // Fetch additional user data if needed
          let { data: userData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          // If no profile exists, try to create one using the secure function
          if (!userData && !profileError) {
            console.log('No user profile found, creating one...');
            
            // Try to create profile using RPC function
            const { data: newProfile, error: rpcError } = await supabase
              .rpc('create_user_profile', {
                user_id: currentSession.user.id,
                user_email: currentSession.user.email,
                first_name: currentSession.user.user_metadata?.first_name || '',
                last_name: currentSession.user.user_metadata?.last_name || ''
              });
              
            if (rpcError) {
              console.warn('RPC profile creation failed, trying direct insert:', rpcError);
              
              // Fallback: try direct insert
              const { data: directProfile, error: directError } = await supabase
                .from('user_profiles')
                .insert({
                  id: currentSession.user.id,
                  email: currentSession.user.email,
                  first_name: currentSession.user.user_metadata?.first_name || '',
                  last_name: currentSession.user.user_metadata?.last_name || ''
                })
                .select()
                .single();
                
              if (directError) {
                console.warn('Direct profile creation also failed:', directError);
                // Continue without profile data - user can still use the app
              } else {
                userData = directProfile;
              }
            } else {
              userData = newProfile;
            }
          }
            
          setUser({
            ...currentSession.user,
            ...userData
          });
          
          // Only redirect if we're on an auth page and the user is now authenticated
          const authPages = ['/login', '/signup', '/verify-email'];
          if (authPages.includes(window.location.pathname)) {
            // Get redirect URL from query params
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');
            const isChat = window.location.hostname.startsWith('chat.');
            const isHomeswiftMain = window.location.hostname.endsWith('homeswift.co') && !isChat;
            const defaultAfterLogin = isHomeswiftMain ? 'https://chat.homeswift.co/' : '/';

            // Determine target
            let target = redirectTo || defaultAfterLogin;
            // If we are on main domain and target is main-domain /app (relative or absolute), override to chat homepage
            if (isHomeswiftMain && target === '/app') {
              target = 'https://chat.homeswift.co/';
            } else if (isHomeswiftMain && target && /^https?:\/\//i.test(target) && target.includes('homeswift.co/app')) {
              target = 'https://chat.homeswift.co/';
            }
            const isAbsolute = /^https?:\/\//i.test(target);

            // Avoid redirecting back to auth pages
            if (isAbsolute) {
              window.location.assign(target);
            } else if (!authPages.some(page => target.includes(page))) {
              navigate(target);
            } else {
              if (isHomeswiftMain) {
                window.location.assign('https://chat.homeswift.co/');
              } else {
                navigate('/');
              }
            }
          }
        } else {
          // Don't redirect if on root or public pages
          const publicPaths = ['/', '/login', '/signup', '/verify-email', '/reset-password'];
          const isPublicPath = publicPaths.some(path => 
            window.location.pathname.startsWith(path)
          );
          
          if (!isPublicPath) {
            // Always redirect to login with a redirect target appropriate to the current domain
            if (window.location.pathname !== '/login') {
              const host = window.location.hostname;
              const isHomeswiftMain = host.endsWith('homeswift.co') && !host.startsWith('chat.');
              const target = isHomeswiftMain ? 'https://chat.homeswift.co/' : window.location.href;
              navigate(`/login?redirect=${encodeURIComponent(target)}`);
            }
          }
        }
      }
    );
    
    return () => {
      subscription?.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkSession, navigate]);

  // Check if email already exists
  const checkEmailExists = useCallback(async (email) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to check email');
      }

      return data;
    } catch (error) {
      console.error('Check email exists error:', error);
      throw error;
    }
  }, []);

  // Sign up with email and password
  const signUp = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Remove the redundant email check - Supabase will handle duplicate email validation
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            full_name: `${userData.firstName} ${userData.lastName}`,
          },
          emailRedirectTo: window.location.hostname.startsWith('chat.') 
            ? 'https://chat.homeswift.co/verify-email'
            : `${window.location.origin}/verify-email`,
        },
      });
      
      console.log('Signup response:', { data, error: signUpError });
      
      if (signUpError) {
        // Handle specific error cases
        if (signUpError.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        throw signUpError;
      }
      
      console.log('User account created successfully. Please check your email to verify your account.');
      return data.user;
    } catch (error) {
      console.error('Sign up error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Sign in with email and password
  const signIn = useCallback(async (email, password) => {
    try {
      console.log('[AuthProvider.signIn] start', { email });
      setLoading(true);
      setError(null);
      
      // Proceed to sign in directly with a timeout guard
      console.log('[AuthProvider.signIn] calling signInWithPassword');
      const timeoutMs = 12000;
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout while contacting Auth service')), timeoutMs)
      );
      const { data, error: signInError } = await Promise.race([
        supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
        timeoutPromise,
      ]);
      console.log('[AuthProvider.signIn] signInWithPassword result', { hasError: !!signInError, user: !!data?.user });
      
      if (signInError) {
        // Handle specific error cases
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        if (signInError.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email before logging in');
        }
        throw signInError;
      }
      
      // Force a session refresh to ensure we have the latest data
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      console.log('[AuthProvider.signIn] getSession', { hasSession: !!freshSession });
      setSession(freshSession);
      setUser(freshSession?.user ?? null);
      
      // Get redirect URL from query params or default based on domain
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect');
      const isChat = window.location.hostname.startsWith('chat.');
      const isHomeswiftMain = window.location.hostname.endsWith('homeswift.co') && !isChat;
      const defaultAfterLogin = isHomeswiftMain ? 'https://chat.homeswift.co/' : '/';
      
      // Ensure we don't redirect back to an auth page
      const authPages = ['/login', '/signup', '/verify-email', '/reset-password'];
      let target = redirectTo || defaultAfterLogin;
      // Handle relative '/app' on main domain by sending to chat
      if (isHomeswiftMain && target === '/app') {
        target = 'https://chat.homeswift.co/';
      }

      // If redirect is absolute URL (e.g., chat.homeswift.co), perform a full navigation
      const isAbsolute = /^https?:\/\//i.test(target);
      if (isAbsolute) {
        console.log('[AuthProvider.signIn] cross-origin redirect to', target);
        window.location.assign(target);
      } else if (!authPages.some(page => target.includes(page))) {
        console.log('[AuthProvider.signIn] navigating to', target);
        navigate(target);
      } else {
        console.log('[AuthProvider.signIn] navigating to', defaultAfterLogin);
        navigate(defaultAfterLogin);
      }
      
      console.log('[AuthProvider.signIn] success');
      return data.user;
    } catch (error) {
      console.error('Sign in error:', error);
      setError(error.message || 'An error occurred during sign in');
      throw error;
    } finally {
      console.log('[AuthProvider.signIn] finish');
      setLoading(false);
    }
  }, []);
  
  // Sign out
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  // Reset password
  const resetPassword = useCallback(async (email) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.hostname.startsWith('chat.') 
          ? 'https://chat.homeswift.co/reset-password'
          : `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      setError(error.message);
      throw error;
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
        email: email,
        options: {
          emailRedirectTo: window.location.hostname.startsWith('chat.') 
            ? 'https://chat.homeswift.co/verify-email'
            : `${window.location.origin}/verify-email`
        }
      });
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Resend verification error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Update user profile
  const updateProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      // Update auth user data
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data: {
          ...updates,
        },
      });
      
      if (authError) throw authError;
      
      // Update user profile in database
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        ...updates,
      }));
      
      return authData.user;
    } catch (error) {
      console.error('Update profile error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user?.id]);
  
  // Value to be provided by the context
  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    resendVerification,
    checkEmailExists,
    updateProfile,
    checkSession,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for direct use
export { AuthContext };
