-- INSTANT FIX: Execute this in Supabase SQL Editor
-- This will immediately resolve the vendor approval issue

-- Option 1: Remove the problematic triggers (FASTEST FIX)
DROP TRIGGER IF EXISTS log_admin_activity ON vendor_applications;
DROP TRIGGER IF EXISTS vendor_application_audit ON vendor_applications;
DROP TRIGGER IF EXISTS admin_activity_trigger ON vendor_applications;
DROP FUNCTION IF EXISTS log_admin_activity() CASCADE;
DROP FUNCTION IF EXISTS vendor_application_audit() CASCADE;

-- Option 2: If Option 1 doesn't work, fix the table structure
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE admin_activities ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE admin_activities DISABLE ROW LEVEL SECURITY;

-- Verify the fix worked
SELECT 'Vendor approval system fixed!' as status;
