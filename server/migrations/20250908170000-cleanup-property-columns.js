'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if postal_code exists and zip_code is empty, then copy data
    await queryInterface.sequelize.query(`
      DO $$
      BEGIN
        -- If zip_code exists and is empty, but postal_code has data, copy it over
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'properties' 
          AND column_name = 'zip_code'
        ) AND EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name = 'properties' 
          AND column_name = 'postal_code'
        ) THEN
          UPDATE properties 
          SET zip_code = postal_code 
          WHERE (zip_code IS NULL OR zip_code = '') 
          AND postal_code IS NOT NULL;
          
          -- Drop the postal_code column since we're standardizing on zip_code
          ALTER TABLE properties DROP COLUMN IF EXISTS postal_code;
        END IF;
      END $$;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // In case we need to revert, we'll add back the postal_code column
    await queryInterface.addColumn('properties', 'postal_code', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    // Copy data back from zip_code to postal_code
    await queryInterface.sequelize.query(`
      UPDATE properties 
      SET postal_code = zip_code 
      WHERE postal_code IS NULL AND zip_code IS NOT NULL;
    `);
  }
};
