-- HARMONIZE ALL TABLES - FIX COLUMN NAMING INCONSISTENCIES
-- This script will standardize all table columns to use snake_case consistently

-- 1. Fix users table to use snake_case (only rename columns that exist)
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;
ALTER TABLE users RENAME COLUMN "isActive" TO is_active;
-- Note: emailVerified and signupType don't exist in current schema, skipping

-- 2. Vendor tables are already using snake_case - no changes needed
-- vendor_applications: already has created_at, updated_at
-- vendor_listings: already has created_at, updated_at  
-- vendor_messages: already has created_at
-- vendor_analytics: already has created_at, updated_at

-- 4. Update RLS policies to use correct column names
-- Drop existing policies if they exist (using IF EXISTS)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;

-- Recreate users policies with correct column names
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id OR auth.uid()::text = auth_user_id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id OR auth.uid()::text = auth_user_id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update users" ON users
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid()::text 
            AND u.role = 'ADMIN'
        )
    );

-- 3. auth_user_id column already exists in users table - no changes needed

-- 5. Ensure all tables have proper timestamps with defaults
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();

-- Vendor tables already have proper defaults, but ensure they're set
ALTER TABLE vendor_applications ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE vendor_applications ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE vendor_listings ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE vendor_listings ALTER COLUMN updated_at SET DEFAULT NOW();

ALTER TABLE vendor_messages ALTER COLUMN created_at SET DEFAULT NOW();

ALTER TABLE vendor_analytics ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE vendor_analytics ALTER COLUMN updated_at SET DEFAULT NOW();

-- 6. Create triggers to automatically update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_vendor_applications_updated_at ON vendor_applications;
DROP TRIGGER IF EXISTS update_vendor_listings_updated_at ON vendor_listings;
DROP TRIGGER IF EXISTS update_vendor_analytics_updated_at ON vendor_analytics;

-- Create new triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_applications_updated_at
    BEFORE UPDATE ON vendor_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_listings_updated_at
    BEFORE UPDATE ON vendor_listings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_analytics_updated_at
    BEFORE UPDATE ON vendor_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Grant proper permissions
GRANT ALL ON users TO authenticated;
GRANT ALL ON vendor_applications TO authenticated;
GRANT ALL ON vendor_listings TO authenticated;
GRANT ALL ON vendor_messages TO authenticated;
GRANT ALL ON vendor_analytics TO authenticated;

-- Success message
SELECT 'All tables harmonized successfully with snake_case column names' as status;
