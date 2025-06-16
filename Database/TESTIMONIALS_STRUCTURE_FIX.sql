-- ============================================================================
-- TESTIMONIALS TABLE STRUCTURE FIX MIGRATION
-- ============================================================================
-- Purpose: Fix testimonials table structure to match admin expectations
-- Author: Admin System Fix
-- Date: 2024-12-16
-- Version: 1.0
-- ============================================================================

-- BACKUP CURRENT DATA FIRST
-- Create backup table with current data
CREATE TABLE testimonials_backup_20241216 AS 
SELECT * FROM testimonials;

-- ============================================================================
-- STEP 1: ADD NEW COLUMNS TO EXISTING TABLE
-- ============================================================================

-- Add missing columns that are expected by admin interface
ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS service_category TEXT,
ADD COLUMN IF NOT EXISTS project_reference TEXT,
ADD COLUMN IF NOT EXISTS client_name TEXT,
ADD COLUMN IF NOT EXISTS client_title TEXT,
ADD COLUMN IF NOT EXISTS client_company TEXT,
ADD COLUMN IF NOT EXISTS testimonial_text TEXT,
ADD COLUMN IF NOT EXISTS client_image TEXT;

-- ============================================================================
-- STEP 2: MIGRATE EXISTING DATA TO NEW STRUCTURE
-- ============================================================================

-- Copy data from old columns to new columns
UPDATE testimonials SET
    client_name = name,
    client_title = role,
    client_company = company,
    testimonial_text = content,
    client_image = avatar_url
WHERE client_name IS NULL;

-- Set default values for new required fields
UPDATE testimonials SET
    service_category = 'general',
    project_reference = CONCAT('ref-', SUBSTRING(id::text, 1, 8))
WHERE service_category IS NULL;

-- ============================================================================
-- STEP 3: VERIFY DATA MIGRATION
-- ============================================================================

-- Check that all data has been migrated correctly
DO $$
DECLARE
    old_count INTEGER;
    new_count INTEGER;
    null_client_names INTEGER;
    null_testimonial_texts INTEGER;
BEGIN
    -- Count original records
    SELECT COUNT(*) INTO old_count FROM testimonials WHERE name IS NOT NULL;
    
    -- Count migrated records
    SELECT COUNT(*) INTO new_count FROM testimonials WHERE client_name IS NOT NULL;
    
    -- Count null values in required fields
    SELECT COUNT(*) INTO null_client_names FROM testimonials WHERE client_name IS NULL;
    SELECT COUNT(*) INTO null_testimonial_texts FROM testimonials WHERE testimonial_text IS NULL;
    
    -- Report migration status
    RAISE NOTICE 'Migration Status:';
    RAISE NOTICE 'Original records with name: %', old_count;
    RAISE NOTICE 'Migrated records with client_name: %', new_count;
    RAISE NOTICE 'Records with null client_name: %', null_client_names;
    RAISE NOTICE 'Records with null testimonial_text: %', null_testimonial_texts;
    
    -- Check if migration was successful
    IF old_count != new_count THEN
        RAISE EXCEPTION 'Data migration failed: counts do not match';
    END IF;
    
    IF null_client_names > 0 OR null_testimonial_texts > 0 THEN
        RAISE EXCEPTION 'Data migration failed: null values in required fields';
    END IF;
    
    RAISE NOTICE 'Data migration completed successfully!';
END $$;

-- ============================================================================
-- STEP 4: ADD CONSTRAINTS AND INDEXES
-- ============================================================================

-- Add NOT NULL constraints to required fields
ALTER TABLE testimonials
ALTER COLUMN client_name SET NOT NULL,
ALTER COLUMN testimonial_text SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_testimonials_service_category ON testimonials(service_category);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_featured ON testimonials(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_active ON testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_display_order ON testimonials(display_order);

-- ============================================================================
-- STEP 5: UPDATE RLS POLICIES (if they exist)
-- ============================================================================

-- Check if RLS is enabled and update policies if needed
DO $$
BEGIN
    -- Enable RLS if not already enabled
    ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Public testimonials are viewable by everyone" ON testimonials;
    DROP POLICY IF EXISTS "Users can insert testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Users can update their own testimonials" ON testimonials;
    DROP POLICY IF EXISTS "Admins can manage all testimonials" ON testimonials;
    
    -- Create new policies
    CREATE POLICY "Public testimonials are viewable by everyone"
        ON testimonials FOR SELECT
        USING (is_active = true);
    
    CREATE POLICY "Users can insert testimonials"
        ON testimonials FOR INSERT
        WITH CHECK (true);
    
    CREATE POLICY "Admins can manage all testimonials"
        ON testimonials FOR ALL
        USING (
            EXISTS (
                SELECT 1 FROM users 
                WHERE users.id = auth.uid()::text 
                AND users.role = 'ADMIN'
            )
        );
        
    RAISE NOTICE 'RLS policies updated successfully!';
END $$;

-- ============================================================================
-- STEP 6: OPTIONAL - REMOVE OLD COLUMNS (COMMENTED OUT FOR SAFETY)
-- ============================================================================

-- WARNING: Only run this after confirming everything works in production
-- ALTER TABLE testimonials 
-- DROP COLUMN IF EXISTS name,
-- DROP COLUMN IF EXISTS role,
-- DROP COLUMN IF EXISTS company,
-- DROP COLUMN IF EXISTS content,
-- DROP COLUMN IF EXISTS avatar_url;

-- ============================================================================
-- STEP 7: VERIFICATION QUERIES
-- ============================================================================

-- Final verification query
SELECT 
    COUNT(*) as total_records,
    COUNT(CASE WHEN client_name IS NOT NULL THEN 1 END) as records_with_client_name,
    COUNT(CASE WHEN testimonial_text IS NOT NULL THEN 1 END) as records_with_testimonial_text,
    COUNT(CASE WHEN service_category IS NOT NULL THEN 1 END) as records_with_service_category,
    COUNT(CASE WHEN project_reference IS NOT NULL THEN 1 END) as records_with_project_reference,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_records
FROM testimonials;

-- Sample the migrated data
SELECT 
    id,
    client_name,
    client_title,
    client_company,
    LEFT(testimonial_text, 50) || '...' as testimonial_preview,
    service_category,
    project_reference,
    rating,
    is_featured,
    is_active,
    display_order,
    created_at
FROM testimonials 
ORDER BY display_order, created_at DESC 
LIMIT 5;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (IN CASE OF EMERGENCY)
-- ============================================================================

/*
-- EMERGENCY ROLLBACK PROCEDURE:
-- 1. Drop the current testimonials table
DROP TABLE testimonials;

-- 2. Rename backup table back to original
ALTER TABLE testimonials_backup_20241216 RENAME TO testimonials;

-- 3. Re-enable RLS if needed
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- 4. Recreate original policies (copy from your original schema)
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

COMMENT ON TABLE testimonials IS 'Client testimonials with updated structure for admin compatibility';
COMMENT ON COLUMN testimonials.client_name IS 'Name of the client providing testimonial';
COMMENT ON COLUMN testimonials.client_title IS 'Job title/position of the client';
COMMENT ON COLUMN testimonials.client_company IS 'Company/organization of the client';
COMMENT ON COLUMN testimonials.testimonial_text IS 'The actual testimonial content';
COMMENT ON COLUMN testimonials.service_category IS 'Category of service the testimonial is for';
COMMENT ON COLUMN testimonials.project_reference IS 'Reference to related project if applicable';
COMMENT ON COLUMN testimonials.client_image IS 'URL to client photo/avatar';

-- Log completion
SELECT 'Testimonials table structure fix migration completed successfully!' as status;
