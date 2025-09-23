const https = require('https');

const hostname = 'tproaiqvkohrlxjmkgxt.supabase.co';
const path = '/rest/v1/';
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwcm9haXF2a29ocmx4am1rZ3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0MjUwNDksImV4cCI6MjA3MzAwMTA0OX0.RoOBMaKyPXi0BXfWOhLpAAj89sKYxWEE-Zz5iu3kTEI';

const options = {
  hostname: hostname,
  port: 443,
  path: path,
  method: 'GET',
  headers: {
    'apikey': apiKey,
    'Authorization': `Bearer ${apiKey}`
  },
  timeout: 5000 // 5 seconds
};

console.log(`🌐 Testing HTTP connection to ${hostname}...`);

const req = https.request(options, (res) => {
  console.log(`✅ Connected to ${hostname}`);
  console.log(`   Status Code: ${res.statusCode}`);
  console.log('   Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\n📄 Response:');
    console.log(data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('❌ Connection error:', error.message);
  console.error('Error code:', error.code);
  
  if (error.code === 'ENOTFOUND') {
    console.log('\n💡 The hostname could not be resolved. This usually means:');
    console.log('1. You are not connected to the internet');
    console.log('2. The hostname is incorrect');
    console.log('3. There is a DNS resolution issue');
  } else if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Connection refused. This could be due to:');
    console.log('1. The server is not running on the specified port');
    console.log('2. A firewall is blocking the connection');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('\n💡 Connection timed out. This could be due to:');
    console.log('1. Network connectivity issues');
    console.log('2. The server is not responding');
  }
  
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
  process.exit(1);
});

req.end();
