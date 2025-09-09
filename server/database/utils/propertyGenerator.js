'use strict';

const faker = require('faker');
const path = require('path');

const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land'];
const statuses = ['For Sale', 'For Rent', 'Sold', 'Pending'];
const cities = [
  { city: 'New York', state: 'NY' },
  { city: 'Los Angeles', state: 'CA' },
  { city: 'Chicago', state: 'IL' },
  { city: 'Houston', state: 'TX' },
  { city: 'Phoenix', state: 'AZ' },
  { city: 'Philadelphia', state: 'PA' },
  { city: 'San Antonio', state: 'TX' },
  { city: 'San Diego', state: 'CA' },
  { city: 'Dallas', state: 'TX' },
  { city: 'San Jose', state: 'CA' }
];

const generateProperties = (count) => {
  const properties = [];
  
  for (let i = 0; i < count; i++) {
    const location = faker.random.arrayElement(cities);
    const bedrooms = faker.random.number({ min: 1, max: 5 });
    const bathrooms = bedrooms === 1 ? 1 : faker.random.number({ min: 1, max: bedrooms });
    const squareFeet = faker.random.number({ 
      min: 500, 
      max: 4000,
      precision: 100
    });
    
    // Generate 2-5 random images from your existing property-images
    const imageCount = faker.random.number({ min: 2, max: 5 });
    const images = [];
    
    for (let j = 0; j < imageCount; j++) {
      images.push(`/property-images/apartment-${faker.random.number({ min: 1, max: 50 })}.jpg`);
    }
    
    properties.push({
      title: faker.lorem.words(faker.random.number({ min: 3, max: 6 })),
      description: faker.lorem.paragraphs(faker.random.number({ min: 2, max: 4 })),
      price: faker.random.number({
        min: 100000,
        max: 2000000,
        precision: 1000
      }),
      address: faker.address.streetAddress(),
      city: location.city,
      state: location.state,
      zipCode: faker.address.zipCode(),
      bedrooms,
      bathrooms,
      squareFeet,
      yearBuilt: faker.random.number({ min: 1950, max: 2023 }),
      propertyType: faker.random.arrayElement(propertyTypes),
      status: faker.random.arrayElement(statuses),
      featured: faker.random.boolean(),
      images,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  return properties;
};

module.exports = { generateProperties };
