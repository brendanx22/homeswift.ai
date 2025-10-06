-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(email)
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" 
ON public.waitlist 
FOR SELECT 
TO authenticated, anon
USING (true);

CREATE POLICY "Enable insert for all users"
ON public.waitlist
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON public.waitlist
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Grant permissions
GRANT SELECT, INSERT ON public.waitlist TO authenticated, anon;
GRANT USAGE, SELECT ON SEQUENCE waitlist_id_seq TO authenticated, anon;
