import supabase from '../lib/supabase';

/**
 * Fetches all properties from the database
 * @param {Object} filters - Optional filters for the query
 * @returns {Promise<Array>} - Array of property objects
 */
export const getProperties = async (filters = {}) => {
  try {
    let query = supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters if provided
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.bedrooms) {
      query = query.gte('beds', filters.bedrooms);
    }
    if (filters.search) {
      const searchTerm = `%${filters.search.toLowerCase()}%`;
      // Create a new query for the search
      query = supabase
        .from('properties')
        .select('*')
        .or(
          `street_address.ilike.${searchTerm},` +
          `city.ilike.${searchTerm},` +
          `state.ilike.${searchTerm},` +
          `zip_code.ilike.${searchTerm}`
        )
        .order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
};

/**
 * Fetches a single property by ID
 * @param {string} id - Property ID
 * @returns {Promise<Object>} - Property object
 */
export const getPropertyById = async (id) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
};

/**
 * Creates a new property listing
 * @param {Object} propertyData - Property data to create
 * @returns {Promise<Object>} - Created property object
 */
export const createProperty = async (propertyData) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{
        ...propertyData,
        agent_id: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating property:', error);
    throw error;
  }
};

/**
 * Updates an existing property
 * @param {string} id - Property ID
 * @param {Object} updates - Property fields to update
 * @returns {Promise<Object>} - Updated property object
 */
export const updateProperty = async (id, updates) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating property:', error);
    throw error;
  }
};

/**
 * Deletes a property
 * @param {string} id - Property ID
 * @returns {Promise<boolean>} - True if successful
 */
export const deleteProperty = async (id) => {
  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting property:', error);
    throw error;
  }
};

/**
 * Uploads property images to Supabase Storage
 * @param {string} propertyId - Property ID
 * @param {File[]} files - Array of image files
 * @returns {Promise<Array>} - Array of image URLs
 */
export const uploadPropertyImages = async (propertyId, files) => {
  try {
    const uploadPromises = files.map(async (file, index) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}-${Date.now()}-${index}.${fileExt}`;
      const filePath = `properties/${propertyId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};
