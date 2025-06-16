-- VENDOR MANAGEMENT MIGRATION - Aligned with Existing Schema
-- This migration adds vendor management features to the existing BrightonHub database
-- Run this in Supabase Dashboard > SQL Editor

-- ===============================================
-- 1. ADD VENDOR COLUMNS TO EXISTING USERS TABLE
-- ===============================================

-- Add vendor-related columns to existing users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'none' CHECK (vendor_status IN ('none', 'pending', 'approved', 'suspended', 'rejected')),
ADD COLUMN IF NOT EXISTS vendor_types TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS contact_preferences JSONB DEFAULT '{}';

-- Add comments for new columns
COMMENT ON COLUMN users.vendor_status IS 'Vendor approval status: none, pending, approved, suspended, rejected';
COMMENT ON COLUMN users.vendor_types IS 'Array of vendor types: property, project, food, marketplace';
COMMENT ON COLUMN users.contact_preferences IS 'JSON object storing contact preferences and visibility settings';

-- ===============================================
-- 2. CREATE NEW VENDOR MANAGEMENT TABLES
-- ===============================================

-- Vendor Applications Table
CREATE TABLE IF NOT EXISTS vendor_applications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_type TEXT NOT NULL CHECK (vendor_type IN ('property', 'project', 'food', 'marketplace')),
    business_name TEXT NOT NULL,
    business_description TEXT,
    business_address TEXT,
    business_phone TEXT,
    business_email TEXT,
    license_number TEXT,
    tax_id TEXT,
    documents JSONB DEFAULT '[]', -- Array of document URLs
    application_data JSONB DEFAULT '{}', -- Additional form data
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
    admin_notes TEXT,
    reviewed_by TEXT REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Bookmarks Table (unified for all content types)
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_type TEXT NOT NULL CHECK (content_type IN ('property', 'project', 'food_item', 'store_product', 'blog_post')),
    content_id TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, content_type, content_id)
);

-- Contact Messages Table (for vendor-customer communication)
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id TEXT REFERENCES users(id),
    recipient_id TEXT REFERENCES users(id),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    sender_phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('property', 'project', 'food_item', 'store_product', 'general')),
    content_id TEXT,
    parent_message_id TEXT REFERENCES contact_messages(id), -- For threaded replies
    status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    metadata JSONB DEFAULT '{}', -- Additional data like property viewing preferences
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Contact Info Table (extends existing user_profiles for vendors)
CREATE TABLE IF NOT EXISTS vendor_profiles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    business_name TEXT,
    business_description TEXT,
    business_address TEXT,
    business_phone TEXT,
    business_email TEXT,
    business_hours JSONB DEFAULT '{}',
    service_areas TEXT[],
    specializations TEXT[],
    website_url TEXT,
    social_media JSONB DEFAULT '{}',
    certifications TEXT[],
    languages_spoken TEXT[],
    response_time_hours INTEGER DEFAULT 24,
    minimum_project_value DECIMAL(10,2),
    contact_preferences JSONB DEFAULT '{}',
    portfolio_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 3. UPDATE EXISTING TABLES WITH VENDOR REFERENCES
-- ===============================================

-- Add vendor_id to existing tables if not present
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES users(id);

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES users(id);

ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES users(id);

ALTER TABLE store_products 
ADD COLUMN IF NOT EXISTS vendor_id TEXT REFERENCES users(id);

-- Add seller info columns to existing tables for backward compatibility
ALTER TABLE food_items 
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS seller_phone TEXT,
ADD COLUMN IF NOT EXISTS seller_email TEXT,
ADD COLUMN IF NOT EXISTS seller_address TEXT,
ADD COLUMN IF NOT EXISTS seller_description TEXT;

ALTER TABLE store_products 
ADD COLUMN IF NOT EXISTS seller_name TEXT,
ADD COLUMN IF NOT EXISTS seller_phone TEXT,
ADD COLUMN IF NOT EXISTS seller_email TEXT,
ADD COLUMN IF NOT EXISTS seller_address TEXT,
ADD COLUMN IF NOT EXISTS seller_description TEXT;

-- ===============================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ===============================================

-- Indexes for vendor management
CREATE INDEX IF NOT EXISTS idx_users_vendor_status ON users(vendor_status);
CREATE INDEX IF NOT EXISTS idx_users_vendor_types ON users USING gin(vendor_types);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_user_id ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_status ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS idx_vendor_applications_type ON vendor_applications(vendor_type);

-- Indexes for bookmarks
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_content ON user_bookmarks(content_type, content_id);

-- Indexes for contact messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender ON contact_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_recipient ON contact_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_content ON contact_messages(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_parent ON contact_messages(parent_message_id);

-- Indexes for vendor profiles
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);

-- Indexes for vendor references in existing tables
CREATE INDEX IF NOT EXISTS idx_properties_vendor_id ON properties(vendor_id);
CREATE INDEX IF NOT EXISTS idx_projects_vendor_id ON projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_food_items_vendor_id ON food_items(vendor_id);
CREATE INDEX IF NOT EXISTS idx_store_products_vendor_id ON store_products(vendor_id);

-- ===============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================

-- Enable RLS on new tables
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;

-- Vendor Applications Policies
CREATE POLICY "Users can view their own applications" ON vendor_applications
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create their own applications" ON vendor_applications
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their pending applications" ON vendor_applications
    FOR UPDATE USING (auth.uid()::text = user_id AND status = 'pending');

CREATE POLICY "Admins can view all applications" ON vendor_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- User Bookmarks Policies
CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks
    FOR ALL USING (auth.uid()::text = user_id);

-- Contact Messages Policies
CREATE POLICY "Users can view messages they sent or received" ON contact_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id OR 
        auth.uid()::text = recipient_id
    );

CREATE POLICY "Authenticated users can send messages" ON contact_messages
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Recipients can update message status" ON contact_messages
    FOR UPDATE USING (auth.uid()::text = recipient_id);

-- Vendor Profiles Policies
CREATE POLICY "Users can view all vendor profiles" ON vendor_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can manage their own vendor profile" ON vendor_profiles
    FOR ALL USING (auth.uid()::text = user_id);

-- ===============================================
-- 6. SAMPLE DATA FOR TESTING
-- ===============================================

-- Sample vendor applications (only insert if users exist)
INSERT INTO vendor_applications (user_id, vendor_type, business_name, business_description, status)
SELECT 
    id,
    'property',
    'Sample Real Estate Agency',
    'Full-service real estate agency specializing in residential and commercial properties',
    'approved'
FROM users 
WHERE role = 'ADMIN' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample contact preferences for existing users
UPDATE users 
SET contact_preferences = '{
    "show_phone": true,
    "show_email": true,
    "show_address": false,
    "preferred_contact_method": "email",
    "response_time_hours": 24,
    "available_hours": {
        "monday": "09:00-17:00",
        "tuesday": "09:00-17:00",
        "wednesday": "09:00-17:00",
        "thursday": "09:00-17:00",
        "friday": "09:00-17:00",
        "saturday": "10:00-15:00",
        "sunday": "closed"
    }
}'::jsonb
WHERE contact_preferences = '{}' OR contact_preferences IS NULL;

-- ===============================================
-- 7. TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ===============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_vendor_applications_updated_at 
    BEFORE UPDATE ON vendor_applications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON contact_messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_profiles_updated_at 
    BEFORE UPDATE ON vendor_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================
-- MIGRATION COMPLETE
-- ===============================================

-- Verify the migration
SELECT 'Vendor Management Migration Completed Successfully' as status;

-- Show summary of new tables
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_name IN ('vendor_applications', 'user_bookmarks', 'contact_messages', 'vendor_profiles')
ORDER BY table_name;
