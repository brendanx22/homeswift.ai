import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const DB_NAME = process.env.DB_NAME || 'homeswift';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'homeswift123';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

// First, connect to the default 'postgres' database to check if our database exists
const adminSequelize = new Sequelize('postgres', DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: console.log,
});

async function setupDatabase() {
  try {
    console.log('🔍 Checking if database exists...');
    
    // Check if database exists
    const [results] = await adminSequelize.query(
      `SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'`
    );
    
    if (results.length > 0) {
      console.log(`✅ Database '${DB_NAME}' already exists`);
    } else {
      console.log(`🔄 Database '${DB_NAME}' does not exist, creating...`);
      await adminSequelize.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`✅ Database '${DB_NAME}' created successfully`);
    }
    
    // Now connect to the actual database
    const dbSequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      logging: console.log,
    });
    
    // Test the connection
    await dbSequelize.authenticate();
    console.log('\n✅ Successfully connected to the database');
    
    // Check if tables exist
    const [tables] = await dbSequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('\n📋 Database tables:');
    if (tables.length > 0) {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found in the database.');
      console.log('\n💡 Run migrations to create the necessary tables:');
      console.log('npx sequelize-cli db:migrate');
    }
    
  } catch (error) {
    console.error('\n❌ Error setting up database:');
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
    console.error('3. Verify the PostgreSQL user has permission to create databases');
  } finally {
    await adminSequelize.close();
    process.exit(0);
  }
}

setupDatabase();
