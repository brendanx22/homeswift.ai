import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error('   SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅' : '❌');
  console.error('');
  console.error('Please create a .env file with your Supabase credentials:');
  console.error('   SUPABASE_URL=https://your-project-ref.supabase.co');
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here');
  console.error('   VITE_SUPABASE_URL=https://your-project-ref.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=your-anon-key-here');
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: { 
      'x-application-name': 'HomeSwift Server',
      'x-client-info': 'homeswift-server'
    }
  }
});

// Test the connection
async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('   URL:', supabaseUrl);
    console.log('   Key:', supabaseKey.substring(0, 20) + '...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      throw error;
    }
    
    console.log('✅ Successfully connected to Supabase');
    console.log('   Database: Connected');
    console.log('   Tables: Accessible');
    
    return true;
  } catch (error) {
    console.error('❌ Error connecting to Supabase:', error.message);
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('1. Verify your Supabase project URL and keys');
    console.error('2. Check if your Supabase project is active');
    console.error('3. Ensure the required tables exist in your database');
    console.error('4. Check your internet connection');
    throw error;
  }
}

// Database utility functions
export const dbUtils = {
  // Get all properties with pagination
  async getProperties(page = 1, limit = 20, filters = {}) {
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
  async getPropertyById(id) {
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

  // Search properties
  async searchProperties(searchTerm, filters = {}, page = 1, limit = 20) {
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

  // Get user profile
  async getUserProfile(userId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  // Create user profile
  async createUserProfile(profileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
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

export { supabase, testConnection };
export default supabase;
