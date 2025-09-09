import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Initialize Sequelize with production settings
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
      idle_in_transaction_session_timeout: 10000,
      application_name: 'homeswift-migrations'
    },
    pool: {
      max: 1,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

async function runMigrations() {
  console.log('🚀 Running database migrations...');
  
  try {
    // Test the connection first
    await sequelize.authenticate();
    console.log('✅ Connected to database successfully');
    
    // Get the query interface
    const queryInterface = sequelize.getQueryInterface();
    
    // Create SequelizeMeta table if it doesn't exist
    console.log('🔍 Checking for SequelizeMeta table...');
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'SequelizeMeta'
      );
    `);
    
    const metaTableExists = results[0].exists;
    
    if (!metaTableExists) {
      console.log('ℹ️ Creating SequelizeMeta table...');
      await queryInterface.createTable('SequelizeMeta', {
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
          primaryKey: true
        }
      });
      console.log('✅ Created SequelizeMeta table');
    }
    
    // Get all migration files
    const migrationsPath = path.join(__dirname, 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js'));
    
    console.log(`\n📋 Found ${migrationFiles.length} migration files`);
    
    // Run each migration
    for (const file of migrationFiles) {
      console.log(`\n🔧 Running migration: ${file}`);
      
      // Import the migration
      const migration = await import(`file://${path.join(migrationsPath, file)}`);
      
      // Run the migration
      await migration.up(queryInterface, Sequelize);
      
      // Record the migration in SequelizeMeta
      await queryInterface.bulkInsert('SequelizeMeta', [
        { name: file }
      ], { ignoreDuplicates: true });
      
      console.log(`✅ Applied migration: ${file}`);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMigrations();
