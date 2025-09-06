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
  // Verify state parameter
  const storedState = getAuthState();
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }
  clearAuthState();
  
  const tokenEndpoint = 'https://oauth2.googleapis.com/token';
  
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    client_secret: '', // For public clients, this can be empty
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: REDIRECT_URI
  });
  
  try {
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }
    
    const tokens = await response.json();
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
