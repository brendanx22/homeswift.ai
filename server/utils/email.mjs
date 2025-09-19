import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Send email using Brevo API
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} [name='User'] - Recipient name (optional)
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export async function sendEmail(to, subject, html, name = 'User') {
  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_FROM_NAME || 'HomeSwift',
          email: process.env.BREVO_FROM_EMAIL || 'nwanzebrendan@gmail.com',
        },
        to: [{ email: to, name }],
        subject,
        htmlContent: html,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Email sent to ${to} (Message ID: ${data.messageId})`);
      return true;
    } else {
      console.error('❌ Email send error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Email send error:', error);
    return false;
  }
}

/**
 * Send a confirmation code email
 * @param {string} to - Recipient email address
 * @param {string} code - Confirmation code
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
/**
 * Send an email verification link
 * @param {string} to - Recipient email address
 * @param {string} token - Verification token
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export async function sendEmailVerification(to, token) {
  const frontendUrl = process.env.NODE_ENV === 'production'
    ? (process.env.CLIENT_URL || 'https://homeswift-ai.vercel.app')
    : 'http://localhost:5137'; // Updated port to 5137 for local development
  const apiUrl = process.env.NODE_ENV === 'production'
    ? (process.env.API_URL || 'https://homeswift-ai.vercel.app/api')
    : 'http://localhost:5001/api';
  // Use frontend URL for the verification link
  const verificationUrl = `${frontendUrl}/api/verify-email?token=${token}&redirect=${encodeURIComponent('/main')}`;
  const subject = 'Verify Your HomeSwift Email Address';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - HomeSwift</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        body {
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #333;
          line-height: 1.6;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .header {
          padding: 30px 0;
          text-align: center;
          background: linear-gradient(135deg, #1a5a8a 0%, #0f3d5e 100%);
          color: white;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
          margin-bottom: 15px;
        }
        
        .content {
          padding: 40px 30px;
          color: #444;
        }
        
        h1 {
          color: #1a5a8a;
          margin-top: 0;
          font-size: 24px;
          font-weight: 600;
        }
        
        .button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #1a5a8a 0%, #0f3d5e 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          font-size: 16px;
          text-align: center;
          margin: 25px 0;
          transition: all 0.3s ease;
        }
        
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(26, 90, 138, 0.3);
        }
        
        .divider {
          height: 1px;
          background-color: #eaeaea;
          margin: 30px 0;
          position: relative;
        }
        
        .divider-text {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 15px;
          color: #777;
          font-size: 13px;
        }
        
        .verification-link {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          word-break: break-all;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #1a5a8a;
          border: 1px solid #e0e0e0;
        }
        
        .footer {
          padding: 20px;
          text-align: center;
          background-color: #f8f9fa;
          color: #777;
          font-size: 13px;
          border-top: 1px solid #eee;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- Header with Logo -->
        <div class="header">
          <img src="https://homeswift-ai.vercel.app/logo-white.png" alt="HomeSwift" class="logo">
          <h1 style="color: white; margin: 10px 0 0; font-size: 28px;">Verify Your Email</h1>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <p style="font-size: 16px; line-height: 1.7; margin-bottom: 25px;">
            Welcome to HomeSwift! We're excited to have you on board. To get started, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">
              Verify Email Address
            </a>
          </div>
          
          <div class="divider">
            <span class="divider-text">or</span>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
            Copy and paste this link into your browser:
          </p>
          
          <div class="verification-link">
            ${verificationUrl}
          </div>
          
          <p style="font-size: 13px; color: #888; margin-top: 30px; line-height: 1.6;">
            <strong>Note:</strong> This link will expire in 24 hours. If you didn't create an account with HomeSwift, you can safely ignore this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p style="margin: 0;">
            © ${new Date().getFullYear()} HomeSwift. All rights reserved.
          </p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #999;">
            If you have any questions, please contact our support team at support@homeswift.ai
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(to, subject, htmlContent);
}

/**
 * Send a confirmation code email (for password reset, etc.)
 * @param {string} to - Recipient email address
 * @param {string} code - Confirmation code
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export async function sendConfirmationCodeEmail(to, code) {
  const subject = 'Your Password Reset Code';
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #927a5c; padding: 20px; color: white; text-align: center;">
        <h1 style="margin: 0;">HomeSwift</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2>Password Reset Code</h2>
        <p>You requested a password reset for your HomeSwift account. Use the following code to complete the process:</p>
        <div style="font-size: 24px; font-weight: bold; text-align: center; color: #927a5c; padding: 15px; margin: 20px 0; letter-spacing: 5px; background: #fff; border: 1px solid #ddd; border-radius: 4px;">
          ${code}
        </div>
        <p>This code will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      </div>
      <div style="font-size: 12px; color: #666; text-align: center; margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee;">
        <p>© ${new Date().getFullYear()} HomeSwift. All rights reserved.</p>
      </div>
    </div>
  `;

  return await sendEmail(to, subject, htmlContent);
}

/**
 * Send welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
export async function sendWelcomeEmail(to, name) {
  const firstName = name.split(' ')[0] || 'there';
  const subject = 'Welcome to HomeSwift!';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to HomeSwift</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        body { 
          margin: 0; 
          padding: 0; 
          background-color: #1a1a1a;
          background-image: url('https://homeswift-ai.vercel.app/Hero%20Section%20Image.png');
          background-size: cover;
          background-position: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
          color: #e2e8f0;
          line-height: 1.6;
        }
        .container { 
          max-width: 500px; 
          margin: 2rem auto; 
          background-color: rgba(26, 26, 26, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .content { 
          padding: 2.5rem; 
          background-color: transparent;
        }
        .button { 
          display: block;
          width: 100%;
          padding: 1rem; 
          background: white; 
          color: #1a1a1a; 
          text-decoration: none; 
          border-radius: 1.5rem; 
          font-weight: 600;
          font-size: 1rem;
          text-align: center;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          margin: 2rem 0;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.01em;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .button:hover {
          background-color: #f3f4f6;
          transform: translateY(-1px);
        }
        .features { 
          margin: 2.5rem 0;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1.5rem;
          overflow: hidden;
          background-color: rgba(0, 0, 0, 0.2);
        }
        .feature-item { 
          display: flex; 
          align-items: center; 
          margin: 0;
          padding: 1.25rem 1.5rem; 
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          color: #e2e8f0;
          background-color: transparent;
          transition: all 0.2s ease;
        }
        .feature-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        .feature-item:last-child { 
          border-bottom: none;
        }
        .feature-icon { 
          margin-right: 1rem; 
          color: #60a5fa;
          font-size: 1.25rem;
          min-width: 24px;
          text-align: center;
        }
        .divider {
          position: relative;
          margin: 2rem 0;
          text-align: center;
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: #334155;
          z-index: 1;
        }
        .divider span {
          position: relative;
          z-index: 2;
          background-color: #1e293b;
          padding: 0 1rem;
        }
      </style>
    </head>
    <body style="padding: 1rem;">
      <div class="container">
        <!-- Header -->
        <div style="padding: 3rem 2rem 2rem; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
          <h1 style="font-size: 1.875rem; font-weight: 700; color: #fff; margin: 0 0 0.5rem 0; letter-spacing: -0.025em;">Welcome to HomeSwift</h1>
          <p style="color: #9ca3af; margin: 0; font-size: 1rem; font-weight: 400;">Find your dream home today</p>
        </div>
        
        <!-- Main Content -->
        <div class="content">
          <h2 style="margin: 2rem 0 1.5rem 0; color: #fff; font-size: 1.5rem; font-weight: 600; text-align: center; letter-spacing: -0.01em;">Welcome, ${firstName}!</h2>
          
          <p style="margin: 0 0 2.5rem 0; color: rgba(255, 255, 255, 0.8); line-height: 1.7; text-align: center; font-size: 1.05rem; max-width: 90%; margin-left: auto; margin-right: auto;">
            Thank you for joining HomeSwift! We're excited to help you find your perfect property.
          </p>
          
          <div class="features">
            <div class="feature-item">
              <span class="feature-icon">&#x1F3E0;</span>
              <span>Save and compare your favorite properties</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">&#x1F514;</span>
              <span>Get instant alerts for new listings</span>
            </div>
            <div class="feature-item">
              <span class="feature-icon">&#x1F4C5;</span>
              <span>Schedule viewings with ease</span>
            </div>
          </div>
          
          <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/app" class="button">
            Go to Dashboard
          </a>
          
          <div class="divider">
            <span>Need help?</span>
          </div>
          
          <p style="margin: 0; color: #94a3b8; font-size: 0.875rem; text-align: center; line-height: 1.6;">
            Contact us at <a href="mailto:support@homeswift.ai" style="color: #60a5fa; text-decoration: none;">support@homeswift.ai</a>
          </p>
        </div>
        
        <!-- Footer -->
        <div style="padding: 1.5rem; background-color: #0f172a; text-align: center; border-top: 1px solid #1e293b;">
          <p style="margin: 0 0 0.5rem; color: #64748b; font-size: 0.75rem;">
            &copy; ${new Date().getFullYear()} HomeSwift. All rights reserved.
          </p>
          <p style="margin: 0; font-size: 0.75rem;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/privacy" style="color: #64748b; text-decoration: none; margin: 0 0.5rem;">Privacy</a> • 
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/terms" style="color: #64748b; text-decoration: none; margin: 0 0.5rem;">Terms</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail(to, subject, htmlContent);
}

/**
 * Generate a random confirmation code
 * @param {number} length - Length of the code (default: 6)
 * @returns {string} - Random numeric code
 */
export function generateConfirmationCode(length = 6) {
  const digits = '0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += digits[Math.floor(Math.random() * digits.length)];
  }
  return code;
}
