-- Database Diagnostic Script
-- Run this to understand the current state before running the migration

\echo '=== DATABASE DIAGNOSTIC REPORT ==='

-- Check existing tables
\echo '\n--- Checking for existing tables ---'
SELECT 
    table_name,
    CASE 
        WHEN table_name IN ('vendor_applications', 'image_uploads', 'testimonials', 'contact_messages') 
        THEN 'TARGET TABLE'
        ELSE 'EXISTING'
    END as table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check testimonials table structure specifically
\echo '\n--- Testimonials table structure ---'
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE NOTICE 'testimonials table EXISTS';
        
        -- List all columns
        FOR r IN (SELECT column_name, data_type, is_nullable 
                  FROM information_schema.columns 
                  WHERE table_name = 'testimonials' 
                  ORDER BY ordinal_position)
        LOOP
            RAISE NOTICE '  Column: % (%, nullable: %)', r.column_name, r.data_type, r.is_nullable;
        END LOOP;
        
        -- Check for specific columns
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
            RAISE NOTICE '  ✓ service_category column found';
        ELSE
            RAISE NOTICE '  ✗ service_category column MISSING';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'project_id') THEN
            RAISE NOTICE '  ⚠ project_id column found (old structure)';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'project_reference') THEN
            RAISE NOTICE '  ✓ project_reference column found';
        ELSE
            RAISE NOTICE '  ✗ project_reference column missing';
        END IF;
    ELSE
        RAISE NOTICE 'testimonials table does NOT exist';
    END IF;
END $$;

-- Check for existing constraints
\echo '\n--- Checking foreign key constraints ---'
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('vendor_applications', 'image_uploads', 'testimonials', 'contact_messages');

-- Check for existing indexes on testimonials
\echo '\n--- Checking testimonials indexes ---'
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'testimonials';

\echo '\n=== END DIAGNOSTIC REPORT ==='
\echo '\nRecommendations:'
\echo '1. If testimonials table exists with project_id column, run the updated migration'
\echo '2. If service_category column is missing, the migration will add it'
\echo '3. Check for any foreign key constraint errors in the above output'
