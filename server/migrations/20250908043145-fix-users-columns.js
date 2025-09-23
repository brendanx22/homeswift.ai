'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Add columns one by one with transaction support
      const columns = [
        { name: 'avatar', type: 'TEXT', allowNull: true },
        { name: 'phone', type: 'VARCHAR(20)', allowNull: true },
        { name: 'address', type: 'TEXT', allowNull: true },
        { name: 'preferences', type: 'JSONB', allowNull: true, defaultValue: { notifications: true, newsletter: false } },
        { name: 'saved_properties', type: 'JSONB', allowNull: true, defaultValue: [] },
        { name: 'search_history', type: 'JSONB', allowNull: true, defaultValue: [] },
        { name: 'remember_token', type: 'VARCHAR(255)', allowNull: true },
        { name: 'role', type: 'VARCHAR(20)', allowNull: false, defaultValue: 'user' }
      ];

      for (const column of columns) {
        await queryInterface.addColumn(
          'users',
          column.name,
          {
            type: Sequelize[column.type.replace(/\(\d+\)/, '')],
            allowNull: column.allowNull,
            defaultValue: column.defaultValue
          },
          { transaction }
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const columns = [
      'avatar',
      'phone',
      'address',
      'preferences',
      'saved_properties',
      'search_history',
      'remember_token',
      'role'
    ];

    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      for (const column of columns) {
        await queryInterface.removeColumn('users', column, { transaction });
      }
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};