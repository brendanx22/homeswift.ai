const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', res.rows[0].now);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error code:', error.code);
    if (error.address) console.error('Address:', error.address);
    if (error.port) console.error('Port:', error.port);
  } finally {
    await client.end();
  }
}

testConnection();
