-- Corrected Projects Seed Data - matches exact TypeScript interfaces
-- Run this in Supabase SQL Editor

-- Create project_categories table matching ProjectCategory interface
CREATE TABLE IF NOT EXISTS project_categories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create projects table matching Project interface
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    "categoryId" TEXT REFERENCES project_categories(id),
    "beforeImages" TEXT[] DEFAULT '{}',
    "afterImages" TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'COMPLETED',
    budget DECIMAL(65,30),
    "startDate" DATE,
    "endDate" DATE,
    location TEXT,
    "clientName" TEXT,
    testimonial TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert sample project categories
INSERT INTO project_categories (id, name, description, "isActive", "createdAt", "updatedAt") VALUES
('proj-cat-1', 'Residential Construction', 'Home building and renovation projects', true, NOW(), NOW()),
('proj-cat-2', 'Commercial Development', 'Office buildings and commercial spaces', true, NOW(), NOW()),
('proj-cat-3', 'Infrastructure', 'Roads, bridges, and public infrastructure', true, NOW(), NOW()),
('proj-cat-4', 'Interior Design', 'Interior decoration and space planning', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, title, description, "categoryId", "beforeImages", "afterImages", status, budget, "startDate", "endDate", location, "clientName", testimonial, "isActive", "createdAt", "updatedAt") VALUES
('proj-1', 'Modern Family Home in Lekki', 'Complete construction of a 4-bedroom duplex with modern amenities and smart home features', 'proj-cat-1',
ARRAY['https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=600&h=400&fit=crop'],
ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'],
'COMPLETED', 35000000, '2023-08-15', '2024-02-20', 'Lekki Phase 1, Lagos', 'Mr. and Mrs. Johnson',
'BrightonHub delivered beyond our expectations. The quality of work and attention to detail was exceptional.', true, NOW(), NOW()),

('proj-2', 'Corporate Office Complex', 'Design and construction of a 5-story office building with modern facilities', 'proj-cat-2',
ARRAY['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=400&fit=crop'],
ARRAY['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop'],
'COMPLETED', 85000000, '2023-06-01', '2024-01-15', 'Victoria Island, Lagos', 'TechFlow Industries',
'Professional service from start to finish. Our new office space has transformed our business operations.', true, NOW(), NOW()),

('proj-3', 'Highway Bridge Construction', 'Construction of a modern concrete bridge over the river connecting two major highways', 'proj-cat-3',
ARRAY['https://images.unsplash.com/photo-1581092335878-eb19c6c05b0c?w=600&h=400&fit=crop'],
ARRAY['https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&h=400&fit=crop'],
'COMPLETED', 125000000, '2023-03-10', '2023-11-30', 'Ogun State', 'Federal Ministry of Works',
'Excellent execution of a complex infrastructure project within timeline and budget.', true, NOW(), NOW()),

('proj-4', 'Luxury Hotel Interior', 'Complete interior design and furnishing of a 50-room luxury hotel', 'proj-cat-4',
ARRAY['https://images.unsplash.com/photo-1631049552240-59c37f38802b?w=600&h=400&fit=crop'],
ARRAY['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop'],
'COMPLETED', 45000000, '2023-09-01', '2024-03-15', 'Abuja, FCT', 'Grand Palace Hotels',
'The interior design perfectly captures our brand aesthetic. Guest satisfaction has increased significantly.', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT 'Projects seed data completed successfully!' as result;
