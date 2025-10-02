import { supabase } from './supabase';

/**
 * Google OAuth configuration and utilities
 */
export class GoogleAuth {
  constructor() {
    this.isProduction = typeof window !== 'undefined' && window.location.hostname.endsWith('homeswift.co');
    this.baseUrl = this.isProduction 
      ? (window.location.hostname.startsWith('list.') ? 'https://list.homeswift.co' : 'https://chat.homeswift.co')
      : window.location.origin;
  }

  /**
   * Initiate Google OAuth sign-in
   * @param {Object} options - Configuration options
   * @param {string} options.redirectTo - URL to redirect after authentication
   * @param {string} options.userType - 'renter' or 'landlord'
   */
  async signInWithGoogle({ redirectTo, userType = 'renter' } = {}) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${this.baseUrl}/auth/callback`,
          queryParams: {
            user_type: userType,
            ...(redirectTo && { redirect: redirectTo })
          }
        }
      });

      if (error) {
        console.error('Google OAuth error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Google sign-in failed:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback and token processing
   * @param {URLSearchParams} searchParams - URL search parameters
   */
  async handleCallback(searchParams) {
    try {
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const userType = searchParams.get('user_type') || 'renter';
      const redirectTo = searchParams.get('redirect');

      if (accessToken && refreshToken) {
        // Set the session with the tokens from the callback
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('Session setup error:', error);
          throw error;
        }

        // Update user metadata with user type if provided
        if (data.user && userType) {
          await supabase.auth.updateUser({
            data: {
              user_type: userType
            }
          });
        }

        return {
          success: true,
          user: data.user,
          redirectTo: redirectTo || this.getDefaultRedirect()
        };
      }

      // If no tokens in URL, get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Get session error:', error);
        throw error;
      }

      return {
        success: !!session,
        user: session?.user,
        redirectTo: redirectTo || this.getDefaultRedirect()
      };
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      throw error;
    }
  }

  /**
   * Get default redirect URL based on domain and user type
   */
  getDefaultRedirect() {
    const isChat = typeof window !== 'undefined' && window.location.hostname.startsWith('chat.');
    const isList = typeof window !== 'undefined' && window.location.hostname.startsWith('list.');
    const isMainDomain = typeof window !== 'undefined' && window.location.hostname.endsWith('homeswift.co') && !isChat && !isList;

    if (isList) {
      return '/dashboard';
    } else if (isMainDomain) {
      return 'https://chat.homeswift.co/';
    }

    return '/';
  }

  /**
   * Check if Google OAuth is properly configured
   */
  async checkConfiguration() {
    try {
      // This would typically check if Google provider is enabled in Supabase
      // For now, we'll assume it's configured if we can reach the auth endpoint
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`);
      return response.ok;
    } catch (error) {
      console.error('Google OAuth configuration check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const googleAuth = new GoogleAuth();

// Export utility functions for React components
export const useGoogleAuth = () => {
  return {
    signInWithGoogle: googleAuth.signInWithGoogle.bind(googleAuth),
    handleCallback: googleAuth.handleCallback.bind(googleAuth),
    checkConfiguration: googleAuth.checkConfiguration.bind(googleAuth)
  };
};

export default googleAuth;
