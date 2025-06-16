-- Query to show all tables and their columns in the database
-- This will help you understand the current database structure

-- Display header message
DO $$ BEGIN RAISE NOTICE '=== DATABASE SCHEMA OVERVIEW ==='; END $$;
DO $$ BEGIN RAISE NOTICE 'All tables and their columns in the current database:'; END $$;

SELECT 
    t.table_name,
    c.column_name,
    c.data_type,
    c.character_maximum_length,
    c.is_nullable,
    c.column_default,
    CASE 
        WHEN pk.column_name IS NOT NULL THEN 'PRIMARY KEY'
        WHEN fk.column_name IS NOT NULL THEN 'FOREIGN KEY → ' || fk.foreign_table_name || '(' || fk.foreign_column_name || ')'
        ELSE ''
    END AS key_info
FROM 
    information_schema.tables t
LEFT JOIN 
    information_schema.columns c ON t.table_name = c.table_name
LEFT JOIN (
    -- Primary key information
    SELECT 
        kcu.table_name,
        kcu.column_name
    FROM 
        information_schema.table_constraints tc
    JOIN 
        information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    WHERE 
        tc.constraint_type = 'PRIMARY KEY'
) pk ON c.table_name = pk.table_name AND c.column_name = pk.column_name
LEFT JOIN (
    -- Foreign key information
    SELECT 
        kcu.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
    FROM 
        information_schema.table_constraints tc
    JOIN 
        information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN 
        information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
    WHERE 
        tc.constraint_type = 'FOREIGN KEY'
) fk ON c.table_name = fk.table_name AND c.column_name = fk.column_name
WHERE 
    t.table_schema = 'public' 
    AND t.table_type = 'BASE TABLE'
    AND c.table_name IS NOT NULL
ORDER BY 
    t.table_name, 
    c.ordinal_position;

-- Display section header
DO $$ BEGIN RAISE NOTICE '=== TABLE SUMMARY ==='; END $$;
DO $$ BEGIN RAISE NOTICE 'Count of tables and columns:'; END $$;

SELECT 
    COUNT(DISTINCT table_name) as total_tables,
    COUNT(*) as total_columns
FROM 
    information_schema.columns 
WHERE 
    table_schema = 'public';

-- Display section header
DO $$ BEGIN RAISE NOTICE '=== MISSING TABLES CHECK ==='; END $$;
DO $$ BEGIN RAISE NOTICE 'Checking for tables that should be created by migration:'; END $$;

SELECT 
    'vendor_applications' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendor_applications') 
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING' 
    END as status
UNION ALL
SELECT 
    'image_uploads' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'image_uploads') 
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING' 
    END as status
UNION ALL
SELECT 
    'testimonials' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') 
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING' 
    END as status
UNION ALL
SELECT 
    'contact_messages' as table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'contact_messages') 
        THEN '✓ EXISTS' 
        ELSE '✗ MISSING'    END as status;

-- Display section header
DO $$ BEGIN RAISE NOTICE '=== TESTIMONIALS STRUCTURE CHECK ==='; END $$;
DO $$ BEGIN RAISE NOTICE 'Detailed analysis of testimonials table (if it exists):'; END $$;

DO $$
DECLARE
    rec RECORD;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE NOTICE 'testimonials table EXISTS - analyzing structure:';
        
        FOR rec IN 
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'testimonials' 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  % | % | nullable: % | default: %', 
                rec.column_name, rec.data_type, rec.is_nullable, COALESCE(rec.column_default, 'none');
        END LOOP;
        
        -- Check for specific problematic columns
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'project_id') THEN
            RAISE NOTICE '  ⚠️  WARNING: project_id column found (old structure)';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
            RAISE NOTICE '  ❌ ERROR: service_category column missing (will cause migration to fail)';
        ELSE
            RAISE NOTICE '  ✅ service_category column found';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'project_reference') THEN
            RAISE NOTICE '  ❌ project_reference column missing';
        ELSE
            RAISE NOTICE '  ✅ project_reference column found';
        END IF;
        
    ELSE
        RAISE NOTICE 'testimonials table does NOT exist - will be created by migration';    END IF;
END $$;

-- Display footer
DO $$ BEGIN RAISE NOTICE '=== END SCHEMA OVERVIEW ==='; END $$;
