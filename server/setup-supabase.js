import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupSupabase() {
  console.log('🚀 Setting up Supabase configuration...\n');

  // Get Supabase project details
  const supabaseUrl = await askQuestion('Enter your Supabase project URL (e.g., https://your-project-id.supabase.co): ');
  const anonKey = await askQuestion('Enter your Supabase Anon Key: ');
  const serviceRoleKey = await askQuestion('Enter your Supabase Service Role Key: ');
  const dbPassword = await askQuestion('Enter your database password: ');

  // Update .env file
  const envPath = path.join(__dirname, '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Update Supabase configuration
  envContent = envContent.replace(
    /# Supabase Configuration.*?(?=#|$)/s,
    `# Supabase Configuration\nSUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${anonKey}\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\n`
  );

  // Update database URL
  const dbUrl = `${supabaseUrl.replace('https://', '')}`.replace('.supabase.co', '');
  const connectionUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.${dbUrl}.supabase.co:5432/postgres`;
  const poolerUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@aws-0-eu-west-2.pooler.${dbUrl}.supabase.co:6543/postgres`;

  envContent = envContent.replace(
    /# Database Configuration.*?(?=#|$)/s,
    `# Database Configuration\nDATABASE_URL=${poolerUrl}\n`
  );

  // Write updated .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log('\n✅ Successfully updated .env file with Supabase configuration!');
  console.log('\n🔗 Connection URL (Pooler):', poolerUrl);
  console.log('🔗 Connection URL (Direct):', connectionUrl);
  
  // Test the connection
  console.log('\n🔌 Testing connection to Supabase...');
  
  try {
    const supabase = createClient(supabaseUrl, anonKey);
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    if (data) console.log('📊 Sample data:', data);
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    console.log('\n⚠️  Could not verify database connection. Please check your credentials and try again.');
  }

  rl.close();
}

setupSupabase().catch(console.error);
