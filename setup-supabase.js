#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🏠 HomeSwift.ai - Supabase Setup');
console.log('=====================================\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env file already exists');
  console.log('   Please update it with your Supabase credentials\n');
} else {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Supabase Configuration
# Replace these with your actual Supabase project credentials
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Server-side Supabase (for API routes)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Environment
NODE_ENV=development

# API Configuration
VITE_API_BASE_URL=http://localhost:5001/api

# Optional: Database connection for legacy server code (if needed)
# These can be the same as Supabase connection details
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=6543
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-db-password-here

# Development database (fallback)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=homeswift_dev
DB_USER=postgres
DB_PASSWORD=password
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully\n');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
    process.exit(1);
  }
}

console.log('🔧 Next Steps:');
console.log('1. Go to https://supabase.com and create a new project');
console.log('2. Get your project URL and API keys from the project settings');
console.log('3. Update the .env file with your Supabase credentials:');
console.log('   - VITE_SUPABASE_URL: Your project URL');
console.log('   - VITE_SUPABASE_ANON_KEY: Your anon/public key');
console.log('   - SUPABASE_URL: Same as VITE_SUPABASE_URL');
console.log('   - SUPABASE_SERVICE_ROLE_KEY: Your service role key (keep secret!)');
console.log('');
console.log('4. Run the database setup:');
console.log('   npm run setup-db');
console.log('');
console.log('5. Start the development server:');
console.log('   npm run dev');
console.log('');
console.log('📚 For more help, check the Supabase documentation:');
console.log('   https://supabase.com/docs/guides/getting-started');
