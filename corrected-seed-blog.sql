-- Corrected Blog Seed Data - matches exact TypeScript interfaces
-- Run this in Supabase SQL Editor

-- Create blog_categories table matching BlogCategory interface
CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create blog_posts table matching BlogPost interface
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    "categoryId" TEXT REFERENCES blog_categories(id),
    "featuredImage" TEXT,
    tags TEXT[] DEFAULT '{}',
    "readingTime" INTEGER,
    "isPublished" BOOLEAN DEFAULT true,
    "publishedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    "authorId" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample blog categories
INSERT INTO blog_categories (id, name, description, "isActive", "createdAt", "updatedAt") VALUES
('cat-1', 'Real Estate', 'Property market insights and trends', true, NOW(), NOW()),
('cat-2', 'Agriculture', 'Modern farming and agricultural innovation', true, NOW(), NOW()),
('cat-3', 'Technology', 'Tech trends and digital innovation', true, NOW(), NOW()),
('cat-4', 'Business', 'Business development and entrepreneurship', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample blog posts with exact slugs your app expects
INSERT INTO blog_posts (id, title, slug, content, excerpt, "categoryId", "featuredImage", tags, "readingTime", "isPublished", "publishedAt", "authorId", "createdAt", "updatedAt") VALUES
('post-1', 'Lagos Real Estate Trends 2024', 'lagos-real-estate-trends-2024', 
'<h2>The Current State of Lagos Real Estate</h2><p>Lagos continues to be the epicenter of Nigeria''s real estate market, with significant developments across various sectors...</p><h3>Residential Market Insights</h3><p>The residential market in Lagos has shown remarkable resilience despite economic challenges. Areas like Victoria Island, Ikoyi, and Lekki continue to attract premium investments...</p><h3>Commercial Developments</h3><p>The commercial real estate sector is experiencing unprecedented growth, particularly in the tech and financial services sectors...</p>', 
'Explore the latest trends shaping Lagos real estate market in 2024, from residential developments to commercial investments.',
'cat-1',
'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop',
ARRAY['lagos', 'real-estate', 'investment', 'nigeria'], 5, true, NOW(), 'admin-001', NOW(), NOW()),

('post-2', 'The Future of Nigerian Agriculture', 'future-nigerian-agriculture',
'<h2>Agricultural Revolution in Nigeria</h2><p>Nigeria''s agricultural sector is undergoing a transformation driven by technology, government initiatives, and private sector investment...</p><h3>Technology Integration</h3><p>Modern farming techniques, including precision agriculture and IoT devices, are being adopted across the country...</p><h3>Government Support</h3><p>Various government programs are supporting farmers with loans, training, and modern equipment...</p>',
'How technology and innovation are transforming Nigeria''s agricultural landscape for sustainable food security.',
'cat-2',
'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop',
ARRAY['agriculture', 'technology', 'farming', 'nigeria'], 6, true, NOW(), 'admin-001', NOW(), NOW()),

('post-3', 'Tech Startups Driving Innovation', 'tech-startups-innovation',
'<h2>Nigeria''s Tech Ecosystem</h2><p>The Nigerian tech startup ecosystem has grown exponentially, attracting international investment and recognition...</p><h3>Fintech Revolution</h3><p>Nigerian fintech companies are leading the digital payment revolution across Africa...</p><h3>Investment Trends</h3><p>Venture capital funding has reached new heights, with several unicorns emerging from the Nigerian market...</p>',
'Discover how Nigerian tech startups are revolutionizing industries and attracting global investment.',
'cat-3',
'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
ARRAY['technology', 'startups', 'fintech', 'innovation'], 4, true, NOW(), 'admin-001', NOW(), NOW()),

('post-4', 'Small Business Growth Strategies', 'small-business-growth-strategies',
'<h2>Scaling Your Small Business</h2><p>Small businesses form the backbone of Nigeria''s economy. Here are proven strategies for sustainable growth...</p><h3>Digital Transformation</h3><p>Embracing digital tools and online presence is crucial for modern business success...</p><h3>Financial Management</h3><p>Proper financial planning and management are essential for business sustainability...</p>',
'Essential growth strategies every small business owner in Nigeria should implement for sustainable success.',
'cat-4',
'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=400&fit=crop',
ARRAY['business', 'entrepreneurship', 'growth', 'sme'], 7, true, NOW(), 'admin-001', NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

SELECT 'Blog seed data completed successfully!' as result;
