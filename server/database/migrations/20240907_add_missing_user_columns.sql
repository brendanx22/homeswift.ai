-- Add missing columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS avatar TEXT,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{"notifications": true, "newsletter": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS saved_properties JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS search_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS remember_token VARCHAR(255),
  ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Add created_at and updated_at if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'users' AND column_name = 'created_at') THEN
    ALTER TABLE users 
    ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Create or replace the update_modified_column function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the trigger for users table
DO $$
BEGIN
  -- Drop existing trigger if it exists
  DROP TRIGGER IF EXISTS update_users_modtime ON users;
  
  -- Create the trigger
  EXECUTE 'CREATE TRIGGER update_users_modtime
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();';
EXCEPTION WHEN OTHERS THEN
  -- Do nothing, just prevent the error from stopping the script
  RAISE NOTICE 'Error creating trigger: %', SQLERRM;
END $$;
