import { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';
import BrandedSpinner from '../common/BrandedSpinner';

export default function SessionChecker({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check localStorage first
        const storedSession = localStorage.getItem('homeswift-auth-token');
        if (storedSession) {
          try {
            const parsedSession = JSON.parse(storedSession);
            if (parsedSession.currentSession?.user) {
              setHasSession(true);
              setIsChecking(false);
              return;
            }
          } catch (e) {
            console.log('Error parsing stored session');
          }
        }

        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setHasSession(true);
        } else {
          setHasSession(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setHasSession(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setHasSession(!!session?.user);
      setIsChecking(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isChecking) {
    return <BrandedSpinner message="Checking your session..." />;
  }

  return children;
}
