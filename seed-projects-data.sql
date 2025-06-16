-- Create projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    long_description TEXT,
    images TEXT[],
    technologies TEXT[],
    project_url TEXT,
    github_url TEXT,
    status TEXT DEFAULT 'completed',
    start_date DATE,
    end_date DATE,
    client TEXT,
    budget DECIMAL(15,2),
    category TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample projects
INSERT INTO projects (id, title, description, long_description, images, technologies, project_url, status, client, category, is_featured) VALUES
('proj-1', 'Modern E-commerce Platform', 
'A full-featured e-commerce platform built with Next.js and Supabase, featuring real-time inventory management and payment processing.',
'This comprehensive e-commerce solution includes user authentication, product catalog management, shopping cart functionality, payment integration with Paystack, order tracking, and admin dashboard. Built with modern technologies for scalability and performance.',
ARRAY['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop', 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop'],
ARRAY['Next.js', 'React', 'Supabase', 'TypeScript', 'Tailwind CSS', 'Paystack'],
'https://demo-ecommerce.brightonhub.ng', 'completed', 'TechMart Nigeria', 'web-development', true),

('proj-2', 'Real Estate Management System',
'Comprehensive property management solution with tenant management, rent collection, and maintenance tracking features.',
'A complete real estate management platform that automates property operations including tenant onboarding, lease management, rent collection, maintenance requests, financial reporting, and communication tools. Features include mobile apps for tenants and property managers.',
ARRAY['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=400&fit=crop', 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=400&fit=crop'],
ARRAY['React Native', 'Node.js', 'PostgreSQL', 'Express', 'React', 'Stripe'],
'https://propertymanager.demo.ng', 'completed', 'Lagos Property Group', 'mobile-development', true),

('proj-3', 'Agricultural IoT Dashboard',
'Smart farming dashboard that monitors soil conditions, weather data, and crop health using IoT sensors and machine learning.',
'An innovative agricultural technology solution that combines IoT sensors, weather APIs, and machine learning algorithms to provide farmers with real-time insights about their crops. Features include predictive analytics, automated irrigation controls, and mobile alerts.',
ARRAY['https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=400&fit=crop', 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=400&fit=crop'],
ARRAY['Python', 'Django', 'Machine Learning', 'IoT', 'React', 'PostgreSQL'],
'https://smartfarm.demo.ng', 'completed', 'AgriTech Solutions', 'iot-development', false),

('proj-4', 'Fintech Mobile App',
'Digital banking and payment solution with features for transfers, bill payments, and financial analytics.',
'A comprehensive fintech application providing digital banking services including account management, peer-to-peer transfers, bill payments, savings goals, spending analytics, and investment options. Built with security-first architecture and regulatory compliance.',
ARRAY['https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop', 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=400&fit=crop'],
ARRAY['React Native', 'Node.js', 'MongoDB', 'Firebase', 'Plaid API', 'Encryption'],
'https://fintechapp.demo.ng', 'in-progress', 'PayNow Financial', 'fintech', true)
ON CONFLICT (id) DO NOTHING;
