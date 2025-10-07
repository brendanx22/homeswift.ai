import { createClient } from "@supabase/supabase-js";

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const isProduction = import.meta.env.MODE === "production";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env"
  );
}

// Get the current hostname and protocol for dynamic redirects
const getHostInfo = () => {
  if (typeof window === "undefined")
    return { hostname: "homeswift.co", protocol: "https:" };
  return {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port ? `:${window.location.port}` : "",
  };
};

// Get host info
const { hostname, protocol, port } = getHostInfo();

// Determine environment
const isLocalhost =
  hostname === "localhost" ||
  hostname.startsWith("192.168") ||
  hostname.startsWith("10.0");
const isChatSubdomain = hostname.startsWith("chat.") || isLocalhost;

// Cookie options for cross-subdomain support
const cookieOptions = {
  name: "sb-access-token",
  lifetime: 60 * 60 * 24 * 7, // 7 days
  domain: isLocalhost ? "localhost" : ".homeswift.co",
  path: "/",
  sameSite: "lax",
  secure: isProduction,
  httpOnly: false, // Required for client-side access
};

// Custom storage that works across subdomains
const crossDomainStorage = {
  getItem: (key) => {
    if (typeof document === "undefined") return null;
    try {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${key}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
      return localStorage.getItem(key); // Fallback to localStorage
    } catch (error) {
      console.error("Error reading from storage:", error);
      return null;
    }
  },
  setItem: (key, value) => {
    if (typeof document === "undefined") return;
    try {
      const expires = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toUTCString();
      const domain = isLocalhost ? "localhost" : ".homeswift.co";
      document.cookie = `${key}=${value}; expires=${expires}; path=/; domain=${domain}; SameSite=Lax${
        isProduction ? "; Secure" : ""
      }`;
      // Also set in localStorage as fallback
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Error writing to storage:", error);
    }
  },
  removeItem: (key) => {
    if (typeof document === "undefined") return;
    try {
      const domain = isLocalhost ? "localhost" : ".homeswift.co";
      document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error removing from storage:", error);
    }
  },
};

// Custom logger that filters out verbose logs in production
const customLogger = (message, ...args) => {
  // Skip certain verbose messages in production
  const skipInProduction = [
    "#_acquireLock",
    "#_useSession",
    "#__loadSession",
    "#getSession",
    "#_recoverAndRefresh",
    "auto refresh token",
    "INITIAL_SESSION",
    "#onAuthStateChange",
  ];

  const shouldSkip =
    isProduction &&
    skipInProduction.some(
      (term) => typeof message === "string" && message.includes(term)
    );

  if (!shouldSkip) {
    const level = isProduction ? "log" : "debug";
    console[level](`[Supabase] ${message}`, ...args);
  }
};

// Get the correct redirect URL based on environment
const getRedirectUrl = () => {
  if (isLocalhost) {
    return `http://${hostname}${port ? `:${port}` : ":3000"}/auth/callback`;
  }

  if (isChatSubdomain) {
    return `${protocol}//${hostname}/auth/callback`;
  }

  // For main domain, redirect to chat subdomain
  return "https://chat.homeswift.co/auth/callback";
};

// Initialize Supabase client with error handling
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: crossDomainStorage,
    storageKey: "sb-homeswift-auth",
    flowType: "pkce",
    debug: false, // Disable debug logs in all environments
    // Set the redirect URL for authentication
    redirectTo: getRedirectUrl(),
    logger: isProduction
      ? undefined
      : {
          error: (message, ...args) =>
            console.error(`[Supabase Error]`, message, ...args),
          warn: (message, ...args) =>
            console.warn(`[Supabase Warn]`, message, ...args),
          log: (message, ...args) => {
            // Filter out verbose logs
            const skipLogs = [
              "#_acquireLock",
              "#_useSession",
              "#__loadSession",
              "INITIAL_SESSION",
            ];
            if (!skipLogs.some((term) => String(message).includes(term))) {
              console.log(`[Supabase]`, message, ...args);
            }
          },
          debug: (message, ...args) => {
            // Only show debug logs in development
            if (import.meta.env.DEV) {
              console.debug(`[Supabase Debug]`, message, ...args);
            }
          },
        },
    cookieOptions: {
      ...cookieOptions,
      sameSite: isProduction ? "lax" : "lax",
      secure: isProduction,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  global: {
    headers: {
      "x-application-name": "HomeSwift",
      "X-Client-Info": "home-swift/1.0",
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    eventsPerSecond: 10,
  },
});

// Initialize Supabase client with error handling
let supabaseClientInstance;

try {
  supabaseClientInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: {
        getItem: (key) => {
          try {
            return JSON.parse(localStorage.getItem(key));
          } catch (error) {
            console.error('Error getting item from storage:', error);
            return null;
          }
        },
        setItem: (key, value) => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
          } catch (error) {
            console.error('Error setting item in storage:', error);
          }
        },
        removeItem: (key) => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            console.error('Error removing item from storage:', error);
          }
        },
      },
      debug: !isProduction,
      logger: {
        error: (message, ...args) => {
          if (isProduction) return;
          console.error(`[Supabase Auth]`, message, ...args);
        },
        warn: (message, ...args) => {
          if (isProduction) return;
          console.warn(`[Supabase Auth]`, message, ...args);
        },
        log: (message, ...args) => {
          if (isProduction) return;
          console.log(`[Supabase Auth]`, message, ...args);
        },
        debug: (message, ...args) => {
          if (isProduction) return;
          console.debug(`[Supabase Auth]`, message, ...args);
        },
      },
    },
    db: {
      schema: "public",
    },
    realtime: {
      eventsPerSecond: 10,
    },
  });
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
  // Create a mock client in case of initialization error
  supabaseClientInstance = {
    auth: {
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      getSession: async () => ({
        data: { session: null },
        error: "Supabase client failed to initialize",
      }),
      signInWithOAuth: async () => ({
        error: "Supabase client not initialized",
      }),
      signOut: async () => ({ error: "Supabase client not initialized" }),
    },
  };
}

// Add error boundary for Supabase operations
const withSupabaseErrorHandling = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error("Supabase operation failed:", error);
      throw error;
    }
  };
};

// Wrap Supabase methods with error handling
const wrappedSupabase = {
  ...supabaseClientInstance,
  auth: {
    ...supabaseClientInstance.auth,
    signInWithOAuth: withSupabaseErrorHandling(
      supabaseClientInstance.auth.signInWithOAuth?.bind(supabaseClientInstance.auth) || 
      (() => Promise.reject(new Error('signInWithOAuth not available')))
    ),
    getSession: withSupabaseErrorHandling(
      supabaseClientInstance.auth.getSession?.bind(supabaseClientInstance.auth) || 
      (() => Promise.resolve({ data: { session: null }, error: 'Auth not initialized' }))
    ),
    signOut: withSupabaseErrorHandling(
      supabaseClientInstance.auth.signOut?.bind(supabaseClientInstance.auth) || 
      (() => Promise.reject(new Error('signOut not available')))
    ),
  },
};

// Export both named and default exports for compatibility
export const supabase = wrappedSupabase;
export default wrappedSupabase;
