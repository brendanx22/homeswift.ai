import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// Create a direct connection to PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'homeswift',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'homeswift123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Test authentication
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    console.log('\n🔍 Running test query...');
    const [results] = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    
    console.log('\n📋 Found tables:');
    results.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check if properties table exists
    const [properties] = await sequelize.query("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties'");
    
    if (properties[0].count > 0) {
      console.log('\n✅ Properties table exists');
      const [propCount] = await sequelize.query("SELECT COUNT(*) as count FROM properties");
      console.log(`📊 Properties in database: ${propCount[0].count}`);
    } else {
      console.log('\n❌ Properties table does not exist');
    }
    
  } catch (error) {
    console.error('\n❌ Error:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    
    if (error.original) {
      console.error('\nOriginal error:');
      console.error('Code:', error.original.code);
      console.error('Detail:', error.original.detail);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Is PostgreSQL running?');
    console.error('2. Check database credentials in .env or config/config.json');
    console.error('3. Verify the database and user exist');
    console.error('4. Check if the user has proper permissions');
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testConnection();
