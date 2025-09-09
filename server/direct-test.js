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
    await client.connect();
    console.log('✅ Successfully connected to the database');
    
    const res = await client.query('SELECT NOW()');
    console.log('Database time:', res.rows[0].now);
    
    await client.end();
  } catch (error) {
    console.error('❌ Connection error:', error);
  }
}

testConnection();
