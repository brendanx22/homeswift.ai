import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'homeswift',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'homeswift123',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: console.log,
    }
  );

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if tables exist
    const [tables] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );

    console.log('\n📋 Database tables:');
    if (tables.length > 0) {
      tables.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
    } else {
      console.log('No tables found in the database.');
    }

    // Check if properties table exists
    const [propertiesTable] = await sequelize.query(
      "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'properties'"
    );

    if (propertiesTable.length > 0) {
      console.log('\n✅ Properties table exists');
      const [count] = await sequelize.query('SELECT COUNT(*) as count FROM properties');
      console.log(`📊 Number of properties: ${count[0].count}`);
    } else {
      console.log('\n❌ Properties table does not exist');
    }

  } catch (error) {
    console.error('\n❌ Database connection error:');
    console.error('Name:', error.name);
    console.error('Message:', error.message);
    
    if (error.original) {
      console.error('\nOriginal error:');
      console.error('Code:', error.original.code);
      console.error('Detail:', error.original.detail);
    }
  } finally {
    await sequelize.close();
  }
}

checkDatabase();
