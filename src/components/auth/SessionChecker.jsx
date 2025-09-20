import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return children;
}
