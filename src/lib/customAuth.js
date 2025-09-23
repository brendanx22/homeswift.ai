// Custom authentication library for local development
const DEMO_USERS = [
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

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const loginWithEmail = async (email, password) => {
  await delay(500); // Simulate network delay
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user by email
  const user = DEMO_USERS.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
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

  return sessionData;
};

export const registerWithEmail = async (email, password, name) => {
  await delay(500); // Simulate network delay
  
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Basic password validation
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  // Check if user already exists
  const existingUser = DEMO_USERS.find(u => u.email === email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Create new user
  const newUser = {
    id: Date.now(), // Simple ID generation
    email: email.toLowerCase(),
    name: name,
    picture: null,
    created_at: new Date().toISOString()
  };

  // Add to demo users (in real app, save to database)
  DEMO_USERS.push({
    ...newUser,
    password: password
  });

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

  return sessionData;
};
