// Simple script to debug database connection issues
console.log('🔍 Starting debug script...');

// 1. Check if we can load required modules
try {
  console.log('1. Loading required modules...');
  const pg = require('pg');
  require('dotenv').config();
  console.log('   ✅ Modules loaded successfully');
  
  // 2. Check environment variables
  console.log('\n2. Checking environment variables...');
  const requiredVars = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`   ❌ Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
  
  console.log('   ✅ All required environment variables are present');
  console.log('   ℹ️  DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'Not set');
  
  // 3. Parse database URL
  console.log('\n3. Parsing database URL...');
  let dbConfig;
  try {
    const { URL } = require('url');
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    dbConfig = {
      user: dbUrl.username,
      host: dbUrl.hostname,
      database: dbUrl.pathname.substring(1), // Remove leading '/'
      password: dbUrl.password,
      port: dbUrl.port,
      ssl: { rejectUnauthorized: false }
    };
    
    console.log('   ✅ Successfully parsed database URL');
    console.log('   ℹ️  Host:', dbConfig.host);
    console.log('   ℹ️  Port:', dbConfig.port);
    console.log('   ℹ️  Database:', dbConfig.database);
    
  } catch (parseError) {
    console.error('   ❌ Failed to parse DATABASE_URL:', parseError.message);
    console.log('   ℹ️  Using direct configuration instead');
    
    // Fallback to direct configuration
    dbConfig = {
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'postgres',
      password: process.env.DB_PASSWORD || '',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // 4. Test database connection
  console.log('\n4. Testing database connection...');
  const client = new pg.Client(dbConfig);
  
  // Set a timeout for the connection attempt
  const connectionTimeout = setTimeout(() => {
    console.error('   ❌ Connection timeout after 10 seconds');
    process.exit(1);
  }, 10000);
  
  try {
    console.log('   🔌 Attempting to connect...');
    await client.connect();
    clearTimeout(connectionTimeout);
    
    console.log('   ✅ Successfully connected to the database!');
    
    // 5. Run a simple query
    console.log('\n5. Running test query...');
    const result = await client.query('SELECT NOW() AS current_time, version() AS version');
    console.log('   ✅ Query executed successfully');
    console.log('   ⏰ Database time:', result.rows[0].current_time);
    console.log('   📊 Database version:', result.rows[0].version.split('\n')[0]);
    
    // 6. List available tables
    try {
      console.log('\n6. Listing available tables...');
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public';
      `);
      
      if (tables.rows.length > 0) {
        console.log('   📋 Available tables:');
        tables.rows.forEach((row, index) => {
          console.log(`      ${index + 1}. ${row.table_name}`);
        });
      } else {
        console.log('   ℹ️  No tables found in the public schema');
      }
    } catch (tableError) {
      console.warn('   ⚠️  Could not list tables (this might be normal):', tableError.message);
    }
    
  } catch (error) {
    clearTimeout(connectionTimeout);
    console.error('   ❌ Connection error:', error.message);
    console.error('   🔍 Error details:', {
      code: error.code,
      address: error.address,
      port: error.port,
      stack: error.stack
    });
    
    // Provide troubleshooting tips based on the error
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Troubleshooting: The database host could not be resolved.');
      console.log('   - Check your internet connection');
      console.log('   - Verify the hostname in your DATABASE_URL is correct');
      console.log('   - Try pinging the database host to check connectivity');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting: The database server refused the connection.');
      console.log('   - Verify the database server is running');
      console.log('   - Check if the port number is correct');
      console.log('   - Ensure the database user has permission to connect');
    } else if (error.code === '28P01') {
      console.log('\n💡 Troubleshooting: Authentication failed.');
      console.log('   - Check your database username and password');
      console.log('   - Verify the user has the correct permissions');
    } else {
      console.log('\n💡 Troubleshooting: An unknown error occurred.');
      console.log('   - Check the database server logs for more information');
      console.log('   - Verify your database configuration');
    }
    
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
    console.log('\n🔌 Database connection closed');
  }
  
} catch (error) {
  console.error('\n❌ Fatal error:', error.message);
  if (error.code === 'MODULE_NOT_FOUND') {
    console.log('\n💡 Please install the required dependencies:');
    console.log('   npm install pg dotenv');
  }
  process.exit(1);
}
