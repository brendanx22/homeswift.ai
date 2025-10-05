import { supabase } from '../lib/supabase.js';

const searchController = {
  // Search properties with filters
  async searchProperties(req, res) {
    try {
      const { query = '', filters = {} } = req.body;
      const { 
        minPrice, 
        maxPrice, 
        bedrooms, 
        propertyType, 
        minArea,
        maxArea,
        status = 'for_sale' // Default to 'for_sale' if not specified
      } = filters;

      // Start building the Supabase query
      let queryBuilder = supabase
        .from('properties')
        .select('*, images:property_images(*)', { count: 'exact' });

      // Add text search conditions
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,` +
          `description.ilike.%${query}%,` +
          `address.ilike.%${query}%,` +
          `city.ilike.%${query}%,` +
          `state.ilike.%${query}%,` +
          `postal_code.ilike.%${query}%`
        );
      }

      // Add price filter
      if (minPrice) queryBuilder = queryBuilder.gte('price', parseFloat(minPrice));
      if (maxPrice) queryBuilder = queryBuilder.lte('price', parseFloat(maxPrice));

      // Add bedrooms filter
      if (bedrooms) {
        queryBuilder = queryBuilder.gte('bedrooms', parseInt(bedrooms));
      }

      // Add property type filter
      if (propertyType) {
        queryBuilder = queryBuilder.eq('property_type', propertyType);
      }

      // Add area filter
      if (minArea) queryBuilder = queryBuilder.gte('area_sqft', parseInt(minArea));
      if (maxArea) queryBuilder = queryBuilder.lte('area_sqft', parseInt(maxArea));

      // Add status filter
      if (status) {
        queryBuilder = queryBuilder.eq('status', status);
      }

      // Execute query
      const { data: properties, error, count } = await queryBuilder
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        success: true,
        count: properties?.length || 0,
        total: count || 0,
        data: properties || []
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to perform search',
        message: error.message
      });
    }
  },

  // Get search suggestions
  async getSuggestions(req, res) {
    try {
      const { q } = req.query;
      
      // Start building the Supabase query
      let queryBuilder = supabase
        .from('properties')
        .select('city, state, postal_code', { count: 'exact' });

      // Add search condition if query is provided
      if (q) {
        queryBuilder = queryBuilder.or(
          `city.ilike.%${q}%,` +
          `state.ilike.%${q}%,` +
          `postal_code.ilike.%${q}%`
        );
      }

      // Execute query
      const { data: suggestions, error } = await queryBuilder
        .limit(8);

      if (error) throw error;

      // Format suggestions
      const formatted = (suggestions || []).map(item => {
        const parts = [];
        if (item.city) parts.push(item.city);
        if (item.state) parts.push(item.state);
        if (item.postal_code) parts.push(item.postal_code);
        return parts.join(', ');
      });

      // Remove duplicates
      const uniqueSuggestions = [...new Set(formatted)];

      res.json({
        success: true,
        data: uniqueSuggestions
      });
    } catch (error) {
      console.error('Suggestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch suggestions',
        message: error.message
      });
    }
  }
};

export default searchController;
