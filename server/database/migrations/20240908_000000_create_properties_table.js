'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zipCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bathrooms: {
        type: Sequelize.DECIMAL(3, 1),
        allowNull: false
      },
      squareFeet: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      yearBuilt: {
        type: Sequelize.INTEGER
      },
      propertyType: {
        type: Sequelize.ENUM('House', 'Apartment', 'Condo', 'Townhouse', 'Land'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('For Sale', 'For Rent', 'Sold', 'Pending'),
        allowNull: false
      },
      featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      images: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better query performance
    await queryInterface.addIndex('properties', ['city']);
    await queryInterface.addIndex('properties', ['price']);
    await queryInterface.addIndex('properties', ['propertyType']);
    await queryInterface.addIndex('properties', ['status']);
    await queryInterface.addIndex('properties', ['featured']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('properties');
  }
};
