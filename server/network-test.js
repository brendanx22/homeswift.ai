const net = require('net');
const dns = require('dns');
const { URL } = require('url');
require('dotenv').config();

const dbUrl = new URL(process.env.DATABASE_URL);
const hostname = dbUrl.hostname.replace(/^\[|\]$/g, '');
const port = dbUrl.port || 5432;

console.log(`Testing connection to ${hostname}:${port}...`);

// Test DNS resolution
dns.lookup(hostname, { all: true }, (err, addresses) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err);
    return;
  }
  
  console.log('✅ DNS resolved to:', addresses);
  
  // Test TCP connection
  const socket = new net.Socket();
  
  socket.setTimeout(5000);
  
  socket.on('connect', () => {
    console.log('✅ Successfully established TCP connection!');
    socket.destroy();
  });
  
  socket.on('timeout', () => {
    console.error('❌ Connection timeout');
    socket.destroy();
  });
  
  socket.on('error', (error) => {
    console.error('❌ Connection error:', error.message);
  });
  
  console.log(`Attempting to connect to ${hostname}:${port}...`);
  socket.connect(port, hostname);
});
