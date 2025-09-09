import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

console.log('Testing database connection...');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT NOW()');
    console.log('Database time:', results[0].now);
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
