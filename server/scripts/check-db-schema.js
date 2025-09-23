import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'homeswift',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'homeswift123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false
  }
);

async function checkSchema() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Get all tables
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    console.log('\n📋 Database tables:');
    for (const table of tables) {
      const tableName = table.table_name;
      console.log(`\nTable: ${tableName}`);
      
      // Get columns for this table
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = '${tableName}'
        ORDER BY ordinal_position
      `);
      
      console.table(columns);
    }
  } catch (error) {
    console.error('❌ Error checking database schema:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkSchema();
