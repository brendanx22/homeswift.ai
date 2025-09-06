// Custom email/password authentication endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Simple demo users for testing
    const demoUsers = [
      { 
        id: 1, 
        email: 'demo@homeswift.ai', 
        password: 'demo123',
        name: 'Demo User',
        picture: null
      },
      { 
        id: 2, 
        email: 'test@example.com', 
        password: 'password',
        name: 'Test User',
        picture: null
      }
    ];

    // Find user by email
    const user = demoUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create session data (excluding password)
    const sessionData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture
      },
      tokens: { 
        access_token: `demo_token_${user.id}_${Date.now()}` 
      },
      timestamp: Date.now()
    };

    res.status(200).json(sessionData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
