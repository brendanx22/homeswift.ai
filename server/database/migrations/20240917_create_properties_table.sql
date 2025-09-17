-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  duration TEXT CHECK (duration IN ('day', 'week', 'month', 'year')),
  type TEXT NOT NULL CHECK (type IN ('For Rent', 'For Sale')),
  beds INTEGER NOT NULL,
  baths INTEGER NOT NULL,
  sqft INTEGER NOT NULL,
  featured BOOLEAN DEFAULT false,
  available_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users"
ON public.properties
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Enable insert for authenticated users only"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Enable update for users based on agent_id"
ON public.properties
FOR UPDATE
TO authenticated
USING (auth.uid() = agent_id)
WITH CHECK (auth.uid() = agent_id);

-- Create indexes for better query performance
CREATE INDEX idx_properties_type ON public.properties(type);
CREATE INDEX idx_properties_location ON public.properties(location);
CREATE INDEX idx_properties_price ON public.properties(price);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at column
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
