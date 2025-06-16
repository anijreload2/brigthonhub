-- Testimonials Management Migration
-- Run this in your Supabase SQL editor

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  company VARCHAR(255),
  content TEXT NOT NULL,
  avatar_url TEXT,
  rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_active_featured ON testimonials(is_active, is_featured, display_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample testimonials
INSERT INTO testimonials (name, role, company, content, rating, is_featured, is_active, display_order) VALUES
('Sarah Johnson', 'Property Manager', 'Lagos Estates Ltd', 'BrightonHub made finding our perfect office space effortless. Their property listings are comprehensive and their team is incredibly professional.', 5, true, true, 1),
('Michael Chen', 'Restaurant Owner', 'Chen''s Kitchen', 'The food supply service is exceptional. Fresh ingredients delivered on time, every time. Our restaurant operations have never been smoother.', 5, true, true, 2),
('Amara Okafor', 'Project Director', 'BuildRight Construction', 'Working with BrightonHub on our latest development project was a game-changer. Their project management tools and expertise are unmatched.', 5, true, true, 3);

-- Enable RLS (Row Level Security)
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for testimonials
CREATE POLICY "Allow public read access to active testimonials" ON testimonials
  FOR SELECT USING (is_active = true);

CREATE POLICY "Allow authenticated users full access" ON testimonials
  FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions
GRANT ALL ON testimonials TO authenticated;
GRANT SELECT ON testimonials TO anon;
