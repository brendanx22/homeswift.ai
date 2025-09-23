import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new pg.Pool({
  user: process.env.SUPABASE_DB_USER,
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  password: process.env.SUPABASE_DB_PASSWORD,
  port: process.env.SUPABASE_DB_PORT || 6543,
  ssl: {
    rejectUnauthorized: false
  }
});

async function listTables() {
  const client = await pool.connect();
  
  try {
    console.log('📋 Listing all tables in the database...\n');
    
    // Get all tables in the public schema
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    if (result.rows.length === 0) {
      console.log('No tables found in the public schema');
      return;
    }
    
    console.log('Found the following tables:');
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Check for required tables
    const requiredTables = ['users', 'properties', 'property_images', 'user_favorites', 'sessions'];
    const existingTables = result.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing required tables:');
      missingTables.forEach(table => console.log(`- ${table}`));
    } else {
      console.log('\n✅ All required tables exist');
    }
    
  } catch (error) {
    console.error('❌ Error listing tables:');
    console.error(error);
  } finally {
    client.release();
    await pool.end();
  }
}

listTables();
