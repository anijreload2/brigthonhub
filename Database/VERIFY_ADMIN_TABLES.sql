-- DATABASE TABLE VERIFICATION SCRIPT
-- This script checks which admin-referenced tables exist in the database

\echo '=== ADMIN SYSTEM TABLE VERIFICATION ==='
\echo 'Checking which tables exist for admin components...'
\echo ''

DO $$
DECLARE
    table_exists boolean;
    table_name text;
    missing_tables text[] := '{}';
    existing_tables text[] := '{}';
BEGIN
    
    -- Check ai_training_data table (referenced by AITrainingTab)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'ai_training_data'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ ai_training_data table EXISTS';
        existing_tables := existing_tables || 'ai_training_data';
    ELSE
        RAISE NOTICE '❌ ai_training_data table MISSING (referenced by AITrainingTab)';
        missing_tables := missing_tables || 'ai_training_data';
    END IF;

    -- Check site_settings table (referenced by SettingsTab)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'site_settings'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ site_settings table EXISTS';
        existing_tables := existing_tables || 'site_settings';
    ELSE
        RAISE NOTICE '❌ site_settings table MISSING (referenced by SettingsTab)';
        missing_tables := missing_tables || 'site_settings';
    END IF;

    -- Check content_blocks table (referenced by HeroTab)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'content_blocks'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ content_blocks table EXISTS';
        existing_tables := existing_tables || 'content_blocks';
    ELSE
        RAISE NOTICE '❌ content_blocks table MISSING (referenced by HeroTab)';
        missing_tables := missing_tables || 'content_blocks';
    END IF;

    -- Check media_gallery table (referenced by ImageManagementTab)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'media_gallery'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ media_gallery table EXISTS';
        existing_tables := existing_tables || 'media_gallery';
    ELSE
        RAISE NOTICE '❌ media_gallery table MISSING (referenced by ImageManagementTab)';
        missing_tables := missing_tables || 'media_gallery';
    END IF;

    -- Check contact_messages table (has API but no admin tab)
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'contact_messages'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ contact_messages table EXISTS (has API, needs admin tab)';
        existing_tables := existing_tables || 'contact_messages';
    ELSE
        RAISE NOTICE '❌ contact_messages table MISSING';
        missing_tables := missing_tables || 'contact_messages';
    END IF;

    -- Summary
    RAISE NOTICE '';
    RAISE NOTICE '=== SUMMARY ===';
    RAISE NOTICE 'Existing tables: %', array_to_string(existing_tables, ', ');
    RAISE NOTICE 'Missing tables: %', array_to_string(missing_tables, ', ');
    RAISE NOTICE 'Tables to create: %', array_length(missing_tables, 1);
    
END $$;

-- Show structure of existing tables
\echo ''
\echo '=== EXISTING TABLE STRUCTURES ==='

-- Check if testimonials table exists and show its structure (already fixed)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE NOTICE '';
        RAISE NOTICE '--- testimonials table structure (FIXED) ---';
    END IF;
END $$;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check vendor_applications table (should be working)
\echo ''
\echo '--- vendor_applications table structure ---'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vendor_applications' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check image_uploads table (should be working)
\echo ''
\echo '--- image_uploads table structure ---'
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'image_uploads' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
