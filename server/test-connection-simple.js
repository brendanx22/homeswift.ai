console.log('Starting simple connection test...');

// Test basic Node.js functionality
console.log('1. Basic Node.js test:');
console.log('   ✅ Node.js is running');

// Test require
let pg;
try {
  pg = require('pg');
  console.log('2. PostgreSQL module test:');
  console.log('   ✅ pg module is installed');
  console.log('   ℹ️  pg version:', pg.version);
} catch (err) {
  console.error('2. PostgreSQL module test:');
  console.error('   ❌ pg module is not installed:', err.message);
  process.exit(1);
}

// Test environment variables
try {
  require('dotenv').config();
  console.log('3. Environment variables test:');
  
  if (process.env.DATABASE_URL) {
    console.log('   ✅ DATABASE_URL is set');
    
    // Try to parse the URL
    try {
      const { URL } = require('url');
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log('   ℹ️  Database host:', dbUrl.hostname);
      console.log('   ℹ️  Database port:', dbUrl.port);
      console.log('   ℹ️  Database name:', dbUrl.pathname.substring(1));
    } catch (parseError) {
      console.error('   ❌ Failed to parse DATABASE_URL:', parseError.message);
    }
  } else {
    console.error('   ❌ DATABASE_URL is not set');
  }
  
} catch (err) {
  console.error('3. Environment variables test:');
  console.error('   ❌ Failed to load environment variables:', err.message);
}

// Simple test complete
console.log('\nTest complete. No database connection was attempted.');
console.log('If you see this message, the basic Node.js environment is working.');
console.log('However, we are unable to establish network connections.');

// Provide troubleshooting tips
console.log('\n💡 Troubleshooting tips:');
console.log('1. Check your internet connection');
console.log('2. Verify that your network allows outbound connections');
console.log('3. If you are behind a proxy, make sure it is configured correctly');
console.log('4. Try running this on a different network (e.g., mobile hotspot)');
console.log('5. Check if your firewall is blocking Node.js or the connection');

process.exit(0);
