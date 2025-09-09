'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('properties', 'zip_code', {
      type: Sequelize.STRING,
      allowNull: true, // Set to false if the column should be required
      after: 'state'   // Optional: specify where to add the column
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('properties', 'zip_code');
  }
};
