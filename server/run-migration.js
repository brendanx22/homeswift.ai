import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

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

async function runMigrations() {
  const transaction = await sequelize.transaction();
  
  try {
    // Create migrations table if it doesn't exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        "name" VARCHAR(255) NOT NULL UNIQUE PRIMARY KEY
      );
    `, { transaction });

    // Get all migration files
    const migrationsDir = path.join(process.cwd(), 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();

    // Get already applied migrations
    const [appliedMigrations] = await sequelize.query(
      'SELECT "name" FROM "SequelizeMeta";',
      { transaction }
    );
    
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Apply new migrations
    for (const file of migrationFiles) {
      if (!appliedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}`);
        const migration = await import(`./database/migrations/${file}`);
        await migration.up({ 
          context: { queryInterface: sequelize.getQueryInterface(), Sequelize },
          queryInterface: sequelize.getQueryInterface(),
          Sequelize 
        });
        
        // Record the migration
        await sequelize.query(
          'INSERT INTO "SequelizeMeta" ("name") VALUES (?);',
          { replacements: [file], transaction }
        );
        
        console.log(`Applied migration: ${file}`);
      }
    }

    await transaction.commit();
    console.log('All migrations completed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

runMigrations();
