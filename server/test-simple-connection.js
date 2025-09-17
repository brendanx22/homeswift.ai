import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
  console.log('🔍 Testing database connection...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log('🔗 Using connection string:', 
    process.env.DATABASE_URL.replace(/:([^:]*?)@/, ':[HIDDEN_PASSWORD]@'));

  try {
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: console.log,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    });

    console.log('🔄 Attempting to connect to database...');
    await sequelize.authenticate();
    console.log('✅ Successfully connected to the database!');
    
    // Test a simple query
    const [results] = await sequelize.query("SELECT 'Database is working!' as status");
    console.log('📊 Query result:', results[0].status);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    if (error.original) {
      console.error('🔍 Original error:', error.original.message);
    }
    process.exit(1);
  }
}

testConnection();
