import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Construct the psql command
const command = `psql "postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT || 6543}/${process.env.SUPABASE_DB_NAME}?sslmode=require" -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"`;

try {
  console.log('🔍 Testing database connection and listing tables...\n');
  const output = execSync(command, { stdio: 'inherit' });
  console.log('\n✅ Successfully connected to the database!');
} catch (error) {
  console.error('❌ Error connecting to the database:');
  console.error(error.message);
  console.error('\n💡 Make sure you have psql installed and the database credentials in your .env file are correct.');
}
