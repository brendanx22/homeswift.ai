const { Pool } = require('pg');
require('dotenv').config();

// Log the environment variables for debugging
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Create a new connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Pool configuration
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 10000, // How long to wait for a connection to be established
});

// Test the connection
async function testConnection() {
  console.log('\n🔌 Testing database connection...');
  
  let client;
  try {
    // Get a client from the pool
    console.log('   Acquiring client from pool...');
    client = await pool.connect();
    console.log('   ✅ Successfully connected to the database!');
    
    // Run a simple query
    console.log('\n🔍 Running test query...');
    const result = await client.query('SELECT NOW() AS current_time');
    console.log('   ✅ Query executed successfully');
    console.log('   ⏰ Database time:', result.rows[0].current_time);
    
    // Try to list tables
    try {
      console.log('\n📋 Listing available tables...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      
      if (tables.rows.length > 0) {
        console.log('   Available tables:');
        tables.rows.forEach((row, index) => {
          console.log(`   ${index + 1}. ${row.table_name}`);
        });
      } else {
        console.log('   ℹ️  No tables found in the public schema');
      }
    } catch (tableError) {
      console.warn('   ⚠️  Could not list tables (this might be normal for a new database):', tableError.message);
    }
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error details:', {
      code: error.code,
      address: error.address,
      port: error.port,
      stack: error.stack
    });
    
    // Provide troubleshooting tips based on the error
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 The database host could not be resolved. This usually means:');
      console.log('1. You are not connected to the internet');
      console.log('2. The hostname is incorrect');
      console.log('3. There is a DNS resolution issue');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'CONNECTION_TIMEOUT') {
      console.log('\n💡 Connection timed out. This could be due to:');
      console.log('1. Network connectivity issues');
      console.log('2. Firewall blocking the connection');
      console.log('3. The database server is not running or not accessible');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. This could be due to:');
      console.log('1. The database server is not running');
      console.log('2. The port number is incorrect');
      console.log('3. The database user does not have permission to connect');
    } else if (error.code === '28P01') {
      console.log('\n💡 Authentication failed. This could be due to:');
      console.log('1. Incorrect username or password');
      console.log('2. The user does not have permission to access the database');
      console.log('3. The user does not exist');
    }
    
  } finally {
    // Release the client back to the pool
    if (client) {
      console.log('\n🔄 Releasing client back to the pool...');
      client.release();
    }
    
    // Close the pool
    console.log('\n🔌 Closing the connection pool...');
    await pool.end();
    console.log('✅ Connection pool closed');
  }
}

// Run the test
testConnection().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
