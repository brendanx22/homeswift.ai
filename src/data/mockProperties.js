// Mock property data for prototype
export const mockProperties = [
  {
    id: 1,
    title: "Modern 2BR Apartment in Victoria Island",
    price: "₦2,500,000",
    location: "Victoria Island, Lagos",
    bedrooms: 2,
    bathrooms: 2,
    area: "1,200 sqft",
    type: "Apartment",
    status: "For Rent",
    image: "/2bedroommainland.jpg",
    features: ["Air Conditioning", "Swimming Pool", "Gym", "Security", "Parking"],
    description: "Beautiful modern apartment with stunning city views. Located in the heart of Victoria Island with easy access to business districts and entertainment."
  },
  {
    id: 2,
    title: "Luxury 3BR House in Lekki",
    price: "₦4,800,000",
    location: "Lekki Phase 1, Lagos",
    bedrooms: 3,
    bathrooms: 3,
    area: "2,100 sqft",
    type: "House",
    status: "For Rent",
    image: "/EkoAtlanticCity.jpg",
    features: ["Garden", "Garage", "Security", "Generator", "Water Treatment"],
    description: "Spacious family home in a quiet residential area. Perfect for families with children, close to good schools and shopping centers."
  },
  {
    id: 3,
    title: "Studio Apartment in Ikeja",
    price: "₦800,000",
    location: "Ikeja GRA, Lagos",
    bedrooms: 1,
    bathrooms: 1,
    area: "650 sqft",
    type: "Studio",
    status: "For Rent",
    image: "/1bedroom.jpg",
    features: ["Furnished", "WiFi", "Kitchen", "Security"],
    description: "Cozy studio apartment perfect for young professionals. Fully furnished with modern amenities and excellent transport links."
  },
  {
    id: 4,
    title: "4BR Duplex in Banana Island",
    price: "₦12,000,000",
    location: "Banana Island, Lagos",
    bedrooms: 4,
    bathrooms: 4,
    area: "3,500 sqft",
    type: "Duplex",
    status: "For Sale",
    image: "/2bedrooommainland.jpg",
    features: ["Waterfront", "Private Dock", "Gym", "Cinema Room", "Staff Quarters"],
    description: "Exclusive waterfront duplex on prestigious Banana Island. Luxury living with private dock and panoramic lagoon views."
  },
  {
    id: 5,
    title: "2BR Flat in Surulere",
    price: "₦1,200,000",
    location: "Surulere, Lagos",
    bedrooms: 2,
    bathrooms: 2,
    area: "900 sqft",
    type: "Flat",
    status: "For Rent",
    image: "/2bedroommainland.jpg",
    features: ["Balcony", "Parking", "Security", "Generator"],
    description: "Affordable 2-bedroom flat in a vibrant neighborhood. Great value for money with all essential amenities included."
  },
  {
    id: 6,
    title: "5BR Mansion in Ikoyi",
    price: "₦25,000,000",
    location: "Ikoyi, Lagos",
    bedrooms: 5,
    bathrooms: 6,
    area: "5,000 sqft",
    type: "Mansion",
    status: "For Sale",
    image: "/EkoAtlanticCity.jpg",
    features: ["Swimming Pool", "Tennis Court", "Garden", "Staff Quarters", "Generator", "Security"],
    description: "Magnificent mansion in the prestigious Ikoyi district. Perfect for luxury living with extensive grounds and premium finishes."
  }
];

// Filter functions for property search
export const filterProperties = (properties, filters) => {
  return properties.filter(property => {
    if (filters.type && property.type !== filters.type) return false;
    if (filters.status && property.status !== filters.status) return false;
    if (filters.location && !property.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
    if (filters.minPrice && parsePrice(property.price) < filters.minPrice) return false;
    if (filters.maxPrice && parsePrice(property.price) > filters.maxPrice) return false;
    if (filters.bedrooms && property.bedrooms < filters.bedrooms) return false;
    return true;
  });
};

// Helper function to parse price string to number
const parsePrice = (priceString) => {
  return parseInt(priceString.replace(/[₦,]/g, ''));
};

// Search properties by query
export const searchProperties = (properties, query) => {
  if (!query) return properties;
  
  const searchTerm = query.toLowerCase();
  return properties.filter(property => 
    property.title.toLowerCase().includes(searchTerm) ||
    property.location.toLowerCase().includes(searchTerm) ||
    property.description.toLowerCase().includes(searchTerm) ||
    property.features.some(feature => feature.toLowerCase().includes(searchTerm))
  );
};
