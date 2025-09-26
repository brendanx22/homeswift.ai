import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { PropertyCard } from "../components/PropertyCard";
import house1 from "../assets/house1.jpg";
import house2 from "../assets/house2.jpg";
import house3 from "../assets/house3.jpg";
import house4 from "../assets/house4.jpg";

const properties = [
  {
    id: "1",
    image: house1,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Rent",
  },
  {
    id: "2",
    image: house2,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Sale",
  },
  {
    id: "3",
    image: house3,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Rent",
  },
  {
    id: "4",
    image: house4,
    location: "GRA Phase 1",
    price: 1100000,
    duration: "year",
    type: "For Sale",
  },
];

const HouseListings = ({ showSaved = false, showNeighborhoods = false, showFilters = false, showRecent = false }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("all");

  // Filter properties based on search query and selected type
  const filteredProperties = properties.filter(property => {
    // Apply type filter
    if (selectedType !== 'all' && property.type.toLowerCase() !== selectedType) {
      return false;
    }
    
    // Apply search query filter if present
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        property.location.toLowerCase().includes(searchLower) ||
        property.type.toLowerCase().includes(searchLower) ||
        property.price.toString().includes(searchQuery) ||
        property.duration.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Update document title when search query changes
  useEffect(() => {
    if (searchQuery) {
      document.title = `Search Results for "${searchQuery}" | HomeSwift`;
    } else {
      document.title = 'Properties | HomeSwift';
    }
  }, [searchQuery]);


  // Determine which properties to show based on the view mode
  let displayedProperties = [...filteredProperties];
  let viewTitle = "Available Properties";
  let showSearchHeader = false;

  if (searchQuery) {
    viewTitle = `Search Results for "${searchQuery}"`;
    showSearchHeader = true;
    if (displayedProperties.length === 0) {
      viewTitle = `No results found for "${searchQuery}"`;
    }
  } else if (showSaved) {
    // In a real app, this would filter for user's saved properties
    viewTitle = "Saved Properties";
    displayedProperties = displayedProperties.slice(0, 2); // Just for demo
  } else if (showNeighborhoods) {
    viewTitle = "Neighborhood Guide";
    // In a real app, this would show properties grouped by neighborhood
  } else if (showFilters) {
    viewTitle = "Advanced Filters";
    // In a real app, this would show more filter options
  } else if (showRecent) {
    viewTitle = "Recent Searches";
    // In a real app, this would show recently viewed properties
  }

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#1E1E1E' }}>
      <Header />
      
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{viewTitle}</h1>
          {searchQuery && (
            <p className="text-gray-400">
              Found {filteredProperties.length} properties matching your search
            </p>
          )}
        </div>

        {/* Property Type Filter */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {['All', 'For Sale', 'For Rent'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type === 'All' ? 'all' : type.toLowerCase())}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                (selectedType === 'all' && type === 'All') || 
                selectedType === type.toLowerCase()
                  ? 'bg-primary text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={`${property.id}-${index}`}
                {...property}
                onClick={() => handlePropertyClick(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No properties found matching your criteria</p>
            <button 
              onClick={() => {
                setSelectedType('all');
                navigate('/properties');
              }}
              className="mt-4 text-primary hover:underline"
            >
              Clear filters and show all properties
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseListings;