-- Add is_featured column to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- Update the SequelizeMeta table to mark our migration as complete
INSERT INTO "SequelizeMeta" (name) VALUES ('add-is-featured-to-properties.js') 
ON CONFLICT (name) DO NOTHING;
