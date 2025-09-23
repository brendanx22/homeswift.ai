import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { execSync } from 'child_process';

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
    
    // Get all migration files in order
    const migrationsPath = path.join(__dirname, 'database', 'migrations');
    const migrationFiles = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.js') && !file.endsWith('.old.js'))
      .sort();
    
    console.log(`\n📋 Found ${migrationFiles.length} migration files`);
    
    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL,
        PRIMARY KEY ("name")
      );
    `);
    
    // Get already executed migrations
    const [executedMigrations] = await sequelize.query(
      'SELECT "name" FROM "SequelizeMeta"',
      { type: sequelize.QueryTypes.SELECT }
    );
    
    const executedMigrationNames = executedMigrations.map(m => m.name);
    
    // Run new migrations
    for (const file of migrationFiles) {
      if (executedMigrationNames.includes(file)) {
        console.log(`✅ Already executed: ${file}`);
        continue;
      }
      
      console.log(`\n🔧 Running migration: ${file}`);
      
      // Import the migration
      const migration = await import(`file://${path.join(migrationsPath, file)}`);
      
      // Run the migration
      await migration.up(sequelize.getQueryInterface(), Sequelize);
      
      // Record the migration
      await sequelize.query(
        'INSERT INTO "SequelizeMeta" ("name") VALUES (?)',
        { replacements: [file] }
      );
      
      console.log(`✅ Applied migration: ${file}`);
    }
    
    console.log('\n🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

runMigrations();
