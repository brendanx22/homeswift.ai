import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) throw authError;
    console.log('✅ Auth connection successful');
    
    // Test database connection
    const { data: dbData, error: dbError } = await supabase
      .from('properties')
      .select('*')
      .limit(1);
      
    if (dbError) throw dbError;
    console.log('✅ Database connection successful');
    
    // List all tables in the public schema
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables');
    
    if (tablesError) {
      console.warn('⚠️ Could not list tables (expected if function does not exist)');
    } else {
      console.log('\n📋 Tables in public schema:');
      tables.forEach(table => console.log(`- ${table.table_name}`));
    }
    
    console.log('\n🎉 Supabase connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing Supabase connection:');
    console.error(error);
  } finally {
    process.exit(0);
  }
}

testConnection();
