const { Client } = require('pg');

// Direct connection parameters
const config = {
  user: 'postgres',
  host: 'aws-0-eu-west-2.pooler.tproaiqvkohrlxjmkgxt.supabase.co',
  database: 'postgres',
  password: 'homeswift.ai',
  port: 6543,
  ssl: {
    rejectUnauthorized: false
  }
};

async function testConnection() {
  const client = new Client(config);
  
  try {
    console.log('🔌 Attempting to connect to database...');
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', res.rows[0].now);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 The database host could not be found. This usually means:');
      console.log('1. You are not connected to the internet');
      console.log('2. The hostname is incorrect');
      console.log('3. There is a DNS resolution issue');
    } else if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Connection timed out. This could be due to:');
      console.log('1. Network connectivity issues');
      console.log('2. Firewall blocking the connection');
      console.log('3. The database server is not running or not accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. This could be due to:');
      console.log('1. The database server is not running');
      console.log('2. The port number is incorrect');
      console.log('3. The database user does not have permission to connect');
    }
    
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection();
