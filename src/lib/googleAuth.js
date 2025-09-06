// Google OAuth 2.0 Direct Implementation
const GOOGLE_CLIENT_ID = '1067853597134-52q9qfuu1t1epa6av8lg4c6v6udcpd2c.apps.googleusercontent.com';
const REDIRECT_URI = window.location.origin + '/auth/callback';
const SCOPES = 'openid email profile';

// Generate a random state parameter for security
const generateState = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Store state in sessionStorage for verification
const setAuthState = (state) => {
  sessionStorage.setItem('google_auth_state', state);
};

const getAuthState = () => {
  return sessionStorage.getItem('google_auth_state');
};

const clearAuthState = () => {
  sessionStorage.removeItem('google_auth_state');
};

// Build Google OAuth URL
export const getGoogleAuthUrl = () => {
  const state = generateState();
  setAuthState(state);
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    state: state,
    access_type: 'offline',
    prompt: 'consent'
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

// Initiate Google Sign-In
export const signInWithGoogle = () => {
  const authUrl = getGoogleAuthUrl();
  console.log('Redirecting to Google OAuth:', authUrl);
  window.location.href = authUrl;
};

// Exchange authorization code for tokens
export const exchangeCodeForTokens = async (code, state) => {
  console.log('Starting token exchange...');
  console.log('Code:', code);
  console.log('State:', state);
  console.log('Redirect URI:', REDIRECT_URI);
  
  // Verify state parameter
  const storedState = getAuthState();
  console.log('Stored state:', storedState);
  
  if (state !== storedState) {
    console.error('State mismatch:', { received: state, stored: storedState });
    throw new Error('Invalid state parameter - possible CSRF attack');
  }
  clearAuthState();
  
  // For public OAuth clients, we need to use PKCE instead of client_secret
  // But Google's OAuth for web apps typically requires a client_secret
  // Let's try without client_secret first (public client flow)
  
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI
  });
  
  console.log('Token request params:', params.toString());
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    console.log('Token response status:', response.status);
    console.log('Token response headers:', response.headers);
    
    const responseText = await response.text();
    console.log('Token response body:', responseText);
    
    if (!response.ok) {
      throw new Error(`Token exchange failed (${response.status}): ${responseText}`);
    }
    
    const tokens = JSON.parse(responseText);
    console.log('Tokens received:', tokens);
    return tokens;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

// Get user info from Google
export const getUserInfo = async (accessToken) => {
  try {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`);
    }
    
    const userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error('Get user info error:', error);
    throw error;
  }
};

// Store user session
export const storeUserSession = (userInfo, tokens) => {
  const session = {
    user: userInfo,
    tokens: tokens,
    timestamp: Date.now()
  };
  
  localStorage.setItem('google_user_session', JSON.stringify(session));
};

// Get stored user session
export const getUserSession = () => {
  try {
    const session = localStorage.getItem('google_user_session');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Error getting user session:', error);
    return null;
  }
};

// Clear user session (logout)
export const clearUserSession = () => {
  localStorage.removeItem('google_user_session');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const session = getUserSession();
  return session && session.user && session.tokens;
};

// Get current user
export const getCurrentUser = () => {
  const session = getUserSession();
  return session ? session.user : null;
};
