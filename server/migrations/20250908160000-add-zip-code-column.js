'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add zip_code column if it doesn't exist
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'properties' 
          AND column_name = 'zip_code'
        ) THEN
          ALTER TABLE properties ADD COLUMN zip_code VARCHAR(255);
          RAISE NOTICE 'Added zip_code column to properties table';
        ELSE
          RAISE NOTICE 'zip_code column already exists in properties table';
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('properties', 'zip_code');
  }
};
