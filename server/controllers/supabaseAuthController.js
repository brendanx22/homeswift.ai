import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
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
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
        code: "MISSING_EMAIL",
      });
    }

    // Check if user exists in auth.users
    const { data: authUser, error: authError } = await supabase
      .from("users")
      .select("email")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    if (authError) throw authError;

    return res.json({
      exists: !!authUser,
      success: true,
    });
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking email",
      error: error.message,
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
  const { email, password } = req.body;

  try {
    // 1. Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // 2. Check if email is verified
    if (!data.user.email_confirmed_at) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    // 3. Generate JWT token
    const token = generateToken(data.user);

    // 4. Return success response with redirect URL
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      redirectUrl: "https://chat.homeswift.co/auth/callback",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(401).json({
      success: false,
      message: error.message || "Login failed",
      code: error.code || "LOGIN_FAILED",
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

    // Mark email as verified in Supabase
    const { data: user, error } = await supabase.auth.admin.updateUserById(
      decoded.sub,
      { email_confirm: true }
    );

    if (error) throw error;

    // Generate auth token
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
