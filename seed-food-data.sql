-- Create food_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS food_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    image TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create food_items table with seller information
CREATE TABLE IF NOT EXISTS food_items (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit TEXT DEFAULT 'kg',
    minimum_order INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    images TEXT[],
    category_id TEXT REFERENCES food_categories(id),
    nutritional_info JSONB,
    origin TEXT,
    is_active BOOLEAN DEFAULT true,
    seller_name TEXT,
    seller_phone TEXT,
    seller_email TEXT,
    seller_address TEXT,
    seller_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert food categories
INSERT INTO food_categories (id, name, description, image) VALUES
('food-cat-1', 'Fresh Vegetables', 'Farm-fresh vegetables delivered daily', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop'),
('food-cat-2', 'Fruits', 'Seasonal and exotic fruits', 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop'),
('food-cat-3', 'Grains & Cereals', 'Quality grains and cereals', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop'),
('food-cat-4', 'Dairy Products', 'Fresh dairy from local farms', 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Insert food items with seller information
INSERT INTO food_items (id, name, description, price, unit, minimum_order, stock, images, category_id, seller_name, seller_phone, seller_email, seller_address, seller_description) VALUES
('food-1', 'Organic Tomatoes', 
'Fresh, juicy organic tomatoes grown without pesticides. Perfect for cooking, salads, and sauces.',
500.00, 'kg', 2, 100,
ARRAY['https://images.unsplash.com/photo-1546470427-e212b9d56085?w=600&h=400&fit=crop'],
'food-cat-1', 'Adebayo Farms', '+234-803-123-4567', 'adebayo@farms.ng', 
'Km 15 Lagos-Ibadan Expressway, Ogun State', 
'Family-owned organic farm with 20+ years experience. We specialize in pesticide-free vegetables and sustainable farming practices.'),

('food-2', 'Sweet Pineapples',
'Juicy, sweet pineapples from the best farms in Benin. Rich in vitamin C and perfect for fresh consumption or juice.',
800.00, 'piece', 5, 50,
ARRAY['https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=600&h=400&fit=crop'],
'food-cat-2', 'Edo Fresh Fruits', '+234-807-987-6543', 'contact@edofresh.ng',
'Plot 45 Benin-Auchi Road, Edo State',
'Premium fruit supplier serving Lagos and surrounding states. We guarantee freshness and quality with same-day delivery.'),

('food-3', 'Local Rice (Ofada)',
'Premium quality Ofada rice, locally grown and processed. Nutritious and perfect for traditional Nigerian dishes.',
1200.00, 'kg', 5, 200,
ARRAY['https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=400&fit=crop'],
'food-cat-3', 'Ogun Rice Mills', '+234-905-555-7890', 'sales@ogunrice.ng',
'Industrial Estate, Abeokuta, Ogun State',
'Leading rice processor in Ogun State. We process and package high-quality local rice varieties for wholesale and retail.'),

('food-4', 'Fresh Cow Milk',
'Pure, fresh cow milk from grass-fed cattle. Rich in nutrients and delivered daily to ensure freshness.',
600.00, 'liter', 3, 80,
ARRAY['https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=400&fit=crop'],
'food-cat-4', 'Plateau Dairy Farm', '+234-812-345-6789', 'orders@plateaudairy.ng',
'Jos Plateau, Plateau State',
'Modern dairy farm with state-of-the-art processing facilities. Our milk is tested daily for quality and safety.')
ON CONFLICT (id) DO NOTHING;
