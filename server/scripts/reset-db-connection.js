import database from '../config/database.js';
import { Sequelize } from 'sequelize';

async function resetDatabaseConnection() {
  console.log('🔁 Resetting database connection...');
  
  try {
    // Close the existing connection if it exists
    if (database.sequelize) {
      console.log('Closing existing database connection...');
      await database.sequelize.close();
      console.log('✅ Database connection closed');
    }

    // Re-initialize the database connection
    console.log('Initializing new database connection...');
    const sequelize = new Sequelize(
      process.env.SUPABASE_DB_NAME || 'postgres',
      process.env.SUPABASE_DB_USER || 'postgres',
      process.env.SUPABASE_DB_PASSWORD,
      {
        host: process.env.SUPABASE_DB_HOST,
        port: process.env.SUPABASE_DB_PORT || 5432,
        dialect: 'postgres',
        logging: console.log,
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false
          },
          statement_timeout: 10000,
          idle_in_transaction_session_timeout: 10000,
          application_name: `homeswift-${process.env.NODE_ENV || 'development'}`,
        },
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // Test the connection
    console.log('Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');

    // Get database version
    const [results] = await sequelize.query('SELECT version()');
    console.log('Database version:', results[0].version);

    // Close the connection
    await sequelize.close();
    console.log('✅ Database connection closed cleanly');
    
  } catch (error) {
    console.error('❌ Error resetting database connection:', error);
    process.exit(1);
  }
}

// Run the reset function
resetDatabaseConnection();
