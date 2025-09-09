const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  // Parse the DATABASE_URL
  const dbUrl = new URL(process.env.DATABASE_URL);
  
  const client = new Client({
    user: dbUrl.username,
    host: dbUrl.hostname,
    database: dbUrl.pathname.substring(1), // Remove leading '/'
    password: dbUrl.password,
    port: dbUrl.port,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    console.log(`Host: ${dbUrl.hostname}, Database: ${dbUrl.pathname.substring(1)}`);
    
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', res.rows[0].now);
    
    // Test if we can query the database
    try {
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      console.log('📊 Available tables:', tables.rows.map(r => r.table_name).join(', '));
    } catch (queryError) {
      console.log('ℹ️ Could not list tables (this might be normal if no tables exist yet):', queryError.message);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error code:', error.code);
    
    if (error.code === 'ENOTFOUND') {
      console.error('\n⚠️  DNS resolution failed. This usually means:');
      console.error('1. You are not connected to the internet');
      console.error('2. The hostname is incorrect');
      console.error('3. There is a network issue preventing DNS resolution');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection timed out. This could be due to:');
      console.error('1. Network connectivity issues');
      console.error('2. Firewall blocking the connection');
      console.error('3. The database server is not running or not accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n⚠️  Connection refused. This could be due to:');
      console.error('1. The database server is not running');
      console.error('2. The port number is incorrect');
      console.error('3. The database user does not have permission to connect');
    }
    
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection();
