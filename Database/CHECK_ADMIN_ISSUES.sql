-- Check what the admin_activities table actually looks like
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_activities' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if there are any triggers on vendor_applications
SELECT trigger_name, event_manipulation, action_timing, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'vendor_applications';

-- Check if there are any functions that might be causing this
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name LIKE '%admin%' OR routine_name LIKE '%vendor%';
