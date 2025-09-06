# Database Setup Instructions for HomeSwift

## Quick Setup Guide

### 1. Run SQL Migrations in Supabase

Go to your Supabase project dashboard → SQL Editor and run these files in order:

1. **001_initial_schema.sql** - Creates all tables and indexes
2. **002_rls_policies.sql** - Sets up security policies  
3. **003_sample_data.sql** - Adds sample properties and neighborhoods

### 2. Update Google OAuth Settings

In your Supabase Auth settings, add these redirect URLs:
- `http://localhost:5173/main` (development)
- `https://your-vercel-app.vercel.app/main` (production)
- `https://akxlxxdjobaesrnucksy.supabase.co/auth/v1/callback`

### 3. Environment Variables

Ensure these are set in Vercel:
- `VITE_SUPABASE_URL=https://akxlxxdjobaesrnucksy.supabase.co`
- `VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. Google Cloud Console Setup

1. Go to Google Cloud Console
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback`
   - `https://your-vercel-app.vercel.app/auth/callback`
   - `https://akxlxxdjobaesrnucksy.supabase.co/auth/v1/callback`

### 5. Test the Setup

1. Run `npm run dev`
2. Test Google OAuth login
3. Verify user data appears in Supabase
4. Check that properties are loading from the database

## Database Schema Overview

- **user_profiles** - Extended user information
- **properties** - Property listings with location data
- **property_images** - Property photos
- **saved_properties** - User favorites
- **saved_searches** - Saved search criteria
- **property_inquiries** - Lead management
- **property_reviews** - User reviews
- **neighborhoods** - Area information

All tables have Row Level Security enabled for data protection.
