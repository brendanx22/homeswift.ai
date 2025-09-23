const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  // Direct connection using environment variables
  const client = new Client({
    host: process.env.SUPABASE_DB_HOST,
    port: process.env.SUPABASE_DB_PORT || 6543,
    user: process.env.SUPABASE_DB_USER,
    password: process.env.SUPABASE_DB_PASSWORD,
    database: process.env.SUPABASE_DB_NAME,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    // Test query
    const res = await client.query('SELECT NOW()');
    console.log('⏰ Database time:', res.rows[0].now);
    
    // List tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in public schema:');
    if (tables.rows.length === 0) {
      console.log('No tables found in the public schema');
    } else {
      tables.rows.forEach(row => console.log(`- ${row.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Connection error:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === '28P01') {
      console.error('\n🔑 Authentication failed. Please check your database credentials in the .env file.');
      console.error('Make sure you are using the correct username and password for your Supabase database.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.error('\n🔌 Connection refused. Please check:');
      console.error('1. Database host and port are correct');
      console.error('2. The database server is running and accessible');
      console.error('3. Your firewall allows connections to the database port');
    }
    
  } finally {
    await client.end();
    process.exit(0);
  }
}

testConnection();
