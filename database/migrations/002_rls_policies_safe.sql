-- Row Level Security (RLS) Policies for HomeSwift (Safe Version)
-- This version checks for existing policies before creating new ones

-- Enable RLS on all tables (safe to run multiple times)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.neighborhoods ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate them
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- User Profiles Policies
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Drop and recreate Properties Policies
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Property owners/agents can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Property owners/agents can update their properties" ON public.properties;
DROP POLICY IF EXISTS "Property owners/agents can delete their properties" ON public.properties;

CREATE POLICY "Anyone can view active properties" ON public.properties
    FOR SELECT USING (status = 'active' OR auth.uid() = agent_id OR auth.uid() = owner_id);

CREATE POLICY "Property owners/agents can insert properties" ON public.properties
    FOR INSERT WITH CHECK (auth.uid() = agent_id OR auth.uid() = owner_id);

CREATE POLICY "Property owners/agents can update their properties" ON public.properties
    FOR UPDATE USING (auth.uid() = agent_id OR auth.uid() = owner_id);

CREATE POLICY "Property owners/agents can delete their properties" ON public.properties
    FOR DELETE USING (auth.uid() = agent_id OR auth.uid() = owner_id);

-- Drop and recreate Property Images Policies
DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
DROP POLICY IF EXISTS "Property owners/agents can manage images" ON public.property_images;

CREATE POLICY "Anyone can view property images" ON public.property_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE id = property_images.property_id 
            AND (status = 'active' OR auth.uid() = agent_id OR auth.uid() = owner_id)
        )
    );

CREATE POLICY "Property owners/agents can manage images" ON public.property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE id = property_images.property_id 
            AND (auth.uid() = agent_id OR auth.uid() = owner_id)
        )
    );

-- Drop and recreate Saved Properties Policies
DROP POLICY IF EXISTS "Users can view own saved properties" ON public.saved_properties;
DROP POLICY IF EXISTS "Users can manage own saved properties" ON public.saved_properties;

CREATE POLICY "Users can view own saved properties" ON public.saved_properties
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved properties" ON public.saved_properties
    FOR ALL USING (auth.uid() = user_id);

-- Drop and recreate Saved Searches Policies
DROP POLICY IF EXISTS "Users can view own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can manage own saved searches" ON public.saved_searches;

CREATE POLICY "Users can view own saved searches" ON public.saved_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved searches" ON public.saved_searches
    FOR ALL USING (auth.uid() = user_id);

-- Drop and recreate Property Inquiries Policies
DROP POLICY IF EXISTS "Users can view own inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Property owners/agents can view inquiries for their properties" ON public.property_inquiries;
DROP POLICY IF EXISTS "Authenticated users can create inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Users can update own inquiries" ON public.property_inquiries;
DROP POLICY IF EXISTS "Property owners/agents can update inquiries for their properties" ON public.property_inquiries;

CREATE POLICY "Users can view own inquiries" ON public.property_inquiries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Property owners/agents can view inquiries for their properties" ON public.property_inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE id = property_inquiries.property_id 
            AND (auth.uid() = agent_id OR auth.uid() = owner_id)
        )
    );

CREATE POLICY "Authenticated users can create inquiries" ON public.property_inquiries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inquiries" ON public.property_inquiries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Property owners/agents can update inquiries for their properties" ON public.property_inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.properties 
            WHERE id = property_inquiries.property_id 
            AND (auth.uid() = agent_id OR auth.uid() = owner_id)
        )
    );

-- Drop and recreate Property Reviews Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.property_reviews;
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.property_reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.property_reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.property_reviews;

CREATE POLICY "Anyone can view reviews" ON public.property_reviews
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reviews" ON public.property_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.property_reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.property_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- Drop and recreate Neighborhoods Policies
DROP POLICY IF EXISTS "Anyone can view neighborhoods" ON public.neighborhoods;

CREATE POLICY "Anyone can view neighborhoods" ON public.neighborhoods
    FOR SELECT USING (true);
