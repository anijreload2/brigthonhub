-- Add auth_user_id column to users table to link with Supabase Auth
-- This migration fixes the vendor signup process

BEGIN;

-- Add the auth_user_id column to users table
ALTER TABLE users 
ADD COLUMN auth_user_id UUID REFERENCES auth.users(id);

-- Create an index for better performance
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- Add a unique constraint to ensure one-to-one relationship
ALTER TABLE users 
ADD CONSTRAINT users_auth_user_id_unique UNIQUE (auth_user_id);

-- Update any existing users with NULL auth_user_id if needed
-- This is for backward compatibility
COMMENT ON COLUMN users.auth_user_id IS 'Links to Supabase auth.users table for authentication';

COMMIT;

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
