import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Supabase client with service role for admin operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase Configuration Error:', {
    SUPABASE_URL: supabaseUrl ? '***.supabase.co' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? '***' : 'MISSING'
  });
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

console.log('🔐 Initializing Supabase client in production mode');

// Create Supabase client with optimized settings for production
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false, // We'll handle sessions with JWT
    detectSessionInUrl: false
  }
});

export default supabase;
