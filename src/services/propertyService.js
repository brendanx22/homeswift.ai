import api from '../lib/api';

const propertyService = {
  // Get all properties with optional filters
  getProperties: async (filters = {}) => {
    try {
      const response = await api.get('/properties', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching properties:', error);
      throw error;
    }
  },

  // Get a single property by ID
  getPropertyById: async (id) => {
    try {
      const response = await api.get(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  // Create a new property (requires authentication)
  createProperty: async (propertyData) => {
    try {
      const response = await api.post('/properties', propertyData);
      return response.data;
    } catch (error) {
      console.error('Error creating property:', error);
      throw error;
    }
  },

  // Update a property (requires authentication)
  updateProperty: async (id, propertyData) => {
    try {
      const response = await api.put(`/properties/${id}`, propertyData);
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  // Delete a property (requires authentication)
  deleteProperty: async (id) => {
    try {
      const response = await api.delete(`/properties/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },

  // Search properties
  searchProperties: async (query) => {
    try {
      const response = await api.get('/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching properties:', error);
      throw error;
    }
  },
};

export default propertyService;
