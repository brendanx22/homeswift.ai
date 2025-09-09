const net = require('net');

const host = 'aws-0-eu-west-2.pooler.tproaiqvkohrlxjmkgxt.supabase.co';
const port = 6543;
const timeout = 5000; // 5 seconds

console.log(`🔌 Testing TCP connection to ${host}:${port}...`);

const socket = new net.Socket();

// Set a timeout for the connection
const connectionTimeout = setTimeout(() => {
  console.error('❌ Connection timed out');
  socket.destroy();
  process.exit(1);
}, timeout);

socket.on('connect', () => {
  clearTimeout(connectionTimeout);
  console.log('✅ Successfully established TCP connection!');
  socket.destroy();
  process.exit(0);
});

socket.on('error', (error) => {
  clearTimeout(connectionTimeout);
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
    console.log('3. The server is not accepting connections');
  } else if (error.code === 'ETIMEDOUT') {
    console.log('\n💡 Connection timed out. This could be due to:');
    console.log('1. Network connectivity issues');
    console.log('2. The server is not responding');
    console.log('3. A firewall is blocking the connection');
  }
  
  process.exit(1);
});

console.log(`   Attempting to connect to ${host}:${port}...`);
socket.connect(port, host);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Process terminated by user');
  socket.destroy();
  process.exit(0);
});
