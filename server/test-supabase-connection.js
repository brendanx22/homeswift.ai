import Database from './config/database.js';

async function testConnection() {
  console.log('🔍 Testing Supabase database connection...');
  
  try {
    const db = new Database();
    await db.connect();
    
    // Test query to verify connection
    const [results] = await db.sequelize.query('SELECT version();');
    console.log('✅ Successfully connected to Supabase!');
    console.log('Database version:', results[0].version);
    
    // Test a simple query to the users table
    try {
      const [users] = await db.sequelize.query('SELECT * FROM users LIMIT 1;');
      console.log('✅ Successfully queried users table');
      if (users.length > 0) {
        console.log('Found user:', users[0].email || 'No email field');
      } else {
        console.log('No users found in the database');
      }
    } catch (err) {
      console.warn('⚠️ Could not query users table - it might not exist yet');
      console.warn('Error details:', err.message);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.parent) {
      console.error('Database error code:', error.parent.code);
      console.error('Database error details:', error.parent.detail);
      console.error('Database error hint:', error.parent.hint);
    }
    
    console.error('\nTroubleshooting tips:');
    console.log('1. Verify your DATABASE_URL in Vercel environment variables');
    console.log('2. Check if your Supabase database is running and accessible');
    console.log('3. Make sure your IP is whitelisted in Supabase (if using IP restrictions)');
    console.log('4. Verify your database credentials and connection parameters');
    
    process.exit(1);
  }
}

testConnection();
