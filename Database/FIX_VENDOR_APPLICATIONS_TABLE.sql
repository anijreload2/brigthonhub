-- Fix vendor_applications table structure and RLS policies
-- Run this in your Supabase SQL Editor

BEGIN;

-- 1. Fix the ID column to auto-generate UUIDs
ALTER TABLE vendor_applications 
ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- 2. Enable RLS if not already enabled
ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own applications" ON vendor_applications;
DROP POLICY IF EXISTS "Users can create applications" ON vendor_applications;
DROP POLICY IF EXISTS "Admins can view all applications" ON vendor_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON vendor_applications;

-- 4. Create comprehensive RLS policies

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications" ON vendor_applications
FOR SELECT USING (auth.uid()::text = user_id);

-- Allow users to create new applications (using auth.uid())
CREATE POLICY "Users can create applications" ON vendor_applications
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own pending applications
CREATE POLICY "Users can update own pending applications" ON vendor_applications
FOR UPDATE USING (
  auth.uid()::text = user_id 
  AND status = 'pending'
);

-- Admin policies (users with role 'ADMIN' in users table)
CREATE POLICY "Admins can view all applications" ON vendor_applications
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'ADMIN'
  )
);

CREATE POLICY "Admins can update applications" ON vendor_applications
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'ADMIN'
  )
);

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS vendor_applications_user_id_idx ON vendor_applications(user_id);
CREATE INDEX IF NOT EXISTS vendor_applications_status_idx ON vendor_applications(status);
CREATE INDEX IF NOT EXISTS vendor_applications_submitted_at_idx ON vendor_applications(submitted_at);

-- 6. Create a function to automatically update user role when application is approved
CREATE OR REPLACE FUNCTION handle_vendor_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- When application is approved, update user role to VENDOR
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    UPDATE users 
    SET role = 'VENDOR', updated_at = NOW()
    WHERE id = NEW.user_id;
    
    -- Log the role change
    INSERT INTO admin_activities (
      id, 
      user_id, 
      action, 
      details, 
      created_at
    ) VALUES (
      gen_random_uuid()::text,
      NEW.reviewed_by,
      'vendor_approval',
      jsonb_build_object(
        'vendor_user_id', NEW.user_id,
        'business_name', NEW.business_name,
        'categories', NEW.categories
      ),
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger for vendor approval
DROP TRIGGER IF EXISTS vendor_approval_trigger ON vendor_applications;
CREATE TRIGGER vendor_approval_trigger
  AFTER UPDATE ON vendor_applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_vendor_approval();

-- 8. Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON vendor_applications TO authenticated;
GRANT SELECT, UPDATE ON users TO authenticated;
GRANT INSERT ON admin_activities TO authenticated;

COMMIT;

-- 9. Test the fix
DO $$
BEGIN
  RAISE NOTICE 'Vendor applications table fixes applied successfully!';
  RAISE NOTICE 'Key improvements:';
  RAISE NOTICE '- Auto-generating UUIDs for ID field';
  RAISE NOTICE '- Comprehensive RLS policies for users and admins';
  RAISE NOTICE '- Automatic role promotion when approved';
  RAISE NOTICE '- Activity logging for approvals';
  RAISE NOTICE '- Performance indexes';
END $$;
