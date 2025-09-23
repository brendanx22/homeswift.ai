const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 HomeSwift Database Setup');
console.log('==========================');

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

try {
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
} catch (err) {
  console.error('❌ Error reading .env file:', err.message);
  process.exit(1);
}

// Function to update or add environment variable
function updateEnvVar(key, value) {
  const envRegex = new RegExp(`^${key}=.*`, 'm');
  
  if (envRegex.test(envContent)) {
    // Update existing variable
    envContent = envContent.replace(envRegex, `${key}=${value}`);
  } else {
    // Add new variable
    envContent += `\n${key}=${value}\n`;
  }
}

// Ask for database password
rl.question('🔑 Enter your Supabase database password: ', (password) => {
  // Update DATABASE_URL with the provided password
  const dbUrl = `postgresql://postgres:${encodeURIComponent(password)}@db.tproaiqvkohrlxjmkgxt.supabase.co:5432/postgres`;
  updateEnvVar('DATABASE_URL', dbUrl);
  
  // Write the updated .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Successfully updated .env file');
    console.log('🔗 Database URL has been configured');
    console.log('\nYou can now start the application with:');
    console.log('   npm run dev');
  } catch (err) {
    console.error('❌ Error writing to .env file:', err.message);
  }
  
  rl.close();
});

// Handle script exit
rl.on('close', () => {
  console.log('\nSetup complete!');
  process.exit(0);
});
