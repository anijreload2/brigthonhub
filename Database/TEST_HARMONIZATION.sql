-- TEST HARMONIZATION SQL - Execute this first to test
-- This will run a few safe operations to validate the SQL works

-- Test 1: Check if columns exist before renaming
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'updatedAt'
        ) THEN 'updatedAt column exists - can rename to updated_at'
        ELSE 'updatedAt column does not exist - skip rename'
    END as updatedAt_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'createdAt'
        ) THEN 'createdAt column exists - can rename to created_at'
        ELSE 'createdAt column does not exist - skip rename'
    END as createdAt_status,
    
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'isActive'
        ) THEN 'isActive column exists - can rename to is_active'
        ELSE 'isActive column does not exist - skip rename'
    END as isActive_status;

-- Test 2: Show current users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
