import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🚀 Testing database connection...');
console.log('🔍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'not set');

async function testConnection() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  try {
    // Parse the database URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    // Extract the project ID from the username (format: postgres.project_id)
    const projectId = dbUrl.username.includes('.') 
      ? dbUrl.username.split('.')[1]
      : dbUrl.username;
    
    const dbConfig = {
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1), // Remove leading '/'
      host: dbUrl.hostname,
      port: dbUrl.port || 5432,
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000,
        application_name: `homeswift-test-${projectId}`,
        options: '-c search_path=public'
      },
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    };

    console.log('\n🔌 Connection details:');
    console.log('   Host:', dbConfig.host);
    console.log('   Port:', dbConfig.port);
    console.log('   Database:', dbConfig.database);
    console.log('   User:', dbConfig.username);
    
    console.log('\n🔍 Attempting to connect...');
    
    // Try with connection string first
    try {
      console.log('   Trying with connection string...');
      const sequelize1 = new Sequelize(process.env.DATABASE_URL, dbConfig);
      await sequelize1.authenticate();
      console.log('✅ Connection successful with connection string!');
      await sequelize1.close();
      return;
    } catch (err1) {
      console.log('   ❌ Connection with string failed:', err1.message);
      console.log('   Trying with config object...');
      
      // If connection string fails, try with config object
      try {
        const sequelize2 = new Sequelize(dbConfig);
        await sequelize2.authenticate();
        console.log('✅ Connection successful with config object!');
        
        // Test a simple query
        const [result] = await sequelize2.query('SELECT NOW() as now');
        console.log('⏰ Server time:', result[0].now);
        
        await sequelize2.close();
        return;
      } catch (err2) {
        console.error('❌ Both connection attempts failed');
        console.error('Last error:', err2.message);
        throw err2;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) console.error('   Code:', error.code);
    if (error.address) console.error('   Address:', error.address);
    if (error.port) console.error('   Port:', error.port);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 The database host could not be resolved. Possible issues:');
      console.log('1. Check your internet connection');
      console.log('2. Verify the hostname is correct');
      console.log('3. Try using a VPN or different network');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Connection refused. Possible issues:');
      console.log('1. The database server is not running');
      console.log('2. The port number is incorrect');
      console.log('3. A firewall is blocking the connection');
    }
    
    process.exit(1);
  }
}

// Run the test
testConnection()
  .then(() => console.log('\n✨ Test completed successfully!'))
  .catch(() => process.exit(1));
