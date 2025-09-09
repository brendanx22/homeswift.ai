import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

class Database {
  constructor() {
    this.sequelize = null;
  }

  async connect() {
    try {
      // Use DATABASE_URL if available, otherwise fall back to individual parameters
      const connectionConfig = process.env.DATABASE_URL 
        ? {
            connectionString: process.env.DATABASE_URL,
            dialect: 'postgres',
            dialectOptions: {
              ssl: {
                require: true,
                rejectUnauthorized: false // For self-signed certificates
              }
            },
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
              max: 10,
              min: 0,
              acquire: 30000,
              idle: 10000
            }
          }
        : {
            database: process.env.DB_NAME || 'homeswift',
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'homeswift123',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            dialect: 'postgres',
            logging: process.env.NODE_ENV === 'development' ? console.log : false,
            pool: {
              max: 10,
              min: 0,
              acquire: 30000,
              idle: 10000
            }
          };

      this.sequelize = new Sequelize(connectionConfig);

      // Test the connection with detailed error handling
      try {
        await this.sequelize.authenticate();
        console.log('✅ PostgreSQL connection has been established successfully.');
        
        // Verify database structure
        try {
          const [results] = await this.sequelize.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
          `);
          console.log('📊 Available tables:', results.map(r => r.table_name).join(', '));
        } catch (queryError) {
          console.warn('⚠️ Could not list tables - database might be empty or permissions issue:', queryError.message);
        }
        
        return this.sequelize;
      } catch (authError) {
        console.error('❌ Authentication failed:', authError.message);
        if (authError.original) {
          console.error('❌ Original error:', authError.original);
        }
        throw authError;
      }
    } catch (error) {
      console.error('❌ Failed to connect to the database:', error.message);
      throw error;
    }
  }
}

export default Database;
