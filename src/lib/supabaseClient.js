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

// Get the current hostname for dynamic redirects
const getHostname = () => {
  if (typeof window === 'undefined') return 'homeswift.co';
  return window.location.hostname;
};

// Determine if we're on the chat subdomain
const isChatSubdomain = getHostname().startsWith('chat.');

// Cookie options for cross-subdomain support
const cookieOptions = {
  name: 'sb-access-token',
  lifetime: 60 * 60 * 24 * 7, // 7 days
  domain: isProduction ? '.homeswift.co' : 'localhost',
  path: '/',
  sameSite: 'lax',
  secure: isProduction
};

// Custom storage that works across subdomains
const crossDomainStorage = {
  getItem: (key) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${key}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  },
  setItem: (key, value) => {
    if (typeof document === 'undefined') return;
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${key}=${value}; expires=${expires}; path=/; domain=${isProduction ? '.homeswift.co' : 'localhost'}; SameSite=Lax${isProduction ? '; Secure' : ''}`;
  },
  removeItem: (key) => {
    if (typeof document === 'undefined') return;
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${isProduction ? '.homeswift.co' : 'localhost'}`;
  }
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

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: crossDomainStorage,
    storageKey: 'sb-homeswift-auth',
    flowType: 'pkce',
    debug: !isProduction,
    logger: {
      error: (message, ...args) => console.error(`[Supabase Error]`, message, ...args),
      warn: (message, ...args) => console.warn(`[Supabase Warn]`, message, ...args),
      log: customLogger,
      debug: customLogger
    },
    cookieOptions,
    redirectTo: isChatSubdomain 
      ? 'https://chat.homeswift.co/auth/callback' 
      : 'https://homeswift.co/auth/callback'
  },
  global: {
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Application-Name': 'HomeSwift',
      'X-Client-Info': 'home-swift/1.0'
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    eventsPerSecond: 10
  }
});

export default supabase;
