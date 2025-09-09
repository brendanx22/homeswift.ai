import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test a simple query
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('Sample data:', data);
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
  }
}

testConnection();
