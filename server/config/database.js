import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

class Database {
  constructor() {
    this.sequelize = this._initSequelize();
  }

  _initSequelize() {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🚀 Initializing Sequelize in PRODUCTION mode (Supabase)');
      return new Sequelize(
        process.env.SUPABASE_DB_NAME,
        process.env.SUPABASE_DB_USER,
        process.env.SUPABASE_DB_PASSWORD,
        {
          host: process.env.SUPABASE_DB_HOST,
          port: process.env.SUPABASE_DB_PORT || 6543,
          dialect: 'postgres',
          logging: process.env.NODE_ENV === 'development' ? console.log : false,
          dialectOptions: {
            ssl: {
              require: true,
              rejectUnauthorized: false
            },
            statement_timeout: 10000,
            idle_in_transaction_session_timeout: 10000,
            application_name: 'homeswift-production',
            options: '-c search_path=public'
          },
          pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
          }
        }
      );
    } else {
      console.log('💻 Initializing Sequelize in DEVELOPMENT mode (Local DB)');
      return new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || 5432,
          dialect: 'postgres',
          logging: console.log,
          dialectOptions: {
            statement_timeout: 10000,
            idle_in_transaction_session_timeout: 10000,
            application_name: 'homeswift-development'
          },
          pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
          },
          define: {
            timestamps: true,
            underscored: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
          }
        }
      );
    }
  }

  async connect() {
    try {
      console.log('🔍 Environment:', process.env.NODE_ENV || 'development');
      
      // Test the connection
      await this.sequelize.authenticate();
      console.log('✅ Database connection established successfully!');
      
      // Verify database structure
      try {
        const [results] = await this.sequelize.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public';
        `);
        console.log('📊 Available tables:', results.length ? results.map(r => r.table_name).join(', ') : 'No tables found');
      } catch (queryError) {
        console.warn('⚠️ Could not list tables - database might be empty or permissions issue:', queryError.message);
      }
      
      return this.sequelize;
      
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error.message);
      throw error;
    }
  }
}

export default Database;
