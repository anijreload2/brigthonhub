-- UNIFIED MESSAGING SYSTEM - Database Extension
-- Extends existing contact_messages table for unified messaging
-- Run this in Supabase Dashboard > SQL Editor
-- Date: June 18, 2025

-- ===============================================
-- 1. EXTEND EXISTING CONTACT_MESSAGES TABLE
-- ===============================================

-- Add new columns to support unified messaging
ALTER TABLE contact_messages 
ADD COLUMN IF NOT EXISTS thread_id TEXT,
ADD COLUMN IF NOT EXISTS reply_to TEXT REFERENCES contact_messages(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS sender_type TEXT DEFAULT 'user' CHECK (sender_type IN ('user', 'vendor', 'admin', 'anonymous')),
ADD COLUMN IF NOT EXISTS recipient_type TEXT DEFAULT 'vendor' CHECK (recipient_type IN ('user', 'vendor', 'admin', 'broadcast')),
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'direct_message' CHECK (message_type IN ('product_inquiry', 'direct_message', 'bulk_message', 'contact_form', 'system_notification')),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS email_response_id TEXT,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

-- Add comments for new columns
COMMENT ON COLUMN contact_messages.thread_id IS 'Groups related messages into conversation threads';
COMMENT ON COLUMN contact_messages.reply_to IS 'Reference to parent message for threaded replies';
COMMENT ON COLUMN contact_messages.sender_type IS 'Type of sender: user, vendor, admin, anonymous';
COMMENT ON COLUMN contact_messages.recipient_type IS 'Type of recipient: user, vendor, admin, broadcast';
COMMENT ON COLUMN contact_messages.message_type IS 'Category of message: product_inquiry, direct_message, bulk_message, contact_form, system_notification';
COMMENT ON COLUMN contact_messages.priority IS 'Message priority level: low, normal, high, urgent';
COMMENT ON COLUMN contact_messages.tags IS 'Array of tags for message categorization';
COMMENT ON COLUMN contact_messages.attachments IS 'JSON array of file attachments';
COMMENT ON COLUMN contact_messages.email_sent IS 'Whether email notification was sent';
COMMENT ON COLUMN contact_messages.email_sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN contact_messages.email_response_id IS 'ID for tracking email responses';
COMMENT ON COLUMN contact_messages.read_at IS 'Timestamp when message was read';
COMMENT ON COLUMN contact_messages.replied_at IS 'Timestamp when message was replied to';

-- ===============================================
-- 2. CREATE SUPPORTING TABLES
-- ===============================================

-- Message Participants Table (for multi-participant threads)
CREATE TABLE IF NOT EXISTS message_participants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    thread_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_type TEXT NOT NULL CHECK (user_type IN ('user', 'vendor', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(thread_id, user_id)
);

-- Bulk Message Recipients Table (for admin bulk messaging)
CREATE TABLE IF NOT EXISTS bulk_message_recipients (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    message_id TEXT NOT NULL REFERENCES contact_messages(id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_type TEXT NOT NULL CHECK (recipient_type IN ('user', 'vendor', 'admin')),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'archived', 'deleted')),
    delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, recipient_id)
);

-- Message Templates Table (for email and bulk messaging)
CREATE TABLE IF NOT EXISTS message_templates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL CHECK (template_type IN ('email_notification', 'bulk_message', 'auto_response')),
    subject_template TEXT NOT NULL,
    message_template TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by TEXT REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===============================================
-- 3. CREATE ADDITIONAL INDEXES
-- ===============================================

-- Indexes for new columns on contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_thread_id ON contact_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_reply_to ON contact_messages(reply_to);
CREATE INDEX IF NOT EXISTS idx_contact_messages_sender_type ON contact_messages(sender_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_recipient_type ON contact_messages(recipient_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_message_type ON contact_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_contact_messages_priority ON contact_messages(priority);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email_sent ON contact_messages(email_sent);
CREATE INDEX IF NOT EXISTS idx_contact_messages_read_at ON contact_messages(read_at);

-- Indexes for supporting tables
CREATE INDEX IF NOT EXISTS idx_message_participants_thread_id ON message_participants(thread_id);
CREATE INDEX IF NOT EXISTS idx_message_participants_user_id ON message_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_message_participants_user_type ON message_participants(user_type);

CREATE INDEX IF NOT EXISTS idx_bulk_recipients_message_id ON bulk_message_recipients(message_id);
CREATE INDEX IF NOT EXISTS idx_bulk_recipients_recipient_id ON bulk_message_recipients(recipient_id);
CREATE INDEX IF NOT EXISTS idx_bulk_recipients_status ON bulk_message_recipients(status);

CREATE INDEX IF NOT EXISTS idx_message_templates_type ON message_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_message_templates_active ON message_templates(is_active);

-- ===============================================
-- 4. UPDATE ROW LEVEL SECURITY POLICIES
-- ===============================================

-- Enable RLS on new tables
ALTER TABLE message_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Message participants policies
CREATE POLICY "Users can view their own thread participation" ON message_participants
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can join threads they are part of" ON message_participants
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own participation" ON message_participants
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Bulk message recipients policies
CREATE POLICY "Users can view their own bulk message status" ON bulk_message_recipients
    FOR SELECT USING (auth.uid()::text = recipient_id);

CREATE POLICY "Users can update their own bulk message status" ON bulk_message_recipients
    FOR UPDATE USING (auth.uid()::text = recipient_id);

-- Admin policies for bulk messaging
CREATE POLICY "Admins can manage bulk message recipients" ON bulk_message_recipients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

-- Message templates policies
CREATE POLICY "Admins can manage message templates" ON message_templates
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid()::text 
            AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can view active templates" ON message_templates
    FOR SELECT USING (is_active = true);

-- ===============================================
-- 5. UPDATE TRIGGERS
-- ===============================================

-- Update trigger for message_templates
CREATE TRIGGER update_message_templates_updated_at 
    BEFORE UPDATE ON message_templates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate thread_id if not provided
CREATE OR REPLACE FUNCTION generate_thread_id()
RETURNS TRIGGER AS $$
BEGIN
    -- If thread_id is not provided, generate one based on participants and context
    IF NEW.thread_id IS NULL THEN
        IF NEW.content_type IS NOT NULL AND NEW.content_id IS NOT NULL THEN
            -- For product inquiries, create thread based on participants and product
            NEW.thread_id := CONCAT(
                LEAST(COALESCE(NEW.sender_id, 'anonymous'), COALESCE(NEW.recipient_id, 'system')),
                '-',
                GREATEST(COALESCE(NEW.sender_id, 'anonymous'), COALESCE(NEW.recipient_id, 'system')),
                '-',
                NEW.content_type,
                '-',
                NEW.content_id
            );
        ELSE
            -- For direct messages, create thread based on participants only
            NEW.thread_id := CONCAT(
                LEAST(COALESCE(NEW.sender_id, 'anonymous'), COALESCE(NEW.recipient_id, 'system')),
                '-',
                GREATEST(COALESCE(NEW.sender_id, 'anonymous'), COALESCE(NEW.recipient_id, 'system')),
                '-direct'
            );
        END IF;
    END IF;
    
    -- Set sender_type based on sender information
    IF NEW.sender_type IS NULL THEN
        IF NEW.sender_id IS NULL THEN
            NEW.sender_type := 'anonymous';
        ELSE
            SELECT role INTO NEW.sender_type FROM users WHERE id = NEW.sender_id;
            -- Map role to sender_type
            CASE NEW.sender_type
                WHEN 'ADMIN' THEN NEW.sender_type := 'admin';
                WHEN 'VENDOR' THEN NEW.sender_type := 'vendor';
                WHEN 'AGENT' THEN NEW.sender_type := 'vendor';
                ELSE NEW.sender_type := 'user';
            END CASE;
        END IF;
    END IF;
    
    -- Set recipient_type based on recipient information
    IF NEW.recipient_type IS NULL AND NEW.recipient_id IS NOT NULL THEN
        SELECT role INTO NEW.recipient_type FROM users WHERE id = NEW.recipient_id;
        -- Map role to recipient_type
        CASE NEW.recipient_type
            WHEN 'ADMIN' THEN NEW.recipient_type := 'admin';
            WHEN 'VENDOR' THEN NEW.recipient_type := 'vendor';
            WHEN 'AGENT' THEN NEW.recipient_type := 'vendor';
            ELSE NEW.recipient_type := 'user';
        END CASE;
    END IF;
    
    -- Set message_type based on context
    IF NEW.message_type = 'direct_message' AND NEW.content_type IS NOT NULL THEN
        NEW.message_type := 'product_inquiry';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to contact_messages
DROP TRIGGER IF EXISTS auto_generate_thread_info ON contact_messages;
CREATE TRIGGER auto_generate_thread_info
    BEFORE INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION generate_thread_id();

-- ===============================================
-- 6. DATA MIGRATION FOR EXISTING RECORDS
-- ===============================================

-- Update existing records to have proper thread_ids and types
UPDATE contact_messages 
SET 
    thread_id = CONCAT(
        LEAST(COALESCE(sender_id, 'anonymous'), COALESCE(recipient_id, 'system')),
        '-',
        GREATEST(COALESCE(sender_id, 'anonymous'), COALESCE(recipient_id, 'system')),
        CASE 
            WHEN content_type IS NOT NULL AND content_id IS NOT NULL 
            THEN CONCAT('-', content_type, '-', content_id)
            ELSE '-direct'
        END
    ),
    sender_type = CASE 
        WHEN sender_id IS NULL THEN 'anonymous'
        ELSE (
            SELECT CASE 
                WHEN role = 'ADMIN' THEN 'admin'
                WHEN role IN ('VENDOR', 'AGENT') THEN 'vendor'
                ELSE 'user'
            END
            FROM users WHERE id = sender_id
        )
    END,
    recipient_type = CASE 
        WHEN recipient_id IS NULL THEN 'admin'
        ELSE (
            SELECT CASE 
                WHEN role = 'ADMIN' THEN 'admin'
                WHEN role IN ('VENDOR', 'AGENT') THEN 'vendor'
                ELSE 'user'
            END
            FROM users WHERE id = recipient_id
        )
    END,
    message_type = CASE 
        WHEN content_type IS NOT NULL AND content_id IS NOT NULL THEN 'product_inquiry'
        WHEN subject LIKE 'Contact Form:%' THEN 'contact_form'
        ELSE 'direct_message'
    END
WHERE thread_id IS NULL OR sender_type IS NULL OR recipient_type IS NULL OR message_type = 'direct_message';

-- ===============================================
-- 7. INSERT DEFAULT MESSAGE TEMPLATES
-- ===============================================

INSERT INTO message_templates (name, template_type, subject_template, message_template, variables) VALUES
('new_message_notification', 'email_notification', 'New Message: {{subject}}', 
'Hello {{recipient_name}},

You have received a new message from {{sender_name}} ({{sender_email}}).

Subject: {{subject}}
Message: {{message}}

{{#if_product}}
Regarding: {{product_title}} ({{product_type}})
{{/if_product}}

You can reply to this message by logging into your account at {{site_url}}/messages

Best regards,
BrightonHub Team', 
'{"recipient_name": "string", "sender_name": "string", "sender_email": "string", "subject": "string", "message": "string", "product_title": "string", "product_type": "string", "site_url": "string"}'),

('bulk_announcement', 'bulk_message', 'Important Announcement from BrightonHub', 
'Dear {{recipient_name}},

{{message}}

Thank you for being part of the BrightonHub community.

Best regards,
BrightonHub Admin Team', 
'{"recipient_name": "string", "message": "string"}'),

('vendor_welcome', 'auto_response', 'Welcome to BrightonHub Vendor Network', 
'Dear {{vendor_name}},

Welcome to the BrightonHub vendor network! We are excited to have you join our platform.

Your vendor application has been approved and you can now:
- Manage your products and services
- Respond to customer inquiries
- Access vendor tools and analytics

If you have any questions, please don''t hesitate to reach out.

Best regards,
BrightonHub Vendor Support', 
'{"vendor_name": "string"}')

ON CONFLICT (name) DO NOTHING;

-- ===============================================
-- SUCCESS MESSAGE
-- ===============================================

DO $$
BEGIN
    RAISE NOTICE 'Unified Messaging System database extension completed successfully!';
    RAISE NOTICE 'Extended contact_messages table with % new columns', (
        SELECT count(*) FROM information_schema.columns 
        WHERE table_name = 'contact_messages' 
        AND column_name IN ('thread_id', 'reply_to', 'sender_type', 'recipient_type', 'message_type', 'priority', 'tags', 'attachments', 'email_sent', 'email_sent_at', 'email_response_id', 'read_at', 'replied_at')
    );
    RAISE NOTICE 'Created % supporting tables', (
        SELECT count(*) FROM information_schema.tables 
        WHERE table_name IN ('message_participants', 'bulk_message_recipients', 'message_templates')
    );
    RAISE NOTICE 'Ready for API and frontend updates!';
END $$;
