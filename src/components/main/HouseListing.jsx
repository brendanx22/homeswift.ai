import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../layout/Header';
import PropertyCard from '../common/PropertyCard';
import house1 from '../../assets/images/house1.jpg';
import house2 from '../../assets/images/house2.jpg';
import house3 from '../../assets/images/house3.jpg';
import house4 from '../../assets/images/house4.jpg';

const properties = [
  {
    id: "1",
    image: house1,
    title: "Modern Apartment in GRA",
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Rent",
    beds: 3,
    baths: 2,
    sqft: 1800
  },
  {
    id: "2",
    image: house2,
    title: "Luxury Villa",
    location: "GRA Phase 2",
    price: 25000000,
    type: "For Sale",
    beds: 5,
    baths: 4,
    sqft: 3500
  },
  {
    id: "3",
    image: house3,
    title: "Cozy Bungalow",
    location: "GRA Phase 1",
    price: 950000,
    duration: "year",
    type: "For Rent",
    beds: 2,
    baths: 2,
    sqft: 1500
  },
  {
    id: "4",
    image: house4,
    title: "Duplex in Prime Location",
    location: "GRA Phase 3",
    price: 18000000,
    type: "For Sale",
    beds: 4,
    baths: 3,
    sqft: 2800
  }
];

const HouseListings = () => {
  const navigate = useNavigate();

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Properties</h1>
          <p className="text-gray-600">
            Browse through our selection of premium properties
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HouseListings;