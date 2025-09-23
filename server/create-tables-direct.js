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

// SQL for creating tables
const SQL_SCRIPTS = [
  // Users table
  `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    email_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Properties table
  `
  CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'United States',
    bedrooms INTEGER,
    bathrooms DECIMAL(3, 1),
    square_feet INTEGER,
    year_built INTEGER,
    property_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'available',
    featured BOOLEAN DEFAULT false,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // Property Images table
  `
  CREATE TABLE IF NOT EXISTS property_images (
    id SERIAL PRIMARY KEY,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
  `,
  
  // User Favorites table
  `
  CREATE TABLE IF NOT EXISTS user_favorites (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
  );
  `,
  
  // Sessions table (for auth)
  `
  CREATE TABLE IF NOT EXISTS sessions (
    sid VARCHAR(255) PRIMARY KEY,
    sess JSON NOT NULL,
    expire TIMESTAMP(6) NOT NULL
  );
  `
];

async function createTables() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('🚀 Creating database tables...');
    
    for (const [index, sql] of SQL_SCRIPTS.entries()) {
      console.log(`\n🔧 Running script ${index + 1}/${SQL_SCRIPTS.length}...`);
      await client.query(sql);
      console.log('✅ Table created/verified');
    }
    
    await client.query('COMMIT');
    console.log('\n🎉 All tables created successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error creating tables:');
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTables()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
