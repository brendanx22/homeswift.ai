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

// Custom logger that filters out verbose logs in production
const customLogger = (message, ...args) => {
  // Skip certain verbose messages in production
  const skipInProduction = [
    '#_acquireLock',
    '#_useSession',
    '#__loadSession',
    '#getSession',
    '#_recoverAndRefresh',
    'auto refresh token',
    'INITIAL_SESSION',
    '#onAuthStateChange'
  ];
  
  const shouldSkip = isProduction && skipInProduction.some(term => 
    typeof message === 'string' && message.includes(term)
  );
  
  if (!shouldSkip) {
    const level = isProduction ? 'log' : 'debug';
    console[level](`[Supabase] ${message}`, ...args);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: storage,
    flowType: 'pkce',
    debug: false, // Disable default debug logging
    logger: {
      error: (message, ...args) => console.error(`[Supabase Error]`, message, ...args),
      warn: (message, ...args) => console.warn(`[Supabase Warn]`, message, ...args),
      log: customLogger,
      debug: customLogger
    },
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
