import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection with:');
console.log('URL:', supabaseUrl ? '***.supabase.co' : 'MISSING');
console.log('Key:', supabaseKey ? '***' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing Supabase connection...');
    
    // Test auth
    console.log('\n🔐 Testing authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('❌ Auth test failed:', authError.message);
    } else {
      console.log('✅ Auth test successful');
      console.log('   User ID:', authData.user?.id || 'No user session');
    }
    
    // Test database query
    console.log('\n📊 Testing database query...');
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
      
    if (dbError) {
      console.error('❌ Database query failed:', dbError.message);
    } else {
      console.log('✅ Database query successful');
      console.log('   Found users:', dbData.length);
      if (dbData.length > 0) {
        console.log('   First user email:', dbData[0].email || 'No email');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
