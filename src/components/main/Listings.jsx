import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Star, Bed, Bath, Ruler, Search } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [favorites, setFavorites] = useState(new Set());
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  // Get search parameters from URL
  const searchQuery = searchParams.get('q') || '';
  const propertyType = searchParams.get('propertyType') || '';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const bedrooms = searchParams.get('bedrooms');
  const location = searchParams.get('city') || ''; // Changed from 'location' to 'city' to match backend

  // Update search input when searchQuery changes
  useEffect(() => {
    if (searchQuery) {
      setSearchInput(searchQuery);
    }
  }, [searchQuery]);

  const toggleFavorite = (id) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Only include search query if there's actual input
    const searchTerm = searchInput.trim();
    if (searchTerm) {
      params.set('q', searchTerm);
    } else {
      params.delete('q');
    }
    
    // Update other filters
    if (location) params.set('city', location);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (bedrooms) params.set('bedrooms', bedrooms);
    if (propertyType) params.set('propertyType', propertyType);
    if (activeTab !== 'all') params.set('status', activeTab);
    
    console.log('Setting search params:', Object.fromEntries(params));
    setSearchParams(params);
  };

  // Reset search
  const resetSearch = () => {
    setSearchInput('');
    setSearchParams({});
    setActiveTab('all');
  };

  // Fetch properties when search parameters change
  useEffect(() => {
    // Log current search parameters for debugging
    console.log('Current search params:', {
      searchQuery,
      location,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      activeTab
    });

    const fetchProperties = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        
        // Only include search query if it's not empty
        if (searchQuery && searchQuery.trim() !== '') {
          params.append('q', searchQuery.trim());
        }
        
        // Add other filters
        if (propertyType) params.append('propertyType', propertyType);
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (bedrooms) params.append('bedrooms', bedrooms);
        if (location) params.append('city', location);
        
        // Add status filter if not 'all'
        if (activeTab !== 'all') {
          params.append('status', activeTab);
        } else {
          // Explicitly remove status filter when 'all' is selected
          params.delete('status');
        }
        
        // Add sorting and pagination
        params.append('sortBy', 'createdAt');
        params.append('sortOrder', 'DESC');
        params.append('limit', '12');

        console.log('Fetching properties with params:', params.toString());
        const response = await api.get(`/properties?${params.toString()}`);
        console.log('API response:', response.data);
        
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          setListings(response.data.data);
        } else {
          console.error('Invalid response format:', response.data);
          setListings([]);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Response data:', err.response.data);
          console.error('Response status:', err.response.status);
          console.error('Response headers:', err.response.headers);
          setError(`Error ${err.response.status}: ${err.response.data?.message || 'Failed to load properties'}`);
        } else if (err.request) {
          // The request was made but no response was received
          console.error('No response received:', err.request);
          setError('No response from server. Please check your connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', err.message);
          setError('Failed to load properties. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [searchQuery, propertyType, minPrice, maxPrice, bedrooms, location, activeTab, setSearchInput]);

  // Format price with commas
  const formatPrice = (price) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6">
      {/* Header */}
      <header className="mb-10 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <a href="/main" className="flex items-center group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <div className="flex items-center ml-4">
              <img src="/images/logo.png" alt="HomeSwift Logo" className="w-8 h-8 rounded-lg object-cover" />
              <h1 className="ml-3 text-3xl font-bold text-white tracking-tight group-hover:opacity-80 transition-opacity">
                Home<span className="italic">Swift</span>
              </h1>
            </div>
          </a>
        </div>
        <button className="p-2 rounded-md hover:bg-gray-800">
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white mb-1.5"></div>
          <div className="w-6 h-0.5 bg-white"></div>
        </button>
      </header>

      {/* Search and Filters */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-6">Find Your Dream Home</h2>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="search"
                name="search-properties"
                autoComplete="off"
                aria-label="Search properties"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-lg bg-gray-900 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by location, property type, or keywords..."
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Search
            </button>
            {(searchQuery || location || minPrice || maxPrice || bedrooms || propertyType || activeTab !== 'all') && (
              <button
                type="button"
                onClick={resetSearch}
                className="px-4 py-3 text-gray-300 hover:text-white font-medium rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        </form>

        {searchQuery && (
          <p className="text-gray-400 mb-4">
            Showing results for: <span className="text-white font-medium">"{searchQuery}"</span>
            {location && ` in ${location}`}
          </p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            activeTab === 'all' 
              ? 'bg-[#1E1E1E] text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All Properties
        </button>
        <button
          onClick={() => setActiveTab('For Rent')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            activeTab === 'For Rent' 
              ? 'bg-[#1E1E1E] text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          For Rent
        </button>
        <button
          onClick={() => setActiveTab('For Sale')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
            activeTab === 'For Sale' 
              ? 'bg-[#1E1E1E] text-white' 
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          For Sale
        </button>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.length > 0 ? listings.map((property) => (
          <div key={property.id} className="relative rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-96">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={property.image} 
                alt={property.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            </div>
            
            {/* Favorite Button */}
            <button 
              onClick={() => toggleFavorite(property.id)}
              className="absolute top-3 right-3 p-2 bg-black/40 rounded-full hover:bg-black/60 transition-colors z-10"
            >
              <Heart 
                size={18} 
                className={favorites.has(property.id) ? 'fill-red-500 text-red-500' : 'text-white'} 
              />
            </button>
            
            {/* Status Badge */}
            <div className="absolute top-3 left-3 z-10">
              <button className="px-3 py-1 bg-white/90 text-gray-800 text-xs font-medium rounded-2xl">
                {property.status}
              </button>
            </div>
            
            {/* Property Details */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
              <div className="flex items-center text-gray-200 text-sm mb-2">
                <MapPin size={16} className="mr-1.5 text-white/80" />
                <span className="font-medium">{property.location}</span>
              </div>
              
              <h3 className="text-white font-bold text-xl mb-2.5 leading-tight">
                {property.title}
              </h3>
              
              <p className="text-2xl font-extrabold text-white mb-4 flex items-baseline">
                ₦{formatPrice(property.price)}
                <span className="ml-1.5 text-base font-medium text-white/70">/year</span>
              </p>
              
              <div className="flex justify-between text-white/90 text-sm pt-3.5 border-t border-white/20">
                <div className="flex flex-col items-center">
                  <Bed size={20} className="mb-1.5 text-white/90" />
                  <span className="text-sm font-medium text-white/90">{property.beds} Beds</span>
                </div>
                <div className="flex flex-col items-center">
                  <Bath size={20} className="mb-1.5 text-white/90" />
                  <span className="text-sm font-medium text-white/90">{property.baths} Baths</span>
                </div>
                <div className="flex flex-col items-center">
                  <Ruler size={20} className="mb-1.5 text-white/90" />
                  <span className="text-sm font-medium text-white/90">{property.area} sqft</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-1.5">
                    <Star size={16} className="fill-yellow-400 text-yellow-400 mr-1.5" />
                    <span className="text-sm font-medium text-white/90">{property.rating}</span>
                  </div>
                  <span className="text-xs text-white/70">({property.reviews} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )) : !loading && (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium text-gray-300 mb-2">No properties found</h3>
            <p className="text-gray-400">Try adjusting your search filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Listings;
