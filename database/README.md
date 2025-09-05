# HomeSwift Database Schema

This directory contains the database migrations and schema for the HomeSwift real estate platform using Supabase (PostgreSQL).

## Setup Instructions

1. **Go to your Supabase Dashboard**
   - Navigate to your project at https://supabase.com/dashboard
   - Go to the SQL Editor

2. **Run Migrations in Order**
   Execute the following SQL files in your Supabase SQL Editor in this exact order:

   1. `001_initial_schema.sql` - Creates all tables, indexes, and triggers
   2. `002_rls_policies.sql` - Sets up Row Level Security policies
   3. `003_sample_data.sql` - Inserts sample properties and neighborhoods

## Database Schema Overview

### Core Tables

#### `user_profiles`
Extends Supabase's built-in `auth.users` table with additional profile information:
- Personal details (name, phone, avatar)
- Financial info (income, credit score)
- Preferences and notifications

#### `properties`
Main properties table with comprehensive property information:
- Basic details (title, description, type, price)
- Location data with PostGIS support for spatial queries
- Property features and amenities (stored as JSONB)
- Listing details (status, availability, lease terms)
- Media (images, virtual tours, videos)
- Agent/owner information
- MLS integration fields

#### `property_images`
Dedicated table for property images with ordering and metadata

#### `saved_properties`
User favorites/saved properties with personal notes

#### `saved_searches`
Saved search criteria with notification preferences

#### `property_inquiries`
Lead management for property inquiries and viewings

#### `property_reviews`
User reviews and ratings for properties

#### `neighborhoods`
Neighborhood data with demographics and amenities

### Key Features

- **PostGIS Integration**: Spatial queries for location-based searches
- **Full-text Search**: PostgreSQL text search vectors for property search
- **JSONB Fields**: Flexible storage for features, amenities, and metadata
- **Row Level Security**: Comprehensive security policies
- **Audit Trails**: Automatic timestamps and update tracking

### Indexes

Optimized indexes for:
- Location-based queries (PostGIS GIST index)
- Price range searches
- Property type and status filtering
- Full-text search
- User-specific queries

## Google OAuth Configuration

For Google OAuth to work properly, add these URLs to your Supabase Auth settings:

**Site URL**: `http://localhost:5173`

**Redirect URLs**:
- `http://localhost:5173/`
- `http://localhost:5173/main`
- `https://akxlxxdjobaesrnucksy.supabase.co/auth/v1/callback`

## Environment Variables

Make sure your `.env.local` file contains:

```env
VITE_SUPABASE_URL=https://akxlxxdjobaesrnucksy.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Sample Data

The sample data includes:
- 5 Lagos neighborhoods (Downtown, Victoria Island, Ikoyi, Lekki, Surulere)
- 5 sample properties (mix of rentals and sales)
- Property images linked to existing images in your `/public` folder

## Next Steps

After running the migrations:

1. **Test Authentication**: Verify Google OAuth and email/password login work
2. **Test Property Queries**: Use the Supabase API to fetch properties
3. **Set up Storage**: Configure Supabase Storage for property images
4. **Add Real Data**: Replace sample data with real property listings
5. **Configure Webhooks**: Set up webhooks for real-time updates

## API Integration

The schema is designed to work with:
- Supabase JavaScript client
- Real-time subscriptions
- PostGIS spatial queries
- Full-text search capabilities

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Property owners/agents can manage their listings
- Public data (active properties, neighborhoods) is readable by all
