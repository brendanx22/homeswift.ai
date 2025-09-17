const { Client } = require('pg');
require('dotenv').config();

// Parse the database URL
const dbUrl = new URL(process.env.DATABASE_URL);

const client = new Client({
  user: dbUrl.username,
  host: dbUrl.hostname,
  database: dbUrl.pathname.slice(1), // remove leading '/'
  password: dbUrl.password,
  port: dbUrl.port,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    console.log('🔌 Attempting to connect to database...');
    await client.connect();
    console.log('✅ Connected to database!');
    
    const res = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', res.rows[0].now);
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    if (error.code) console.log('Error code:', error.code);
    if (error.address) console.log('Address that caused the error:', error.address);
  } finally {
    await client.end();
    console.log('🔌 Connection closed');
  }
}

testConnection();
