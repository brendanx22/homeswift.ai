import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

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
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test query
    const [results] = await sequelize.query("SELECT current_database(), current_user, version()");
    console.log('Database Info:', results[0]);
    
    // Check if properties table exists
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tables in database:', tables.map(t => t.table_name));
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
