-- HomeSwift Database Schema
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    occupation TEXT,
    annual_income NUMERIC,
    credit_score INTEGER,
    preferred_contact_method TEXT CHECK (preferred_contact_method IN ('email', 'phone', 'sms')),
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN ('house', 'apartment', 'condo', 'townhouse', 'studio', 'loft', 'duplex', 'other')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('rent', 'sale')),
    price NUMERIC NOT NULL,
    price_per_sqft NUMERIC,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    square_feet INTEGER,
    lot_size NUMERIC,
    year_built INTEGER,
    
    -- Address information
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip_code TEXT NOT NULL,
    country TEXT DEFAULT 'US',
    latitude NUMERIC,
    longitude NUMERIC,
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for spatial queries
    
    -- Property features
    features JSONB DEFAULT '[]'::jsonb, -- Array of features like ["parking", "pool", "gym"]
    amenities JSONB DEFAULT '[]'::jsonb, -- Building/complex amenities
    appliances JSONB DEFAULT '[]'::jsonb, -- Included appliances
    
    -- Listing details
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'rented', 'off_market')),
    available_date DATE,
    lease_terms JSONB, -- For rentals: {"min_lease": 12, "max_lease": 24, "deposit": 2000}
    pet_policy JSONB, -- {"allowed": true, "deposit": 500, "restrictions": ["no cats"]}
    parking_info JSONB, -- {"spaces": 2, "type": "garage", "cost": 100}
    
    -- Media
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    virtual_tour_url TEXT,
    video_url TEXT,
    
    -- Listing agent/owner
    agent_id UUID REFERENCES public.user_profiles(id),
    owner_id UUID REFERENCES public.user_profiles(id),
    listing_agent_name TEXT,
    listing_agent_phone TEXT,
    listing_agent_email TEXT,
    
    -- MLS and external data
    mls_number TEXT,
    external_id TEXT, -- For Zillow, Rentals.com, etc.
    data_source TEXT DEFAULT 'homeswift',
    
    -- SEO and search
    slug TEXT UNIQUE,
    search_vector TSVECTOR, -- For full-text search
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Property images table (for better image management)
CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved properties (user favorites)
CREATE TABLE IF NOT EXISTS public.saved_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Property searches (saved searches)
CREATE TABLE IF NOT EXISTS public.saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    search_criteria JSONB NOT NULL, -- Store search parameters
    notification_enabled BOOLEAN DEFAULT TRUE,
    frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'monthly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property inquiries/leads
CREATE TABLE IF NOT EXISTS public.property_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    inquiry_type TEXT CHECK (inquiry_type IN ('viewing', 'info_request', 'application', 'offer')),
    message TEXT,
    contact_info JSONB, -- For non-registered users
    preferred_contact_time TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property reviews/ratings
CREATE TABLE IF NOT EXISTS public.property_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    pros JSONB DEFAULT '[]'::jsonb,
    cons JSONB DEFAULT '[]'::jsonb,
    lived_here BOOLEAN DEFAULT FALSE,
    move_in_date DATE,
    move_out_date DATE,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Neighborhoods table
CREATE TABLE IF NOT EXISTS public.neighborhoods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    description TEXT,
    boundaries GEOGRAPHY(POLYGON, 4326), -- PostGIS polygon
    center_point GEOGRAPHY(POINT, 4326),
    
    -- Neighborhood stats
    avg_rent NUMERIC,
    avg_sale_price NUMERIC,
    walk_score INTEGER,
    transit_score INTEGER,
    bike_score INTEGER,
    crime_rate NUMERIC,
    school_rating NUMERIC,
    
    -- Demographics
    population INTEGER,
    median_age NUMERIC,
    median_income NUMERIC,
    
    -- Amenities nearby
    nearby_amenities JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_location ON public.properties USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties (price);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties (bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_bathrooms ON public.properties (bathrooms);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties (property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties (listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_city_state ON public.properties (city, state);
CREATE INDEX IF NOT EXISTS idx_properties_search_vector ON public.properties USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON public.saved_properties (user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches (user_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON public.property_inquiries (property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id ON public.property_inquiries (user_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON public.property_reviews (property_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER handle_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_saved_searches_updated_at
    BEFORE UPDATE ON public.saved_searches
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_property_inquiries_updated_at
    BEFORE UPDATE ON public.property_inquiries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_property_reviews_updated_at
    BEFORE UPDATE ON public.property_reviews
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_neighborhoods_updated_at
    BEFORE UPDATE ON public.neighborhoods
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
