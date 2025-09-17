const net = require('net');
const dns = require('dns/promises');

async function testConnection() {
  const host = 'db.tproaiqvkohrlxjmkgxt.supabase.co';
  const port = 5432;

  try {
    // Test DNS resolution
    console.log(`Resolving DNS for ${host}...`);
    const addresses = await dns.lookup(host, { all: true });
    console.log('Resolved addresses:', JSON.stringify(addresses, null, 2));

    // Test TCP connection
    console.log(`\nAttempting to connect to ${host}:${port}...`);
    const socket = net.createConnection(port, host, () => {
      console.log('✅ Successfully connected to the database server!');
      socket.end();
      process.exit(0);
    });

    socket.setTimeout(5000);

    socket.on('timeout', () => {
      console.error('❌ Connection timeout');
      socket.destroy();
      process.exit(1);
    });

    socket.on('error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.error('Error code:', error.code);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
