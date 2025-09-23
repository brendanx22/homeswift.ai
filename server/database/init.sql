-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    last_login TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    property_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    bedrooms INT,
    bathrooms INT,
    area_sqft INT,
    year_built INT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Property Images table
CREATE TABLE IF NOT EXISTS property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Favorites
CREATE TABLE IF NOT EXISTS user_favorites (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, property_id)
);

-- Create indexes for better performance
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_status ON properties(status);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update updated_at automatically
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_properties_modtime
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_modified_column();
