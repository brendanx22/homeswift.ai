
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create neighborhoods table
CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    walk_score INTEGER DEFAULT 0,
    transit_score INTEGER DEFAULT 0,
    bike_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'shortlet')),
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'duplex', 'penthouse', 'studio', 'hostel', 'shared_apartment')),
    price DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'NGN',
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    square_feet INTEGER,
    street_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    country TEXT DEFAULT 'Nigeria',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    neighborhood_id UUID REFERENCES neighborhoods(id),
    amenities TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'rented')),
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS property_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create property_reviews table
CREATE TABLE IF NOT EXISTS property_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved_properties table
CREATE TABLE IF NOT EXISTS saved_properties (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, property_id)
);

-- Create property_inquiries table
CREATE TABLE IF NOT EXISTS property_inquiries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'viewing_scheduled', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_state ON properties(state);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_primary ON property_images(is_primary);
CREATE INDEX IF NOT EXISTS idx_saved_properties_user_id ON saved_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON property_inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_user_id ON property_inquiries(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create RLS policies
-- User profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
-- Allow INSERT during signup - check if user is authenticated OR if it's the service role
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR auth.role() = 'service_role'
);

-- Drop existing properties policies if they exist
DROP POLICY IF EXISTS "Properties are viewable by everyone" ON properties;
DROP POLICY IF EXISTS "Authenticated users can create properties" ON properties;
DROP POLICY IF EXISTS "Property owners can update properties" ON properties;

-- Properties: Public read access, authenticated users can create/update
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create properties" ON properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Property owners can update properties" ON properties FOR UPDATE USING (auth.role() = 'authenticated');

-- Drop existing property_images policies if they exist
DROP POLICY IF EXISTS "Property images are viewable by everyone" ON property_images;
DROP POLICY IF EXISTS "Authenticated users can create property images" ON property_images;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON property_images;

-- Property images: Public read access, authenticated users can create/update
CREATE POLICY "Property images are viewable by everyone" ON property_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create property images" ON property_images FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update property images" ON property_images FOR UPDATE USING (auth.role() = 'authenticated');

-- Drop existing property_reviews policies if they exist
DROP POLICY IF EXISTS "Property reviews are viewable by everyone" ON property_reviews;
DROP POLICY IF EXISTS "Users can create reviews" ON property_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON property_reviews;

-- Property reviews: Public read access, authenticated users can create/update their own
CREATE POLICY "Property reviews are viewable by everyone" ON property_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON property_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON property_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Drop existing saved_properties policies if they exist
DROP POLICY IF EXISTS "Users can view own saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can create saved properties" ON saved_properties;
DROP POLICY IF EXISTS "Users can delete own saved properties" ON saved_properties;

-- Saved properties: Users can only see and manage their own saved properties
CREATE POLICY "Users can view own saved properties" ON saved_properties FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create saved properties" ON saved_properties FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved properties" ON saved_properties FOR DELETE USING (auth.uid() = user_id);

-- Drop existing property_inquiries policies if they exist
DROP POLICY IF EXISTS "Users can view own inquiries" ON property_inquiries;
DROP POLICY IF EXISTS "Users can create inquiries" ON property_inquiries;

-- Property inquiries: Users can only see their own inquiries
CREATE POLICY "Users can view own inquiries" ON property_inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create inquiries" ON property_inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create function to handle user profile creation during signup
CREATE OR REPLACE FUNCTION create_user_profile(
    user_id UUID,
    user_email TEXT,
    first_name TEXT DEFAULT '',
    last_name TEXT DEFAULT ''
)
RETURNS user_profiles AS $$
DECLARE
    new_profile user_profiles;
BEGIN
    -- Insert the user profile with elevated privileges
    INSERT INTO user_profiles (id, email, first_name, last_name, created_at, updated_at)
    VALUES (user_id, user_email, first_name, last_name, NOW(), NOW())
    RETURNING * INTO new_profile;
    
    RETURN new_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;
DROP TRIGGER IF EXISTS update_property_reviews_updated_at ON property_reviews;
DROP TRIGGER IF EXISTS update_property_inquiries_updated_at ON property_inquiries;
DROP TRIGGER IF EXISTS update_neighborhoods_updated_at ON neighborhoods;

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_reviews_updated_at BEFORE UPDATE ON property_reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_property_inquiries_updated_at BEFORE UPDATE ON property_inquiries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_neighborhoods_updated_at BEFORE UPDATE ON neighborhoods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample neighborhoods
INSERT INTO neighborhoods (name, description, city, state, walk_score, transit_score, bike_score) VALUES
('Victoria Island', 'Premium business district with luxury apartments and offices', 'Lagos', 'Lagos', 85, 90, 70),
('Ikoyi', 'Upscale residential area with high-end properties', 'Lagos', 'Lagos', 80, 85, 65),
('Lekki Phase 1', 'Modern residential area with good infrastructure', 'Lagos', 'Lagos', 75, 70, 60),
('Surulere', 'Established residential area with good transport links', 'Lagos', 'Lagos', 70, 80, 55),
('Ikeja', 'Commercial and residential hub with airport proximity', 'Lagos', 'Lagos', 75, 85, 60),
('Ajah', 'Growing residential area with new developments', 'Lagos', 'Lagos', 65, 60, 50),
('Banana Island', 'Exclusive island community with luxury properties', 'Lagos', 'Lagos', 90, 95, 80),
('Magodo', 'Well-planned residential estate with good amenities', 'Lagos', 'Lagos', 70, 65, 55),
('Palm Grove Estate', 'Gated community with modern facilities', 'Lagos', 'Lagos', 75, 70, 60),
('Unilag Area', 'University area with student accommodations', 'Lagos', 'Lagos', 60, 70, 45)
ON CONFLICT DO NOTHING;

-- Insert sample properties
INSERT INTO properties (title, description, listing_type, property_type, price, bedrooms, bathrooms, square_feet, street_address, city, state, amenities, features, featured) VALUES
('Luxury 3-Bedroom Apartment in Victoria Island', 'Modern apartment with stunning ocean views and premium finishes', 'rent', 'apartment', 2500000, 3, 3, 1800, '123 Ahmadu Bello Way', 'Lagos', 'Lagos', '{"Swimming Pool", "Gym", "Concierge", "Parking"}', '{"Ocean View", "Balcony", "Modern Kitchen", "Marble Floors"}', true),
('Executive Duplex in Ikoyi', 'Spacious duplex with private garden and security', 'sale', 'duplex', 85000000, 4, 5, 3500, '45 Bourdillon Road', 'Lagos', 'Lagos', '{"Security", "Garden", "Parking", "Generator"}', '{"Private Garden", "Study Room", "Guest Quarters", "Modern Design"}', true),
('Cozy Studio Apartment in Lekki', 'Perfect for young professionals with modern amenities', 'rent', 'studio', 800000, 1, 1, 600, '78 Admiralty Way', 'Lagos', 'Lagos', '{"Swimming Pool", "Gym", "Parking"}', '{"Modern Kitchen", "Balcony", "Air Conditioning"}', false),
('Family House in Surulere', 'Spacious family home with multiple bedrooms', 'rent', 'house', 1200000, 3, 2, 2000, '12 Bode Thomas Street', 'Lagos', 'Lagos', '{"Garden", "Parking", "Security"}', '{"Large Living Room", "Study Room", "Outdoor Space"}', false),
('Shortlet Apartment in Banana Island', 'Furnished apartment perfect for short stays', 'shortlet', 'apartment', 150000, 2, 2, 1200, 'Island View Estate', 'Lagos', 'Lagos', '{"Swimming Pool", "Concierge", "WiFi", "Kitchen"}', '{"Furnished", "Ocean View", "Modern Amenities"}', true),
('Student Hostel near Unilag', 'Affordable accommodation for university students', 'rent', 'hostel', 150000, 1, 1, 300, '15 University Road', 'Lagos', 'Lagos', '{"WiFi", "Study Room", "Common Area"}', '{"Shared Kitchen", "Laundry", "Security"}', false),
('Shared Apartment in Ikeja', 'Modern shared living space with private rooms', 'rent', 'shared_apartment', 200000, 1, 1, 400, '89 Allen Avenue', 'Lagos', 'Lagos', '{"WiFi", "Common Kitchen", "Living Room"}', '{"Private Room", "Shared Bathroom", "Modern Design"}', false),
('Penthouse in Magodo', 'Luxury penthouse with panoramic city views', 'sale', 'penthouse', 120000000, 5, 6, 4500, 'Magodo Phase 2', 'Lagos', 'Lagos', '{"Swimming Pool", "Gym", "Concierge", "Parking", "Rooftop"}', '{"City View", "Private Elevator", "Wine Cellar", "Home Theater"}', true)
ON CONFLICT DO NOTHING;
