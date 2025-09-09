const { Client } = require('pg');
require('dotenv').config({ path: '.env' });

async function testConnection() {
  // Construct the connection string from environment variables
  const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT || 6543}/${process.env.SUPABASE_DB_NAME}`;
  
  console.log('🔌 Testing connection to:', 
    `postgresql://${process.env.SUPABASE_DB_USER}:*****@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT || 6543}/${process.env.SUPABASE_DB_NAME}`
  );

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Successfully connected to the database!');
    
    // List all tables in the public schema
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in public schema:');
    if (res.rows.length === 0) {
      console.log('No tables found in the public schema');
    } else {
      res.rows.forEach(row => console.log(`- ${row.table_name}`));
    }
    
  } catch (error) {
    console.error('❌ Connection error:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    if (error.address) console.error('Address:', error.address);
    if (error.port) console.error('Port:', error.port);
  } finally {
    await client.end();
    process.exit(0);
  }
}

testConnection();
