const https = require('https');

console.log('🌐 Testing internet connectivity...');

// Test connection to a reliable internet service
const testUrl = 'https://www.google.com';

const req = https.get(testUrl, (res) => {
  console.log(`✅ Successfully connected to ${testUrl}`);
  console.log(`   Status Code: ${res.statusCode}`);
  process.exit(0);
});

req.on('error', (error) => {
  console.error(`❌ Failed to connect to ${testUrl}`);
  console.error('Error:', error.message);
  console.error('\n💡 This suggests there might be an issue with your internet connection or network configuration.');
  console.log('\nPlease check the following:');
  console.log('1. Are you connected to the internet?');
  console.log('2. Is there a firewall or proxy blocking outbound connections?');
  console.log('3. Can you access the internet from other devices on the same network?');
  process.exit(1);
});

// Set a timeout for the request
req.setTimeout(5000, () => {
  console.error(`❌ Connection to ${testUrl} timed out`);
  req.destroy();
  process.exit(1);
});
