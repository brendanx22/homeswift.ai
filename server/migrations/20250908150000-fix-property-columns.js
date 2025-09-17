'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add any missing columns
    await queryInterface.addColumn('properties', 'zip_code', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'state'
    });

    // Rename columns to match model if needed
    try {
      await queryInterface.renameColumn('properties', 'zipCode', 'zip_code');
    } catch (e) {
      // Column might not exist, which is fine
      console.log('zipCode column does not exist, skipping rename');
    }

    try {
      await queryInterface.renameColumn('properties', 'squareFeet', 'square_feet');
    } catch (e) {
      console.log('squareFeet column does not exist, skipping rename');
    }

    try {
      await queryInterface.renameColumn('properties', 'yearBuilt', 'year_built');
    } catch (e) {
      console.log('yearBuilt column does not exist, skipping rename');
    }

    // Add any other missing columns from the model
    const columns = await queryInterface.describeTable('properties');
    
    if (!columns.property_type) {
      await queryInterface.addColumn('properties', 'property_type', {
        type: Sequelize.ENUM('House', 'Apartment', 'Condo', 'Townhouse', 'Land'),
        allowNull: false,
        defaultValue: 'House'
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if needed
    await queryInterface.removeColumn('properties', 'zip_code');
    // Note: Reverting renames would require additional logic
  }
};
