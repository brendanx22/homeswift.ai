const dns = require('dns');

const hostname = 'aws-0-eu-west-2.pooler.tproaiqvkohrlxjmkgxt.supabase.co';

console.log(`🔍 Resolving DNS for: ${hostname}`);

dns.lookup(hostname, { all: true }, (err, addresses) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err);
    return;
  }
  
  console.log('✅ DNS resolution successful!');
  console.log('Resolved addresses:');
  addresses.forEach((addr, i) => {
    console.log(`  ${i + 1}. ${addr.address} (IPv${addr.family})`);
  });
  
  // Test TCP connection on port 6543
  const net = require('net');
  const port = 6543;
  
  console.log(`\n🔌 Testing TCP connection to ${hostname}:${port}...`);
  
  const socket = new net.Socket();
  const timeout = 5000; // 5 seconds
  
  socket.setTimeout(timeout);
  
  socket.on('connect', () => {
    console.log(`✅ Successfully connected to ${hostname}:${port}`);
    socket.destroy();
    process.exit(0);
  });
  
  socket.on('timeout', () => {
    console.error(`❌ Connection timed out after ${timeout}ms`);
    socket.destroy();
    process.exit(1);
  });
  
  socket.on('error', (err) => {
    console.error(`❌ Connection error: ${err.message}`);
    process.exit(1);
  });
  
  socket.connect(port, hostname);
});
