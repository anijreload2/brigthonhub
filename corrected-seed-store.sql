-- Corrected Store Seed Data - matches exact TypeScript interfaces
-- Run this in Supabase SQL Editor

-- First, add seller contact columns to existing store_products table
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

-- Create store_categories table matching StoreCategory interface
CREATE TABLE IF NOT EXISTS store_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create store_products table matching StoreProduct interface + seller contact fields
CREATE TABLE IF NOT EXISTS store_products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    "categoryId" TEXT REFERENCES store_categories(id),
    price DECIMAL(65,30) NOT NULL,
    stock INTEGER DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    features TEXT[] DEFAULT '{}',
    brand TEXT,
    model TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "sellerName" TEXT,
    "sellerPhone" TEXT,
    "sellerEmail" TEXT,
    "sellerAddress" TEXT,
    "sellerDescription" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample store categories
INSERT INTO store_categories (id, name, description, image, "isActive", "createdAt", "updatedAt") VALUES
('store-cat-1', 'Office Equipment', 'Professional office equipment and supplies', 'https://images.unsplash.com/photo-1541746972996-4e0b0f93e586?w=300&h=200&fit=crop', true, NOW(), NOW()),
('store-cat-2', 'Construction Tools', 'Quality tools for construction and building', 'https://images.unsplash.com/photo-1581092787765-e3d2c80c0901?w=300&h=200&fit=crop', true, NOW(), NOW()),
('store-cat-3', 'Technology', 'Latest tech gadgets and devices', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop', true, NOW(), NOW()),
('store-cat-4', 'Industrial Equipment', 'Heavy-duty industrial machinery', 'https://images.unsplash.com/photo-1581092335878-eb19c6c05b0c?w=300&h=200&fit=crop', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample store products with seller contact information
INSERT INTO store_products (id, name, description, "categoryId", price, stock, images, features, brand, model, "isActive", "sellerName", "sellerPhone", "sellerEmail", "sellerAddress", "sellerDescription", "createdAt", "updatedAt") VALUES
('store-1', 'Executive Office Desk', 'Premium wooden executive desk with multiple drawers and cable management', 'store-cat-1', 185000, 8,
ARRAY['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop'],
ARRAY['Solid wood construction', 'Cable management', 'Multiple drawers', 'Scratch resistant surface'], 'OfficePro', 'EP-2024', true,
'Lagos Office Solutions', '+234-813-456-7890', 'sales@lagosoffice.ng', '15 Commercial Road, Ikeja, Lagos', 'Leading supplier of premium office furniture with 10+ years experience serving corporate clients', NOW(), NOW()),

('store-2', 'Professional Drill Set', 'Heavy-duty cordless drill set with multiple bits and battery', 'store-cat-2', 95000, 15,
ARRAY['https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=400&fit=crop'],
ARRAY['Cordless operation', '20V battery', '50+ drill bits', 'LED work light', 'Carrying case included'], 'PowerTech', 'PT-HD-500', true,
'BuildMax Tools', '+234-809-321-6547', 'orders@buildmaxtools.ng', '67 Industrial Estate, Aba, Abia', 'Trusted supplier of quality construction tools and equipment with warranty support', NOW(), NOW()),

('store-3', 'Business Laptop', 'High-performance laptop perfect for business and professional use', 'store-cat-3', 420000, 12,
ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop'],
ARRAY['Intel i7 processor', '16GB RAM', '512GB SSD', '14-inch display', '10-hour battery life'], 'TechPro', 'TP-BL-2024', true,
'Digital Hub Nigeria', '+234-802-789-4561', 'contact@digitalhub.ng', '28 Technology Drive, Abuja, FCT', 'Authorized dealer of premium tech products with full warranty and technical support services', NOW(), NOW()),

('store-4', 'Industrial Generator', 'Heavy-duty generator for industrial and commercial use', 'store-cat-4', 1250000, 3,
ARRAY['https://images.unsplash.com/photo-1581092335878-eb19c6c05b0c?w=600&h=400&fit=crop'],
ARRAY['15KVA capacity', 'Automatic start', 'Fuel efficient', 'Weather resistant', '2-year warranty'], 'PowerGen', 'PG-15000i', true,
'Industrial Power Solutions', '+234-817-654-3210', 'sales@industrialpower.ng', '42 Factory Road, Port Harcourt, Rivers', 'Specialists in industrial power solutions with nationwide installation and maintenance services', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT 'Store seed data with seller contact info completed successfully!' as result;
