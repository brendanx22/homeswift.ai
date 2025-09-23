const { Client } = require('pg');
require('dotenv').config();

async function testConnection(ipVersion = 4) {
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  const config = {
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.slice(1),
    port: dbUrl.port,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
    // Force IP version
    connection: {
      host: dbUrl.hostname.replace(/^\[|\]$/g, ''),
      family: ipVersion
    }
  };

  const client = new Client(config);
  
  try {
    console.log(`🔌 Testing IPv${ipVersion} connection to ${config.connection.host}...`);
    await client.connect();
    const res = await client.query('SELECT NOW()');
    console.log(`✅ IPv${ipVersion} Success! Database time:`, res.rows[0].now);
    return true;
  } catch (error) {
    console.error(`❌ IPv${ipVersion} Failed:`, error.message);
    return false;
  } finally {
    await client.end().catch(() => {});
  }
}

async function runTests() {
  console.log('🚀 Starting connection tests...');
  
  // Test IPv4
  const ipv4Success = await testConnection(4);
  
  // Test IPv6 if IPv4 failed
  if (!ipv4Success) {
    console.log('\n🔄 Trying IPv6...');
    await testConnection(6);
  }
  
  console.log('\n🔍 Connection test completed.');
}

runTests().catch(console.error);
