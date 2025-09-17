import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../layout/Header';
import PropertyCard from '../common/PropertyCard';
import { getProperties } from '../../services/propertyService';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

const HouseListings = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  
  const [filters, setFilters] = useState({
    type: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    search: searchQuery // Use search instead of location
  });

  // Fetch properties on component mount and when filters/search query change
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const data = await getProperties({
          ...filters,
          search: searchQuery // Include search query in the filters
        });
        setProperties(data);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to load properties. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [filters, searchQuery]);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('properties')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProperties(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProperties(prev => 
            prev.map(prop => prop.id === payload.new.id ? payload.new : prop)
          );
        } else if (payload.eventType === 'DELETE') {
          setProperties(prev => prev.filter(prop => prop.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePropertyClick = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      location: ''
    });
  };

  // Test Supabase connection
  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      if (data) {
        toast.success('✅ Successfully connected to Supabase!');
        console.log('Test data:', data);
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error('❌ Failed to connect to Supabase');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <button 
        onClick={testConnection}
        className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg z-50"
        title="Test Supabase Connection"
      >
        Test DB Connection
      </button>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchQuery ? `Properties matching "${searchQuery}"` : 'Available Properties'}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? `Showing results for "${searchQuery}"` 
              : 'Browse through our selection of premium properties'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="For Rent">For Rent</option>
                <option value="For Sale">For Sale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
              <input
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="Min price"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
              <input
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="Max price"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <select
                name="bedrooms"
                value={filters.bedrooms}
                onChange={handleFilterChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
                <option value="5">5+</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={{
                  ...property,
                  // Fallback to a default image if none is provided
                  image: property.images?.[0] || '/images/placeholder-property.jpg'
                }}
                onClick={() => handlePropertyClick(property.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseListings;