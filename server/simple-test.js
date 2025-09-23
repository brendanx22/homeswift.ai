console.log('Starting simple test...');

// Basic test to see if the script runs
console.log('Script is running!');

// Try to require pg
let pg;
try {
  pg = require('pg');
  console.log('✅ pg module loaded successfully');
  console.log('pg version:', pg.version);
} catch (err) {
  console.error('❌ Failed to load pg module:', err);
  process.exit(1);
}

// Try to load environment variables
try {
  require('dotenv').config();
  console.log('✅ Environment variables loaded');
  
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }
  
  console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL.replace(/:([^:]*?)@/, ':*****@'));
} catch (err) {
  console.error('❌ Failed to load environment variables:', err);
  process.exit(1);
}

// Try to create a client
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Try to connect
console.log('🔌 Attempting to connect to database...');
client.connect()
  .then(() => {
    console.log('✅ Successfully connected to the database!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('⏰ Database time:', res.rows[0].now);
    return client.end();
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    console.error('Error code:', err.code);
    if (err.address) console.error('Address:', err.address);
    if (err.port) console.error('Port:', err.port);
    return client.end().catch(() => {});
  });
