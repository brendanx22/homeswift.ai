// This file is deprecated - use supabaseAuthController.js instead
// Keeping this file for backward compatibility but redirecting to Supabase implementation

import * as supabaseAuth from './supabaseAuthController.js';

export const register = supabaseAuth.register;
export const login = supabaseAuth.login;
export const logout = supabaseAuth.logout;
export const getCurrentUser = supabaseAuth.getCurrentUser;
export const verifyEmail = supabaseAuth.verifyEmail;
export const resendVerification = supabaseAuth.resendVerification;