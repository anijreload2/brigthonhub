-- CORRECTED HARMONIZATION SQL - SAFE VERSION
-- This script only renames columns that actually exist

-- 1. Rename users table columns from camelCase to snake_case
-- (Only the columns that actually exist in the current schema)

-- Rename updatedAt to updated_at
ALTER TABLE users RENAME COLUMN "updatedAt" TO updated_at;

-- Rename createdAt to created_at  
ALTER TABLE users RENAME COLUMN "createdAt" TO created_at;

-- Rename isActive to is_active
ALTER TABLE users RENAME COLUMN "isActive" TO is_active;

-- 2. Set default values for timestamp columns
ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW();

-- 3. Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- Create new trigger
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Success message
SELECT 'Users table harmonized to snake_case successfully!' as status;
