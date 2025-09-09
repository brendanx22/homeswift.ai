import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl ? '***.supabase.co' : 'MISSING');
console.log('Supabase Key:', supabaseKey ? '***' : 'MISSING');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    
    // Test RLS policies by trying to insert a test user
    console.log('\n🔒 Testing RLS policies...');
    const testEmail = `test-${Date.now()}@example.com`;
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        email: testEmail,
        password: 'test123', // This would be hashed in a real scenario
        full_name: 'Test User'
      }])
      .select();
      
    if (insertError) {
      console.log('ℹ️  Expected RLS policy error (this is normal):', insertError.message);
    } else {
      console.log('⚠️  Unexpected success - RLS might not be properly configured');
      console.log('   Inserted test user ID:', insertData[0]?.id);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  } finally {
    process.exit(0);
  }
}

testConnection();
