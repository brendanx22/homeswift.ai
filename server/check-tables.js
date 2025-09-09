import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const client = new Client({
  user: process.env.SUPABASE_DB_USER,
  host: process.env.SUPABASE_DB_HOST,
  database: process.env.SUPABASE_DB_NAME,
  password: process.env.SUPABASE_DB_PASSWORD,
  port: process.env.SUPABASE_DB_PORT || 6543,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  try {
    await client.connect();
    console.log('✅ Successfully connected to the database!\n');
    
    // List all tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in the database:');
    console.table(res.rows);
    
    // Check for required tables
    const requiredTables = ['users', 'properties', 'property_images', 'user_favorites', 'sessions'];
    const existingTables = res.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('\n❌ Missing required tables:');
      missingTables.forEach(table => console.log(`- ${table}`));
    } else {
      console.log('\n✅ All required tables exist');
    }
    
  } catch (error) {
    console.error('❌ Error connecting to the database:');
    console.error(error);
  } finally {
    await client.end();
  }
}

checkTables();
