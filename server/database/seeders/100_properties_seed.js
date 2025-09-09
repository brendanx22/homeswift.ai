'use strict';

const { generateProperties } = require('../utils/propertyGenerator');

module.exports = {
  up: async (queryInterface) => {
    // Check if properties table exists and is empty
    const [results] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) FROM properties;`
    );
    
    if (parseInt(results[0].count) === 0) {
      // Generate 100 realistic properties
      const properties = generateProperties(100);
      
      // Insert properties
      await queryInterface.bulkInsert('properties', properties);
      
      console.log('Successfully seeded 100 properties');
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('properties', null, {});
  }
};
