'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'avatar', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'phone', {
      type: Sequelize.STRING(20),
      allowNull: true
    });

    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'preferences', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: { notifications: true, newsletter: false }
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

    await queryInterface.addColumn('users', 'remember_token', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'user'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'avatar');
    await queryInterface.removeColumn('users', 'phone');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'preferences');
    await queryInterface.removeColumn('users', 'saved_properties');
    await queryInterface.removeColumn('users', 'search_history');
    await queryInterface.removeColumn('users', 'remember_token');
    await queryInterface.removeColumn('users', 'role');
  }
};