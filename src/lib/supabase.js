// src/lib/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env"
  );
}

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
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage,
    storageKey: "homeswift-auth-token",
    redirectTo: window?.location?.hostname?.startsWith("chat.")
      ? "https://chat.homeswift.co/auth/callback"
      : "https://homeswift.co/auth/callback",
  },
  // remove the custom fetch override – let Supabase call its own auth endpoints
  global: {
    headers: { "x-application-name": "HomeSwift" },
  },
});

export default supabase;
