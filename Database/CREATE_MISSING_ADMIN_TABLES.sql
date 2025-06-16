-- CREATE MISSING ADMIN TABLES SCRIPT
-- This script creates tables that are referenced by admin components but may not exist

\echo '=== CREATING MISSING ADMIN TABLES ==='
\echo 'Creating tables to match AdminModal configurations...'
\echo ''

-- Create ai_training_data table (for AITrainingTab)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_training_data') THEN
        CREATE TABLE ai_training_data (
            id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
            category TEXT NOT NULL,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            language TEXT NOT NULL DEFAULT 'en',
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create index for better performance
        CREATE INDEX idx_ai_training_data_category ON ai_training_data(category);
        CREATE INDEX idx_ai_training_data_language ON ai_training_data(language);
        CREATE INDEX idx_ai_training_data_active ON ai_training_data("isActive");
        
        RAISE NOTICE '✅ Created ai_training_data table';
    ELSE
        RAISE NOTICE '✅ ai_training_data table already exists';
    END IF;
END $$;

-- Create site_settings table (for SettingsTab)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'site_settings') THEN
        CREATE TABLE site_settings (
            id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
            key TEXT NOT NULL UNIQUE,
            value TEXT NOT NULL,
            type TEXT NOT NULL DEFAULT 'string',
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create index for better performance
        CREATE INDEX idx_site_settings_key ON site_settings(key);
        CREATE INDEX idx_site_settings_type ON site_settings(type);
        
        -- Insert default settings
        INSERT INTO site_settings (key, value, type) VALUES
        ('site_name', 'BrightonHub', 'string'),
        ('site_description', 'Multi-service platform for Brighton community', 'string'),
        ('contact_email', 'info@brightonhub.com', 'string'),
        ('contact_phone', '+234-XXX-XXX-XXXX', 'string'),
        ('business_hours', '{"monday": "9:00-17:00", "tuesday": "9:00-17:00", "wednesday": "9:00-17:00", "thursday": "9:00-17:00", "friday": "9:00-17:00", "saturday": "10:00-14:00", "sunday": "closed"}', 'json'),
        ('maintenance_mode', 'false', 'boolean'),
        ('max_upload_size', '10485760', 'number'),
        ('default_currency', 'NGN', 'string'),
        ('timezone', 'Africa/Lagos', 'string'),
        ('analytics_enabled', 'true', 'boolean');
        
        RAISE NOTICE '✅ Created site_settings table with default values';
    ELSE
        RAISE NOTICE '✅ site_settings table already exists';
    END IF;
END $$;

-- Create content_blocks table (for HeroTab)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'content_blocks') THEN
        CREATE TABLE content_blocks (
            id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
            block_type TEXT NOT NULL,
            block_title TEXT,
            block_content TEXT,
            page_location TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_content_blocks_type ON content_blocks(block_type);
        CREATE INDEX idx_content_blocks_page ON content_blocks(page_location);
        CREATE INDEX idx_content_blocks_order ON content_blocks(page_location, sort_order);
        CREATE INDEX idx_content_blocks_active ON content_blocks("isActive");
        
        -- Insert default hero blocks
        INSERT INTO content_blocks (block_type, block_title, block_content, page_location, sort_order) VALUES
        ('hero', 'Welcome to BrightonHub', '{"title": "Your One-Stop Platform", "subtitle": "Properties, Food, Marketplace & More", "background_image": "/hero-bg.jpg", "cta_text": "Get Started", "cta_link": "/auth/register"}', 'home', 1),
        ('features', 'Our Services', '{"features": [{"title": "Real Estate", "description": "Find your perfect property", "icon": "home"}, {"title": "Food Services", "description": "Fresh local produce", "icon": "utensils"}, {"title": "Marketplace", "description": "Buy and sell with ease", "icon": "store"}]}', 'home', 2);
        
        RAISE NOTICE '✅ Created content_blocks table with default hero content';
    ELSE
        RAISE NOTICE '✅ content_blocks table already exists';
    END IF;
END $$;

-- Create media_gallery table (for ImageManagementTab)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'media_gallery') THEN
        CREATE TABLE media_gallery (
            id TEXT PRIMARY KEY DEFAULT generate_random_uuid()::text,
            file_name TEXT NOT NULL,
            file_url TEXT NOT NULL,
            thumbnail_url TEXT,
            file_type TEXT NOT NULL,
            file_size INTEGER,
            alt_text TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            uploaded_by TEXT REFERENCES users(id),
            "createdAt" TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better performance
        CREATE INDEX idx_media_gallery_type ON media_gallery(file_type);
        CREATE INDEX idx_media_gallery_active ON media_gallery("isActive");
        CREATE INDEX idx_media_gallery_uploader ON media_gallery(uploaded_by);
        CREATE INDEX idx_media_gallery_filename ON media_gallery(file_name);
        
        RAISE NOTICE '✅ Created media_gallery table';
    ELSE
        RAISE NOTICE '✅ media_gallery table already exists';
    END IF;
END $$;

-- Verify all tables were created
\echo ''
\echo '=== VERIFICATION ==='
\echo 'Checking all admin tables now exist...'

DO $$
DECLARE
    table_count integer;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('ai_training_data', 'site_settings', 'content_blocks', 'media_gallery', 'testimonials', 'vendor_applications', 'image_uploads', 'contact_messages');
    
    RAISE NOTICE 'Admin tables found: %/8', table_count;
    
    IF table_count = 8 THEN
        RAISE NOTICE '🎉 ALL ADMIN TABLES ARE NOW AVAILABLE!';
    ELSE
        RAISE NOTICE '⚠️  Some admin tables may still be missing';
    END IF;
END $$;

\echo ''
\echo '=== NEXT STEPS ==='
\echo '1. Create API endpoints for new tables'
\echo '2. Test admin interfaces'  
\echo '3. Add category management'
\echo '4. Create contact messages admin tab'
