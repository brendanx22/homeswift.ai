import { createServerClient } from '@supabase/ssr';

export const createClient = (req, res) => {
  return createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set(name, value, options) {
          res.cookie(name, value, {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
        },
        remove(name, options) {
          res.cookie(name, '', {
            ...options,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 0,
          });
        },
      },
    }
  );
};

export const requireAuth = async (req, res, next) => {
  const supabase = createClient(req, res);
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated',
        code: 'UNAUTHORIZED'
      });
    }

    // Attach user to request
    req.user = session.user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

export const requireRole = (roles = []) => {
  return async (req, res, next) => {
    const supabase = createClient(req, res);
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error || !session) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated',
          code: 'UNAUTHORIZED'
        });
      }

      // Check if user has required role
      const userRole = session.user?.user_metadata?.role || 'user';
      
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          code: 'FORBIDDEN'
        });
      }

      // Attach user to request
      req.user = session.user;
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};
