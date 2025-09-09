'use strict';

const sampleProperties = [
  {
    title: 'Modern Downtown Apartment',
    description: 'Beautiful modern apartment in the heart of downtown. Features floor-to-ceiling windows, stainless steel appliances, and a spacious balcony with city views.',
    price: 2500.00,
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    bedrooms: 2,
    bathrooms: 2.0,
    squareFeet: 1200,
    yearBuilt: 2018,
    propertyType: 'Apartment',
    status: 'For Rent',
    featured: true,
    images: [
      '/property-images/apartment-1.jpg',
      '/property-images/apartment-2.jpg'
    ]
  },
  {
    title: 'Luxury Family Home',
    description: 'Stunning family home with modern amenities. Features an open floor plan, gourmet kitchen, and a beautiful backyard with a pool.',
    price: 750000.00,
    address: '456 Oak Ave',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    bedrooms: 4,
    bathrooms: 3.5,
    squareFeet: 3200,
    yearBuilt: 2015,
    propertyType: 'House',
    status: 'For Sale',
    featured: true,
    images: [
      '/property-images/house-1.jpg',
      '/property-images/house-2.jpg'
    ]
  },
  {
    title: 'Cozy Studio in Downtown',
    description: 'Charming studio apartment in a prime location. Perfect for students or young professionals. Walking distance to restaurants and public transportation.',
    price: 1500.00,
    address: '789 Elm St',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    bedrooms: 0,
    bathrooms: 1.0,
    squareFeet: 500,
    yearBuilt: 2010,
    propertyType: 'Apartment',
    status: 'For Rent',
    featured: false,
    images: [
      '/property-images/studio-1.jpg',
      '/property-images/studio-2.jpg'
    ]
  }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Only seed if the table is empty
    const count = await queryInterface.sequelize.query('SELECT count(*) from properties;');
    const propertyCount = parseInt(count[0][0].count);
    
    if (propertyCount === 0) {
      await queryInterface.bulkInsert('properties', sampleProperties);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('properties', null, {});
  }
};
