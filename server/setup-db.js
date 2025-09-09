import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const DB_NAME = process.env.DB_NAME || 'homeswift';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'homeswift123';

console.log('Setting up database...');

try {
  // Create database if it doesn't exist
  console.log(`Creating database ${DB_NAME} if it doesn't exist...`);
  execSync(`psql -U ${DB_USER} -c "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || createdb -U ${DB_USER} ${DB_NAME}`);
  
  // Run migrations
  console.log('Running migrations...');
  execSync('npx sequelize-cli db:migrate', { stdio: 'inherit' });
  
  console.log('Database setup completed successfully!');
} catch (error) {
  console.error('Error setting up database:', error);
  process.exit(1);
}
