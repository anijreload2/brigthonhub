-- Fix admin_activities table completely
-- Add missing ID column with UUID default
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid() PRIMARY KEY;

-- Add all common columns that might be needed
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS action TEXT;
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS entityType TEXT;
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS entityId TEXT;
ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS details JSONB;

-- Make userId nullable since it's causing NOT NULL constraint errors
ALTER TABLE admin_activities ALTER COLUMN userId DROP NOT NULL;

-- Set default values for timestamp columns
ALTER TABLE admin_activities ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE admin_activities ALTER COLUMN updated_at SET DEFAULT NOW();

-- Success message
SELECT 'admin_activities table fixed successfully!' as status;
