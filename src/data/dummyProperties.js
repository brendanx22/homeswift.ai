// Dummy property data for HomeSwift prototype
export const properties = [
  {
    id: 1,
    title: "GRA Phase 1",
    price: "1,100,000",
    currency: "₦",
    type: "For Sale",
    image: "/GRAPhase1.png",
    location: "Government Reserved Area, Port Harcourt",
    bedrooms: 4,
    bathrooms: 3,
    area: "450 sqm",
    description: "Luxurious 4-bedroom duplex in the prestigious GRA Phase 1. Features modern amenities, spacious rooms, and excellent security.",
    features: ["Swimming Pool", "Generator", "Security", "Parking", "Garden"],
    favorite: false,
    category: "Luxury Homes"
  },
  {
    id: 2,
    title: "Banana Island Villa",
    price: "2,500,000",
    currency: "₦",
    type: "For Sale",
    image: "/bananaislandvilla.jpg",
    location: "Banana Island, Lagos",
    bedrooms: 6,
    bathrooms: 5,
    area: "800 sqm",
    description: "Exclusive waterfront villa on Banana Island. Premium location with stunning views and world-class amenities.",
    features: ["Waterfront", "Private Dock", "Gym", "Cinema", "Wine Cellar", "Staff Quarters"],
    favorite: false,
    category: "Luxury Homes"
  },
  {
    id: 3,
    title: "Lekki Phase 1 Apartment",
    price: "45,000",
    currency: "₦",
    type: "For Rent",
    image: "/lekkiphase1.jpg",
    location: "Lekki Phase 1, Lagos",
    bedrooms: 3,
    bathrooms: 2,
    area: "120 sqm",
    description: "Modern 3-bedroom apartment in Lekki Phase 1. Perfect for young professionals and small families.",
    features: ["24/7 Security", "Backup Generator", "Parking", "Gym Access"],
    favorite: false,
    category: "Apartments"
  },
  {
    id: 4,
    title: "Victoria Island Office Space",
    price: "150,000",
    currency: "₦",
    type: "For Rent",
    image: "/victoriaislandoffice.jpg",
    location: "Victoria Island, Lagos",
    bedrooms: 0,
    bathrooms: 2,
    area: "200 sqm",
    description: "Prime commercial office space in Victoria Island business district. Ideal for corporate headquarters.",
    features: ["Conference Rooms", "Elevator", "Parking", "24/7 Security", "Reception Area"],
    favorite: false,
    category: "Commercial"
  },
  {
    id: 5,
    title: "Ikoyi Penthouse",
    price: "3,200,000",
    currency: "₦",
    type: "For Sale",
    image: "/ikoyipenthouse.jpg",
    location: "Ikoyi, Lagos",
    bedrooms: 5,
    bathrooms: 4,
    area: "600 sqm",
    description: "Stunning penthouse with panoramic city views. Ultra-modern design with premium finishes throughout.",
    features: ["Rooftop Terrace", "Private Elevator", "Smart Home", "Concierge", "Infinity Pool"],
    favorite: false,
    category: "Luxury Homes"
  },
  {
    id: 6,
    title: "Abuja Diplomatic Zone Villa",
    price: "1,800,000",
    currency: "₦",
    type: "For Sale",
    image: "/abujadiplomatic.jpg",
    location: "Diplomatic Zone, Abuja",
    bedrooms: 5,
    bathrooms: 4,
    area: "550 sqm",
    description: "Elegant villa in Abuja's prestigious diplomatic zone. Perfect for executives and diplomats.",
    features: ["Diplomatic Security", "Large Compound", "Staff Quarters", "Generator House"],
    favorite: false,
    category: "Luxury Homes"
  },
  {
    id: 7,
    title: "Mainland 2-Bedroom",
    price: "25,000",
    currency: "₦",
    type: "For Rent",
    image: "/2bedrooممainland.jpg",
    location: "Surulere, Lagos",
    bedrooms: 2,
    bathrooms: 1,
    area: "80 sqm",
    description: "Affordable 2-bedroom apartment on Lagos mainland. Great value for money with basic amenities.",
    features: ["Parking", "Security", "Water Supply"],
    favorite: false,
    category: "Affordable Housing"
  },
  {
    id: 8,
    title: "Eko Atlantic Luxury Apartment",
    price: "120,000",
    currency: "₦",
    type: "For Rent",
    image: "/EkoAtlanticCity.jpg",
    location: "Eko Atlantic City, Lagos",
    bedrooms: 4,
    bathrooms: 3,
    area: "180 sqm",
    description: "Ultra-modern apartment in the new Eko Atlantic City. Waterfront living with world-class infrastructure.",
    features: ["Ocean View", "Smart Home", "Concierge", "Gym", "Pool", "24/7 Power"],
    favorite: false,
    category: "Luxury Homes"
  }
];

// Search function for dummy data
export const searchProperties = (query, filters = {}) => {
  let results = [...properties];
  
  if (query) {
    const searchTerm = query.toLowerCase();
    results = results.filter(property => 
      property.title.toLowerCase().includes(searchTerm) ||
      property.location.toLowerCase().includes(searchTerm) ||
      property.description.toLowerCase().includes(searchTerm) ||
      property.category.toLowerCase().includes(searchTerm)
    );
  }
  
  // Apply filters
  if (filters.type) {
    results = results.filter(property => property.type === filters.type);
  }
  
  if (filters.minPrice) {
    results = results.filter(property => 
      parseInt(property.price.replace(/,/g, '')) >= filters.minPrice
    );
  }
  
  if (filters.maxPrice) {
    results = results.filter(property => 
      parseInt(property.price.replace(/,/g, '')) <= filters.maxPrice
    );
  }
  
  if (filters.bedrooms) {
    results = results.filter(property => property.bedrooms >= filters.bedrooms);
  }
  
  if (filters.location) {
    results = results.filter(property => 
      property.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }
  
  return results;
};

// Get property by ID
export const getPropertyById = (id) => {
  return properties.find(property => property.id === parseInt(id));
};

// Get properties by category
export const getPropertiesByCategory = (category) => {
  return properties.filter(property => property.category === category);
};

// Get featured properties (first 4)
export const getFeaturedProperties = () => {
  return properties.slice(0, 4);
};
