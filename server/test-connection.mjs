import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

console.log('🔍 Environment:', process.env.NODE_ENV || 'development');
console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL ? '*** (hidden for security) ***' : 'not set');

async function testConnection() {
  try {
    // Parse the database URL
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    const dbConfig = {
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1), // Remove leading '/'
      host: dbUrl.hostname,
      port: dbUrl.port,
      dialect: 'postgres',
      protocol: 'postgres',
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000,
        application_name: 'homeswift-test',
        options: '-c search_path=public'
      },
      logging: console.log
    };

    console.log('\n🔌 Testing database connection...');
    const sequelize = new Sequelize(dbConfig);
    
    try {
      await sequelize.authenticate();
      console.log('✅ Connection has been established successfully.');
      
      // Test a simple query
      const [results] = await sequelize.query('SELECT NOW()');
      console.log('⏰ Database time:', results[0].now);
      
      // List tables
      const [tables] = await sequelize.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
      );
      
      console.log('\n📋 Available tables:');
      tables.forEach((row, i) => console.log(`   ${i + 1}. ${row.table_name}`));
      
    } catch (error) {
      console.error('❌ Unable to connect to the database:', error);
    } finally {
      await sequelize.close();
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testConnection();
