import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new pg.Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'homeswift',
  password: process.env.DB_PASSWORD || 'homeswift123',
  port: process.env.DB_PORT || 5432,
});

async function checkDatabase() {
  const client = await pool.connect();
  try {
    console.log('✅ Connected to PostgreSQL database');
    
    // Check if properties table exists
    const tableExists = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'properties');"
    );
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Properties table does not exist');
      return;
    }
    
    console.log('✅ Properties table exists');
    
    // Get columns from properties table
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'properties'
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Properties table columns:');
    console.table(columns.rows);
    
    // Check for required columns
    const requiredColumns = ['id', 'title', 'price', 'address', 'city', 'state', 'zip_code'];
    const missingColumns = [];
    
    for (const col of requiredColumns) {
      if (!columns.rows.some(c => c.column_name === col)) {
        missingColumns.push(col);
      }
    }
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing required columns:', missingColumns.join(', '));
      console.log('\n💡 Run this SQL to add the missing columns:');
      for (const col of missingColumns) {
        console.log(`ALTER TABLE properties ADD COLUMN ${col} VARCHAR(255);`);
      }
    } else {
      console.log('\n✅ All required columns exist');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:');
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

checkDatabase();
