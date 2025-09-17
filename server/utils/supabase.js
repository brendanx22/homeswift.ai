import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for server-side operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase Configuration Error:', {
    VITE_SUPABASE_URL: supabaseUrl ? '***' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: supabaseKey ? '***' : 'MISSING'
  });
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false, // We'll handle sessions with JWT
    detectSessionInUrl: false
  }
});

export default supabase;
