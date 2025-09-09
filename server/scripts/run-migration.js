import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Configure environment variables
dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database configuration
const sequelize = new Sequelize(
  process.env.DB_NAME || 'homeswift',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'homeswift123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  }
);

// Function to run migrations
async function runMigrations() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Read and execute the migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', '003_add_missing_columns.js');
    const migration = await import(migrationPath);
    
    console.log('🔄 Running migration...');
    await migration.up(sequelize.getQueryInterface(), Sequelize);
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migrations
runMigrations();
