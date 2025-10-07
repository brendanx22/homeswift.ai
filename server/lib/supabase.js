import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Get Supabase configuration from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase Configuration Error:', {
    VITE_SUPABASE_URL: supabaseUrl ? '***' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? '***' : 'MISSING'
  });
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

// Initialize Supabase client with enhanced configuration
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // We'll handle sessions with JWT
    detectSessionInUrl: false
  },
  global: {
    headers: { 'x-application-name': 'HomeSwift Server' }
  }
});

// Test connection function
async function testConnection() {
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Supabase connection test failed:', error);
    return { success: false, error };
    throw error;
  }
}

export { supabase, testConnection };
export default supabase;
