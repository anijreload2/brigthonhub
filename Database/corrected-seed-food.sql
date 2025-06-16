-- Corrected Food Seed Data - matches exact TypeScript interfaces
-- Run this in Supabase SQL Editor

-- First, add seller contact columns to existing food_items table
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

-- Create food_categories table matching FoodCategory interface
CREATE TABLE IF NOT EXISTS food_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create food_items table matching FoodItem interface + seller contact fields
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    "categoryId" TEXT REFERENCES food_categories(id),
    price DECIMAL(65,30) NOT NULL,
    unit TEXT NOT NULL,
    "minimumOrder" INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    "nutritionalInfo" JSONB,
    origin TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "vendorId" TEXT,
    "sellerName" TEXT,
    "sellerPhone" TEXT,
    "sellerEmail" TEXT,
    "sellerAddress" TEXT,
    "sellerDescription" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample food categories
INSERT INTO food_categories (id, name, description, image, "isActive", "createdAt", "updatedAt") VALUES
('food-cat-1', 'Fresh Vegetables', 'Locally grown fresh vegetables', 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?w=300&h=200&fit=crop', true, NOW(), NOW()),
('food-cat-2', 'Fruits', 'Fresh tropical fruits', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&h=200&fit=crop', true, NOW(), NOW()),
('food-cat-3', 'Grains & Cereals', 'Quality grains and cereals', 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=200&fit=crop', true, NOW(), NOW()),
('food-cat-4', 'Dairy Products', 'Fresh dairy products', 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=300&h=200&fit=crop', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample food items with seller contact information
INSERT INTO food_items (id, name, description, "categoryId", price, unit, "minimumOrder", stock, images, origin, "isActive", "sellerName", "sellerPhone", "sellerEmail", "sellerAddress", "sellerDescription", "createdAt", "updatedAt") VALUES
('food-1', 'Fresh Tomatoes', 'Vine-ripened fresh tomatoes perfect for cooking and salads', 'food-cat-1', 2500, 'kg', 2, 50, 
ARRAY['https://images.unsplash.com/photo-1546470427-e7fd73845d5a?w=600&h=400&fit=crop'], 
'Lagos State', true, 'Adebayo Farms', '+234-803-123-4567', 'contact@adebayofarms.ng', '12 Farm Road, Agege, Lagos', 'Family-owned farm specializing in organic vegetables with over 15 years experience', NOW(), NOW()),

('food-2', 'Sweet Pineapples', 'Juicy sweet pineapples from our tropical farm', 'food-cat-2', 1800, 'piece', 3, 30,
ARRAY['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop'],
'Ogun State', true, 'Tropical Fruits Ltd', '+234-807-987-6543', 'sales@tropicalfruits.ng', '45 Plantation Avenue, Abeokuta, Ogun', 'Premium fruit suppliers with direct farm partnerships across Nigeria', NOW(), NOW()),

('food-3', 'Premium Rice', 'High-quality locally processed rice', 'food-cat-3', 8500, 'bag (50kg)', 1, 20,
ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop'],
'Kebbi State', true, 'Northern Grains Co.', '+234-812-555-7890', 'info@northerngrains.ng', '78 Market Street, Birnin Kebbi, Kebbi', 'Direct partnership with rice farmers ensuring quality and fair pricing', NOW(), NOW()),

('food-4', 'Fresh Milk', 'Pure fresh cow milk from local dairy farms', 'food-cat-4', 1200, 'liter', 2, 15,
ARRAY['https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=600&h=400&fit=crop'],
'Plateau State', true, 'Dairy Fresh Farms', '+234-805-246-8135', 'orders@dairyfresh.ng', '23 Dairy Lane, Jos, Plateau', 'Modern dairy farm with strict quality control and hygiene standards', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT 'Food seed data with seller contact info completed successfully!' as result;
