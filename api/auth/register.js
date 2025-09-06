// Custom user registration endpoint
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, password, and name are required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Basic password validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    // For demo purposes, we'll just return success
    // In a real app, you'd save to a database
    const newUser = {
      id: Date.now(), // Simple ID generation
      email: email.toLowerCase(),
      name: name,
      picture: null,
      created_at: new Date().toISOString()
    };

    // Create session data for immediate login
    const sessionData = {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        picture: newUser.picture
      },
      tokens: { 
        access_token: `demo_token_${newUser.id}_${Date.now()}` 
      },
      timestamp: Date.now()
    };

    res.status(201).json({
      message: 'User registered successfully',
      session: sessionData
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
