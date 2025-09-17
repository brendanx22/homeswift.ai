const { Client } = require('pg');

// Hardcoded connection details
const config = {
  user: 'postgres',
  host: 'aws-0-eu-west-2.pooler.tproaiqvkohrlxjmkgxt.supabase.co',
  database: 'postgres',
  password: 'homeswift.ai',
  port: 6543,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
};

console.log('🔌 Testing database connection with hardcoded values...');
console.log(`   Host: ${config.host}:${config.port}`);
console.log(`   Database: ${config.database}`);
console.log(`   User: ${config.user}`);

const client = new Client(config);

// Set a timeout for the entire test
const testTimeout = setTimeout(() => {
  console.error('❌ Test timed out after 10 seconds');
  process.exit(1);
}, 10000);

client.connect()
  .then(() => {
    console.log('✅ Successfully connected to the database!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('⏰ Database time:', res.rows[0].now);
    return client.query("SELECT datname FROM pg_database WHERE datistemplate = false;");
  })
  .then(res => {
    console.log('\n📊 Available databases:');
    res.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.datname}`);
    });
    clearTimeout(testTimeout);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Connection error:', err.message);
    console.error('Error code:', err.code);
    clearTimeout(testTimeout);
    process.exit(1);
  });
