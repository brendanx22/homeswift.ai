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
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

async function listTables() {
  try {
    console.log('🔍 Querying database for tables...');
    
    // List all tables in the public schema
    const { data: tables, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');

    if (error) {
      console.error('❌ Error listing tables:', error);
      return;
    }

    if (tables.length === 0) {
      console.log('ℹ️ No tables found in the public schema');
      return;
    }

    console.log('📋 Tables in public schema:');
    tables.forEach(table => console.log(`- ${table.tablename}`));

    // Check for required tables
    const requiredTables = ['users', 'properties', 'sessions'];
    const missingTables = requiredTables.filter(
      table => !tables.some(t => t.tablename === table)
    );

    if (missingTables.length > 0) {
      console.log('\n❌ Missing required tables:');
      missingTables.forEach(table => console.log(`- ${table}`));
      console.log('\nRun database migrations to create these tables.');
    } else {
      console.log('\n✅ All required tables exist');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listTables();
