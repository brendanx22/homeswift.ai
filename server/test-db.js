import models from './models/index.js';

async function testDatabase() {
  try {
    console.log('🔍 Starting database test...');
    
    // Initialize the models and database connection
    console.log('Initializing models...');
    await models.initialize();
    
    // Test the database connection
    console.log('Testing database connection...');
    await models.sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Log database configuration
    const config = models.sequelize.config;
    console.log(`\n📊 Database Configuration:`);
    console.log(`- Database: ${config.database}`);
    console.log(`- Host: ${config.host}`);
    console.log(`- Port: ${config.port}`);
    console.log(`- Username: ${config.username}`);
    
    // Test querying properties
    console.log('\n🔍 Querying properties...');
    const properties = await models.Property.findAll({
      limit: 5,
      include: [{
        model: models.PropertyImage,
        as: 'propertyImages',
        attributes: ['id', 'image_url', 'is_primary']
      }]
    });
    
    if (properties && properties.length > 0) {
      console.log(`\n📋 Found ${properties.length} properties:`);
      properties.forEach((prop, index) => {
        console.log(`\n🏠 Property ${index + 1}:`);
        console.log(`  ID: ${prop.id}`);
        console.log(`  Title: ${prop.title || 'N/A'}`);
        console.log(`  Price: ${prop.price ? `$${prop.price}` : 'N/A'}`);
        console.log(`  Images: ${prop.propertyImages ? prop.propertyImages.length : 0}`);
      });
    } else {
      console.log('\nℹ️ No properties found in the database.');
      console.log('If you expected to see properties, please check:');
      console.log('1. If the database has any properties in the properties table');
      console.log('2. If the database user has SELECT permissions on the properties table');
    }
    
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during database test:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.original) {
      console.error('\nOriginal error details:');
      console.error('Code:', error.original.code);
      console.error('Detail:', error.original.detail);
      console.error('Table:', error.original.table);
    }
    
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Verify the database is running and accessible');
    console.error('2. Check database credentials in config/config.json');
    console.error('3. Ensure the database and tables exist');
    console.error('4. Verify the database user has proper permissions');
    
    process.exit(1);
  }
}

testDatabase();
