-- Create store_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create store_products table with seller information
CREATE TABLE IF NOT EXISTS store_products (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    discount_price DECIMAL(15,2),
    sku TEXT,
    stock INTEGER DEFAULT 0,
    images TEXT[],
    category_id TEXT REFERENCES store_categories(id),
    brand TEXT,
    specifications JSONB,
    weight DECIMAL(10,2),
    dimensions TEXT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    seller_name TEXT,
    seller_phone TEXT,
    seller_email TEXT,
    seller_address TEXT,
    seller_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert store categories
INSERT INTO store_categories (id, name, description, image) VALUES
('store-cat-1', 'Electronics', 'Latest electronics and gadgets', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'),
('store-cat-2', 'Office Supplies', 'Everything for your office needs', 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=400&h=300&fit=crop'),
('store-cat-3', 'Construction Materials', 'Quality building materials', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop'),
('store-cat-4', 'Furniture', 'Office and home furniture', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert store products with seller information
INSERT INTO store_products (id, name, description, price, sku, stock, images, category_id, brand, seller_name, seller_phone, seller_email, seller_address, seller_description, is_featured) VALUES
('store-1', 'HP Laptop EliteBook 850', 
'Professional laptop with Intel Core i7 processor, 16GB RAM, 512GB SSD. Perfect for business and development work.',
450000.00, 'HP-EB850-001', 25,
ARRAY['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop'],
'store-cat-1', 'HP', 'TechWorld Lagos', '+234-901-234-5678', 'sales@techworld.ng',
'Computer Village, Ikeja, Lagos State',
'Authorized HP dealer with 15+ years experience. We offer genuine products with full warranty and after-sales support. Bulk discounts available for corporate customers.', true),

('store-2', 'Office Desk (Executive)',
'Premium executive office desk made from solid wood with built-in drawers and cable management system.',
85000.00, 'DESK-EXE-001', 15,
ARRAY['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=600&h=400&fit=crop'],
'store-cat-4', 'Custom Furniture', 'Lagos Office Solutions', '+234-803-876-5432', 'info@lagosoffice.ng',
'Allen Avenue, Ikeja, Lagos State',
'Leading office furniture supplier in Lagos. We manufacture and import high-quality furniture with custom design options. Installation and warranty included.', false),

('store-3', 'Cement (Dangote)',
'High-quality Portland cement, Grade 42.5. Suitable for all construction projects from residential to commercial.',
3500.00, 'DAN-CEM-425', 500,
ARRAY['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop'],
'store-cat-3', 'Dangote', 'BuildMart Supplies', '+234-705-123-9876', 'orders@buildmart.ng',
'Oshodi Industrial Estate, Lagos State',
'Authorized Dangote cement distributor. We supply to contractors, developers, and individual builders. Free delivery within Lagos for bulk orders above 100 bags.', true),

('store-4', 'A4 Printing Paper (Ream)',
'Premium quality A4 copier paper, 80GSM. Suitable for all printers and photocopiers. Bright white finish.',
2800.00, 'A4-80GSM-001', 200,
ARRAY['https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&h=400&fit=crop'],
'store-cat-2', 'Double A', 'Paper Plus Limited', '+234-814-567-8901', 'contact@paperplus.ng',
'Apapa Commercial Area, Lagos State',
'Wholesale stationery supplier serving businesses across Nigeria. We stock all major paper brands with competitive pricing and fast delivery.', false)
ON CONFLICT (id) DO NOTHING;
