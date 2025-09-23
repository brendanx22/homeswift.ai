-- Add missing columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "newsletter": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS saved_properties JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb;
