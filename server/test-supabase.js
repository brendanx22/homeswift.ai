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
    
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('❌ Error listing tables:', error);
      return;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log('📋 Available tables in public schema:');
    tables.forEach(table => console.log(`- ${table.tablename}`));
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
  }
}

testConnection();
