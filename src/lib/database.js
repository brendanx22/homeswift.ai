import { supabase } from './supabase';

// Property queries
export const propertyQueries = {
  // Get all active properties with pagination
  getProperties: async (filters = {}, page = 1, limit = 20) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images(url, caption, is_primary, display_order),
        neighborhoods(name, walk_score, transit_score)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.listing_type) {
      query = query.eq('listing_type', filters.listing_type);
    }
    
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }
    
    if (filters.min_price) {
      query = query.gte('price', filters.min_price);
    }
    
    if (filters.max_price) {
      query = query.lte('price', filters.max_price);
    }
    
    if (filters.bedrooms) {
      query = query.eq('bedrooms', filters.bedrooms);
    }
    
    if (filters.bathrooms) {
      query = query.gte('bathrooms', filters.bathrooms);
    }
    
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.state) {
      query = query.ilike('state', `%${filters.state}%`);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      properties: data,
      totalCount: count,
      currentPage: page,
      totalPages: Math.ceil(count / limit)
    };
  },

  // Get property by ID
  getPropertyById: async (id) => {
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

    if (error) throw error;
    return data;
  },

  // Search properties by text
  searchProperties: async (searchTerm, filters = {}, page = 1, limit = 20) => {
    let query = supabase
      .from('properties')
      .select(`
        *,
        property_images(url, caption, is_primary, display_order)
      `)
      .eq('status', 'active')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,street_address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    // Apply additional filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (key === 'min_price') {
          query = query.gte('price', value);
        } else if (key === 'max_price') {
          query = query.lte('price', value);
        } else {
          query = query.eq(key, value);
        }
      }
    });

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get properties near a location (requires PostGIS)
  getPropertiesNearLocation: async (latitude, longitude, radiusKm = 5, filters = {}) => {
    const { data, error } = await supabase.rpc('get_properties_near_location', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm,
      filters: filters
    });

    if (error) throw error;
    return data;
  },

  // Get featured properties
  getFeaturedProperties: async (limit = 6) => {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        property_images(url, caption, is_primary, display_order)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};

// User profile queries
export const userQueries = {
  // Get or create user profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create user profile
  createProfile: async (profileData) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Saved properties queries
export const savedPropertiesQueries = {
  // Get user's saved properties
  getSavedProperties: async (userId) => {
    const { data, error } = await supabase
      .from('saved_properties')
      .select(`
        *,
        properties(
          *,
          property_images(url, caption, is_primary, display_order)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Save a property
  saveProperty: async (userId, propertyId, notes = '') => {
    const { data, error } = await supabase
      .from('saved_properties')
      .insert([{
        user_id: userId,
        property_id: propertyId,
        notes: notes
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove saved property
  removeSavedProperty: async (userId, propertyId) => {
    const { error } = await supabase
      .from('saved_properties')
      .delete()
      .eq('user_id', userId)
      .eq('property_id', propertyId);

    if (error) throw error;
    return true;
  },

  // Check if property is saved
  isPropertySaved: async (userId, propertyId) => {
    const { data, error } = await supabase
      .from('saved_properties')
      .select('id')
      .eq('user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }
};

// Property inquiries
export const inquiryQueries = {
  // Create property inquiry
  createInquiry: async (inquiryData) => {
    const { data, error } = await supabase
      .from('property_inquiries')
      .insert([inquiryData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get user's inquiries
  getUserInquiries: async (userId) => {
    const { data, error } = await supabase
      .from('property_inquiries')
      .select(`
        *,
        properties(title, street_address, city, state, property_images(url, is_primary))
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};

// Neighborhoods
export const neighborhoodQueries = {
  // Get all neighborhoods
  getNeighborhoods: async () => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get neighborhood by ID
  getNeighborhoodById: async (id) => {
    const { data, error } = await supabase
      .from('neighborhoods')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to property changes
  subscribeToProperties: (callback) => {
    return supabase
      .channel('properties')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'properties' }, 
        callback
      )
      .subscribe();
  },

  // Subscribe to user's saved properties
  subscribeToSavedProperties: (userId, callback) => {
    return supabase
      .channel('saved_properties')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'saved_properties',
          filter: `user_id=eq.${userId}`
        }, 
        callback
      )
      .subscribe();
  }
};

// Utility functions
export const utils = {
  // Format price for display
  formatPrice: (price, currency = '₦') => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  },

  // Get primary image for property
  getPrimaryImage: (property) => {
    if (!property.property_images || property.property_images.length === 0) {
      return '/placeholder-property.jpg';
    }
    
    const primaryImage = property.property_images.find(img => img.is_primary);
    return primaryImage ? primaryImage.url : property.property_images[0].url;
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in kilometers
    return d;
  }
};
