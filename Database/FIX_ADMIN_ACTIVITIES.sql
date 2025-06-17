-- Fix the admin_activities table by adding the missing user_id column
-- This will resolve the vendor application approval issue

-- Check current structure first
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_activities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Add the missing user_id column
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Also add any other commonly expected columns
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_admin_activities_user_id ON admin_activities(user_id);

-- Verify the fix
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_activities' AND table_schema = 'public'
ORDER BY ordinal_position;
