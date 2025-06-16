-- Create user_messages table for user-to-user messaging
-- Date: 2025-06-16
-- Purpose: Fix messages page foreign key errors by creating proper messaging table

-- Create user_messages table
CREATE TABLE IF NOT EXISTS user_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    item_type TEXT CHECK (item_type IN ('property', 'food', 'store', 'project', 'blog')),
    item_id TEXT,
    thread_id TEXT, -- Group related messages
    reply_to TEXT REFERENCES user_messages(id) ON DELETE SET NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_messages_sender ON user_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_recipient ON user_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_thread ON user_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_status ON user_messages(status);
CREATE INDEX IF NOT EXISTS idx_user_messages_item ON user_messages(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);

-- Enable RLS
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_messages
CREATE POLICY "Users can view messages they sent or received" ON user_messages
    FOR SELECT USING (
        auth.uid()::text = sender_id 
        OR auth.uid()::text = recipient_id
    );

CREATE POLICY "Users can insert messages they are sending" ON user_messages
    FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Users can update messages they sent or received" ON user_messages
    FOR UPDATE USING (
        auth.uid()::text = sender_id 
        OR auth.uid()::text = recipient_id
    );

CREATE POLICY "Users can delete messages they sent" ON user_messages
    FOR DELETE USING (auth.uid()::text = sender_id);

-- Admin can manage all messages
CREATE POLICY "Admins can manage all messages" ON user_messages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'ADMIN'
        )
    );

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_user_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_messages_updated_at
    BEFORE UPDATE ON user_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_user_messages_updated_at();

-- Function to generate thread_id for related messages
CREATE OR REPLACE FUNCTION generate_message_thread_id(p_sender_id TEXT, p_recipient_id TEXT, p_item_type TEXT DEFAULT NULL, p_item_id TEXT DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    participants TEXT[];
    thread_key TEXT;
BEGIN
    -- Sort participant IDs to ensure consistent thread IDs
    participants := ARRAY[p_sender_id, p_recipient_id];
    participants := array(SELECT unnest(participants) ORDER BY 1);
    
    -- Create thread key
    thread_key := array_to_string(participants, '-');
    
    -- Add item context if provided
    IF p_item_type IS NOT NULL AND p_item_id IS NOT NULL THEN
        thread_key := thread_key || '-' || p_item_type || '-' || p_item_id;
    END IF;
    
    RETURN thread_key;
END;
$$ language 'plpgsql';

COMMENT ON TABLE user_messages IS 'User-to-user messaging system for inquiries about properties, food items, etc.';
