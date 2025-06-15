-- Detail Pages Enhancement Migration
-- This adds fields required for rich detail pages
-- Execute this in Supabase Dashboard > SQL Editor

-- PROPERTIES TABLE ENHANCEMENTS
-- Add missing fields for rich property details
ALTER TABLE properties ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighborhood_info JSONB;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_documents TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floor_plans TEXT[];
ALTER TABLE properties ADD COLUMN IF NOT EXISTS energy_rating TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS furnished BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS pet_friendly BOOLEAN DEFAULT false;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS parking_spaces INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS year_built INTEGER;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS property_tax DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS hoa_fees DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS lead_count INTEGER DEFAULT 0;

-- FOOD ITEMS TABLE ENHANCEMENTS
-- Add missing fields for detailed food product pages
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS supplier_info JSONB;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS ingredients TEXT[];
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS allergens TEXT[];
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS shelf_life TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS storage_instructions TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS certifications TEXT[];
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS harvest_date DATE;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS packaging_type TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS bulk_pricing JSONB;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seasonal_availability JSONB;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- PROJECTS TABLE ENHANCEMENTS
-- Add missing fields for detailed project showcases
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS timeline_phases JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_members JSONB;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS materials_used TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS techniques_used TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenges_faced TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS solutions_implemented TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_size TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS client_industry TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS awards_received TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS media_coverage TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS roi_achieved TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sustainability_features TEXT[];
ALTER TABLE projects ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;

-- BLOG POSTS TABLE ENHANCEMENTS
-- Add missing fields for rich blog content
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS meta_description TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_avatar TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS social_image TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS table_of_contents JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS related_posts TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS external_links JSONB;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS download_files TEXT[];
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- STORE PRODUCTS TABLE ENHANCEMENTS
-- Add missing fields for detailed product pages
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS weight DECIMAL(10,2);
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS dimensions JSONB;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS specifications JSONB;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS warranty_info TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS return_policy TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS shipping_info JSONB;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS bulk_pricing JSONB;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS discount_price DECIMAL(65,30);
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS vendor_id TEXT;

-- CREATE REVIEWS TABLE FOR ALL CONTENT TYPES
CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_type TEXT NOT NULL, -- 'property', 'food', 'project', 'store', 'blog'
    content_id TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT NOT NULL,
    user_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_approved BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CREATE MEDIA LIBRARY TABLE FOR CENTRALIZED ASSET MANAGEMENT
CREATE TABLE IF NOT EXISTS media_assets (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_type TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    description TEXT,
    tags TEXT[],
    folder_path TEXT,
    uploaded_by TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CREATE TAGS TABLE FOR UNIVERSAL TAGGING SYSTEM
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6b7280',
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CREATE CONTENT TAGS JUNCTION TABLE
CREATE TABLE IF NOT EXISTS content_tags (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_type, content_id, tag_id)
);

-- CREATE LEADS TABLE FOR CONTACT FORM SUBMISSIONS
CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    source_type TEXT NOT NULL, -- 'property', 'project', 'contact_form', 'food', 'store'
    source_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    budget_range TEXT,
    preferred_contact TEXT DEFAULT 'email',
    status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'closed'
    assigned_to TEXT,
    notes TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- CREATE SEO METADATA TABLE
CREATE TABLE IF NOT EXISTS seo_metadata (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    content_type TEXT NOT NULL,
    content_id TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_title TEXT,
    twitter_description TEXT,
    twitter_image TEXT,
    canonical_url TEXT,
    robots_meta TEXT DEFAULT 'index,follow',
    schema_markup JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(content_type, content_id)
);

-- ADD INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_reviews_content ON reviews(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON media_assets(file_type);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder ON media_assets(folder_path);
CREATE INDEX IF NOT EXISTS idx_content_tags_content ON content_tags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_tags_tag ON content_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_seo_content ON seo_metadata(content_type, content_id);

-- ADD FOREIGN KEY CONSTRAINTS FOR REVIEWS
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_users 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- ADD FOREIGN KEY CONSTRAINTS FOR CONTENT TAGS
ALTER TABLE content_tags ADD CONSTRAINT fk_content_tags_tags 
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE;

-- ADD FOREIGN KEY CONSTRAINTS FOR LEADS
ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned 
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL;

-- CREATE FUNCTIONS FOR AUTO-UPDATING TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- CREATE TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_assets_updated_at BEFORE UPDATE ON media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_metadata_updated_at BEFORE UPDATE ON seo_metadata
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- UPDATE RLS POLICIES TO ALLOW PUBLIC READ ACCESS FOR DETAIL PAGES

-- Enable RLS on new tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to approved reviews" ON reviews
    FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow public read access to active media" ON media_assets
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to active tags" ON tags
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow public read access to content tags" ON content_tags
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to seo metadata" ON seo_metadata
    FOR SELECT USING (true);

-- Admin access policies
CREATE POLICY "Allow admin full access to reviews" ON reviews
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to media_assets" ON media_assets
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to tags" ON tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to content_tags" ON content_tags
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to leads" ON leads
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Allow admin full access to seo_metadata" ON seo_metadata
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Insert sample tags for content organization
INSERT INTO tags (name, slug, description, color) VALUES
('Premium', 'premium', 'High-end premium content', '#fbbf24'),
('Featured', 'featured', 'Featured content', '#ef4444'),
('New', 'new', 'Newly added content', '#10b981'),
('Popular', 'popular', 'Popular content', '#8b5cf6'),
('Trending', 'trending', 'Trending content', '#f59e0b'),
('Sale', 'sale', 'On sale items', '#dc2626'),
('Organic', 'organic', 'Organic food products', '#059669'),
('Local', 'local', 'Local products and services', '#0ea5e9'),
('Luxury', 'luxury', 'Luxury properties and products', '#7c3aed'),
('Eco-Friendly', 'eco-friendly', 'Environmentally friendly', '#16a34a')
ON CONFLICT (slug) DO NOTHING;

-- Create a function to automatically generate slugs for blog posts
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(regexp_replace(trim(title), '[^a-zA-Z0-9\s]', '', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Add trigger to auto-generate slugs for blog posts if not provided
CREATE OR REPLACE FUNCTION auto_generate_blog_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.title) || '-' || extract(epoch from now())::text;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_blog_slug BEFORE INSERT OR UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION auto_generate_blog_slug();

-- Add sample content for testing detail pages
-- This will be populated by the admin through the interface

COMMENT ON TABLE reviews IS 'Universal reviews system for all content types';
COMMENT ON TABLE media_assets IS 'Centralized media library for all images, videos, and documents';
COMMENT ON TABLE tags IS 'Universal tagging system for content organization';
COMMENT ON TABLE content_tags IS 'Junction table linking content to tags';
COMMENT ON TABLE leads IS 'Lead management system for contact forms and inquiries';
COMMENT ON TABLE seo_metadata IS 'SEO metadata for all content types';

-- Migration completed successfully
SELECT 'Detail Pages Enhancement Migration completed successfully!' as message;
