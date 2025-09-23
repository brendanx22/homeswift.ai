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
    logging: console.log
  }
);

async function checkColumns() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check properties table columns
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'properties'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Properties table columns:');
    console.table(columns);
    
    // Check if zip_code exists
    const hasZipCode = columns.some(col => col.column_name === 'zip_code');
    console.log(`\n🔍 zip_code column exists: ${hasZipCode}`);
    
    if (!hasZipCode) {
      console.log('\n💡 The zip_code column is missing. You need to add it to the database.');
    }
    
  } catch (error) {
    console.error('❌ Error checking columns:');
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
