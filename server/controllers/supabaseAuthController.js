import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase clients
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Regular client for normal operations
const supabase = createClient(
  SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY // Using anon key for regular operations
);

// Admin client for user management
const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  }
);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || "user" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Send verification email
const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `https://chat.homeswift.co/verify-email?token=${token}`;

  // Read email template
  const emailTemplatePath = path.join(
    __dirname,
    "../../email-templates/verification-email.html"
  );
  let emailTemplate = fs.readFileSync(emailTemplatePath, "utf8");

  // Replace placeholders
  emailTemplate = emailTemplate
    .replace(/{{name}}/g, name || "User")
    .replace(/{{verificationUrl}}/g, verificationUrl);

  const mailOptions = {
    from: `"HomeSwift" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: "Verify Your HomeSwift Account",
    html: emailTemplate,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

// Check if email exists
export const checkEmailExists = async (req, res) => {
  const rawEmail = req.body?.email;
  const email = (rawEmail || '').toString().trim().toLowerCase();

  try {
    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        code: "MISSING_EMAIL",
      });
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
        code: "INVALID_EMAIL",
      });
    }

    // Validate server config
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('[checkEmailExists] Missing Supabase environment variables');
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
        code: "SERVER_CONFIG_ERROR"
      });
    }

    // Use Supabase Admin API to check auth users
    try {
      // Use Admin API to check if user exists - using listUsers for Supabase v2+
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        email: email
      });
      
      if (error) {
        console.error('Supabase admin error:', error);
        throw error;
      }
      
      // Check if any users were found with this email
      const userExists = data?.users?.length > 0;
      return res.json({ 
        exists: userExists, 
        success: true 
      });
      
    } catch (error) {
      console.error('Error checking email with Supabase:', error);
      // For security, don't reveal too much about the error to the client
      return res.status(500).json({
        success: false,
        message: "Unable to verify email at this time",
        code: "SERVICE_UNAVAILABLE"
      });
    }
  } catch (error) {
    console.error("Error checking email:", error?.message || error);
    return res.status(500).json({
      success: false,
      message: "Error checking email",
      code: "CHECK_EMAIL_ERROR",
      ...(process.env.NODE_ENV !== 'production' && { detail: error.message }),
    });
  }
};

// Register new user
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // 1. Create user in Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
        emailRedirectTo: "https://chat.homeswift.co/auth/callback",
      },
    });

    if (signUpError) throw signUpError;

    // 2. Generate verification token
    const verificationToken = jwt.sign(
      { email, sub: authData.user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 3. Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    // 4. Generate auth token
    const authToken = generateToken(authData.user);

    // 5. Return success response
    return res.status(201).json({
      success: true,
      message:
        "Registration successful! Please check your email to verify your account.",
      token: authToken,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: authData.user.user_metadata?.full_name,
        emailVerified: authData.user.email_confirmed_at !== null,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Registration failed",
      code: error.code || "REGISTRATION_FAILED",
    });
  }
};

// Login user
export const login = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      code: 'MISSING_CREDENTIALS'
    });
  }

  try {
    console.log('Login attempt for:', email);
    
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password: password.trim(),
    });

    if (error) {
      console.error('Supabase auth error:', error);
      throw error;
    }

    if (!data || !data.user) {
      throw new Error('No user data returned from authentication');
    }

    // 2. Check if email is verified
    if (!data.user.email_confirmed_at) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    // 3. Get additional user data
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      console.warn('Could not fetch user profile:', userError);
    }

    // 4. Generate JWT token
    const token = generateToken(data.user);
    
    // Set secure, httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: process.env.NODE_ENV === 'production' ? '.homeswift.co' : 'localhost'
    });

    // 5. Return success response
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || userData?.full_name || 'User',
        emailVerified: !!data.user.email_confirmed_at,
        ...(userData || {})
      },
      redirectUrl: process.env.FRONTEND_URL || 'https://homeswift.co'
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    // Handle specific Supabase errors
    if (error.message.includes('Invalid login credentials')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    if (error.code === 'too_many_requests') {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again later.',
        code: 'TOO_MANY_ATTEMPTS'
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred during login',
      code: error.code || 'LOGIN_ERROR'
    });
  }
};

// Verify email
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.redirect(
        "https://chat.homeswift.co/verification-error?error=invalid_token"
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Mark email as verified in Supabase v2+
    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
      decoded.sub,
      { 
        email_confirm: true,
        // In v2, we need to explicitly set the email confirmation timestamp
        email_confirmed_at: new Date().toISOString()
      }
    );

    if (error) throw error;
    if (!user) throw new Error('User not found');

    // Generate auth token with the updated user data
    const authToken = generateToken(user);

    // Redirect to chat app with token
    const redirectUrl = `https://chat.homeswift.co/auth/callback?token=${authToken}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Email verification error:", error);
    return res.redirect(
      `https://chat.homeswift.co/verification-error?error=${encodeURIComponent(
        error.message
      )}`
    );
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from Supabase
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", decoded.id)
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name,
        emailVerified: !!user.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // Invalidate token (optional: add to blacklist)
      // This is a simplified example - in production, you might want to implement token blacklisting
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Get user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if already verified
    if (user.email_confirmed_at) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new verification token
    const verificationToken = jwt.sign(
      { email: user.email, sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send verification email
    await sendVerificationEmail(
      user.email,
      user.user_metadata?.full_name,
      verificationToken
    );

    return res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend verification email",
    });
  }
};
