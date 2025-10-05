// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isProduction = import.meta.env.PROD;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env"
  );
}

// Determine the site URL based on the current hostname
const getSiteUrl = () => {
  if (typeof window === 'undefined') return import.meta.env.VITE_MAIN_APP_URL || 'http://localhost:5173';
  
  const hostname = window.location.hostname;
  if (hostname === 'chat.homeswift.co') return 'https://chat.homeswift.co';
  if (hostname === 'homeswift.co') return 'https://homeswift.co';
  return 'http://localhost:5173';
};

// Simple localStorage wrapper (guards for SSR)
const storage = {
  getItem: (key) =>
    typeof window !== "undefined" ? localStorage.getItem(key) : null,
  setItem: (key, value) =>
    typeof window !== "undefined" ? localStorage.setItem(key, value) : null,
  removeItem: (key) =>
    typeof window !== "undefined" ? localStorage.removeItem(key) : null,
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: storage,
    flowType: 'pkce',
    debug: !isProduction,
    storageKey: "homeswift-auth-token",
    cookieOptions: {
      name: 'sb-homeswift',
      lifetime: 60 * 60 * 24 * 7, // 7 days
      domain: isProduction ? '.homeswift.co' : 'localhost',
      path: '/',
      sameSite: 'lax'
    },
    redirectTo: window?.location?.hostname?.startsWith("chat.")
      ? "https://chat.homeswift.co/auth/callback"
      : "https://homeswift.co/auth/callback"
  },
  // remove the custom fetch override – let Supabase call its own auth endpoints
  global: {
    headers: { "x-application-name": "HomeSwift" },
  },
});

export default supabase;
