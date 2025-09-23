-- First, make sure the database exists
SELECT 'CREATE DATABASE homeswift'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'homeswift')\gexec

-- Connect to the database
\c homeswift

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20),
    profile_image_url TEXT,
    is_email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    remember_token VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at automatically
DO $$
BEGIN
    -- Drop the trigger if it exists
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_modtime') THEN
        DROP TRIGGER update_users_modtime ON users;
    END IF;
    
    -- Create the trigger
    EXECUTE 'CREATE TRIGGER update_users_modtime
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_modified_column();';
END
$$;
