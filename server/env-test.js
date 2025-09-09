// Simple test to check if Node.js is working
console.log('Node.js is working!');
console.log('Current directory:', __dirname);
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform, process.arch);

// Test environment variables
console.log('\nEnvironment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('- DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'not set');
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL || 'not set');

// Test file system access
const fs = require('fs');
try {
  const files = fs.readdirSync(__dirname);
  console.log('\nFiles in current directory:');
  console.log(files.slice(0, 10).join(', '));
  if (files.length > 10) console.log(`... and ${files.length - 10} more`);
} catch (error) {
  console.error('Error reading directory:', error.message);
}

// Test network connectivity
try {
  const https = require('https');
  console.log('\nTesting network connectivity to google.com...');
  
  const req = https.get('https://www.google.com', (res) => {
    console.log(`✅ Successfully connected to google.com (Status: ${res.statusCode})`);
  });
  
  req.on('error', (error) => {
    console.error('❌ Network error:', error.message);
  });
  
  req.setTimeout(5000, () => {
    console.error('❌ Network request timed out');
    req.destroy();
  });
} catch (error) {
  console.error('❌ Network test failed:', error.message);
}
