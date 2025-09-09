'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: {
        notifications: true,
        newsletter: false
      }
    });

    await queryInterface.addColumn('users', 'saved_properties', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('users', 'search_history', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'avatar');
    await queryInterface.removeColumn('users', 'preferences');
    await queryInterface.removeColumn('users', 'saved_properties');
    await queryInterface.removeColumn('users', 'search_history');
  }
};
