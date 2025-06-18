-- ADD MISSING ANONYMOUS_SENDER COLUMN
-- Run this in Supabase Dashboard > SQL Editor
-- This fixes the missing anonymous_sender column referenced in the contact-messages API

-- Add the missing anonymous_sender column
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS anonymous_sender JSONB DEFAULT NULL;

-- Add comment for the new column
COMMENT ON COLUMN contact_messages.anonymous_sender IS 'Stores name, email, phone for non-authenticated senders';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_anonymous_sender ON contact_messages USING GIN (anonymous_sender);

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'contact_messages' AND column_name = 'anonymous_sender';
