'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('property_images', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      property_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'properties',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      caption: {
        type: Sequelize.STRING,
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index on property_id for better query performance
    await queryInterface.addIndex('property_images', ['property_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('property_images');
  }
};
