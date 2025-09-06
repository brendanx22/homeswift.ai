// Vercel serverless function for Google OAuth token exchange
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirect_uri } = req.body;

    if (!code || !redirect_uri) {
      return res.status(400).json({ error: 'Missing code or redirect_uri' });
    }

    const GOOGLE_CLIENT_ID = '1067853597134-52q9qfuu1t1epa6av8lg4c6v6udcpd2c.apps.googleusercontent.com';
    
    console.log('Token exchange request:', { code, redirect_uri });
    console.log('Client ID:', GOOGLE_CLIENT_ID);

    // For web applications, we can try without client_secret first (public client)
    const tokenParams = {
      client_id: GOOGLE_CLIENT_ID,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirect_uri
    };

    // Add client_secret if available (for confidential clients)
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    if (GOOGLE_CLIENT_SECRET) {
      tokenParams.client_secret = GOOGLE_CLIENT_SECRET;
      console.log('Using client secret for confidential client flow');
    } else {
      console.log('No client secret - using public client flow');
    }

    console.log('Token request params:', tokenParams);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(tokenParams).toString()
    });

    const responseText = await tokenResponse.text();
    console.log('Google token response status:', tokenResponse.status);
    console.log('Google token response body:', responseText);

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', responseText);
      return res.status(tokenResponse.status).json({ 
        error: 'Token exchange failed', 
        details: responseText,
        status: tokenResponse.status 
      });
    }

    const tokens = JSON.parse(responseText);

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.error('User info fetch failed:', errorText);
      return res.status(400).json({ error: 'Failed to get user info', details: errorText });
    }

    const userInfo = await userResponse.json();

    // Return both tokens and user info
    return res.status(200).json({
      tokens,
      user: userInfo
    });

  } catch (error) {
    console.error('OAuth handler error:', error);
    console.error('Error stack:', error.stack);
    return res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message,
      stack: error.stack 
    });
  }
}
