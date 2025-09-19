import { supabase } from '../lib/supabase';

class SearchService {
  // Search properties with advanced filters
  async searchProperties(searchParams) {
    try {
      const {
        query = '',
        listingType = '',
        propertyType = '',
        minPrice = null,
        maxPrice = null,
        bedrooms = null,
        bathrooms = null,
        city = '',
        state = '',
        page = 1,
        limit = 20
      } = searchParams;

      let supabaseQuery = supabase
        .from('properties')
        .select(`
          *,
          property_images(url, caption, is_primary, display_order),
          neighborhoods(name, walk_score, transit_score, bike_score)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Apply text search if query is provided
      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,street_address.ilike.%${query}%,city.ilike.%${query}%,state.ilike.%${query}%`
        );
      }

      // Apply filters
      if (listingType) {
        supabaseQuery = supabaseQuery.eq('listing_type', listingType);
      }

      if (propertyType) {
        supabaseQuery = supabaseQuery.eq('property_type', propertyType);
      }

      if (minPrice !== null && minPrice !== '') {
        supabaseQuery = supabaseQuery.gte('price', parseFloat(minPrice));
      }

      if (maxPrice !== null && maxPrice !== '') {
        supabaseQuery = supabaseQuery.lte('price', parseFloat(maxPrice));
      }

      if (bedrooms !== null && bedrooms !== '') {
        supabaseQuery = supabaseQuery.gte('bedrooms', parseInt(bedrooms));
      }

      if (bathrooms !== null && bathrooms !== '') {
        supabaseQuery = supabaseQuery.gte('bathrooms', parseInt(bathrooms));
      }

      if (city.trim()) {
        supabaseQuery = supabaseQuery.ilike('city', `%${city}%`);
      }

      if (state.trim()) {
        supabaseQuery = supabaseQuery.ilike('state', `%${state}%`);
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      supabaseQuery = supabaseQuery.range(from, to);

      const { data, error, count } = await supabaseQuery;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      return {
        properties: data || [],
        totalCount: count || 0,
        currentPage: page,
        totalPages: Math.ceil((count || 0) / limit),
        hasMore: (page * limit) < (count || 0)
      };
    } catch (error) {
      console.error('Search service error:', error);
      throw error;
    }
  }

  // Get featured properties
  async getFeaturedProperties(limit = 6) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, caption, is_primary, display_order),
          neighborhoods(name, walk_score, transit_score)
        `)
        .eq('status', 'active')
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch featured properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Featured properties error:', error);
      throw error;
    }
  }

  // Get recent properties
  async getRecentProperties(limit = 8) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, caption, is_primary, display_order),
          neighborhoods(name, walk_score, transit_score)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch recent properties: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Recent properties error:', error);
      throw error;
    }
  }

  // Get search suggestions based on popular searches
  async getSearchSuggestions(query = '') {
    try {
      // Get popular cities and neighborhoods
      const { data: locations, error: locationError } = await supabase
        .from('neighborhoods')
        .select('name, city, state')
        .or(`name.ilike.%${query}%,city.ilike.%${query}%`)
        .limit(5);

      if (locationError) {
        console.warn('Failed to fetch location suggestions:', locationError);
      }

      // Get popular property types
      const { data: propertyTypes, error: typeError } = await supabase
        .from('properties')
        .select('property_type')
        .eq('status', 'active')
        .ilike('property_type', `%${query}%`)
        .limit(3);

      if (typeError) {
        console.warn('Failed to fetch property type suggestions:', typeError);
      }

      const suggestions = [];

      // Add location suggestions
      if (locations) {
        locations.forEach(location => {
          suggestions.push({
            type: 'location',
            text: `${location.name}, ${location.city}`,
            value: `${location.name}, ${location.city}`
          });
        });
      }

      // Add property type suggestions
      if (propertyTypes) {
        const uniqueTypes = [...new Set(propertyTypes.map(p => p.property_type))];
        uniqueTypes.forEach(type => {
          suggestions.push({
            type: 'property_type',
            text: `${type} properties`,
            value: type
          });
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  }

  // Save search history for user
  async saveSearchHistory(userId, searchQuery, filters = {}) {
    try {
      if (!userId || !searchQuery.trim()) return;

      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          query: searchQuery.trim(),
          filters: filters,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.warn('Failed to save search history:', error);
      }
    } catch (error) {
      console.error('Save search history error:', error);
    }
  }

  // Get user's search history
  async getSearchHistory(userId, limit = 10) {
    try {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch search history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get search history error:', error);
      return [];
    }
  }

  // Get property by ID with full details
  async getPropertyById(id) {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(url, caption, alt_text, display_order, is_primary),
          property_reviews(rating, title, review_text, created_at, user_profiles(first_name, last_name)),
          neighborhoods(name, description, walk_score, transit_score, bike_score)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Property not found: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get property error:', error);
      throw error;
    }
  }
}

export default new SearchService();
