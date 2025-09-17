import models from './models/index.js';

async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Initialize models and database connection
    await models.initialize();
    
    // Test the database connection
    await models.sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Test a simple query
    const properties = await models.Property.findAll({ limit: 1 });
    console.log(`✅ Successfully connected to database. Found ${properties.length} properties.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
}

testDatabaseConnection();
