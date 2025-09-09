import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function listTables() {
  console.log('🔍 Connecting to Supabase database...');
  
  const sequelize = new Sequelize(
    process.env.SUPABASE_DB_NAME,
    process.env.SUPABASE_DB_USER,
    process.env.SUPABASE_DB_PASSWORD,
    {
      host: process.env.SUPABASE_DB_HOST,
      port: process.env.SUPABASE_DB_PORT || 6543,
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        },
        statement_timeout: 10000,
        idle_in_transaction_session_timeout: 10000
      },
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Successfully connected to Supabase!');
    
    // Get all tables in the public schema
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('\n📋 Tables in public schema:');
    if (results.length === 0) {
      console.log('No tables found in the public schema');
    } else {
      results.forEach(table => console.log(`- ${table.table_name}`));
    }
    
    // Check for required tables
    const requiredTables = ['users', 'properties', 'sessions'];
    const tableNames = results.map(t => t.table_name);
    const missingTables = requiredTables.filter(t => !tableNames.includes(t));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing required tables:');
      missingTables.forEach(table => console.log(`- ${table}`));
      console.log('\nRun database migrations to create these tables.');
    } else {
      console.log('\n✅ All required tables exist');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

listTables();
