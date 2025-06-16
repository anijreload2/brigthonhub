-- Safe Detail Pages Migration
-- This migration only adds essential fields for detail pages functionality
-- Run this instead of DETAIL_PAGES_MIGRATION.sql if you get constraint errors

-- Add seller contact fields to food_items (essential for food detail pages)
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_address TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_description TEXT;

-- Add seller contact fields to store_products (essential for store detail pages)
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_address TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_description TEXT;

-- Add basic fields for blog posts (essential for blog detail pages)
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure blog_posts table exists with minimal required structure
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    author TEXT,
    tags TEXT[],
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure projects table has basic required fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS inquiry_count INTEGER DEFAULT 0;

-- Success message
SELECT 'Safe Detail Pages Migration completed successfully!' as result;
