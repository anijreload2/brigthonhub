-- Create missing user_bookmarks table
-- Date: 2025-06-16
-- Purpose: Fix 404 errors for bookmarks functionality

-- Create user_bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_type TEXT NOT NULL CHECK (item_type IN ('property', 'food', 'store', 'project', 'blog')),
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    item_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user can only bookmark each item once
    UNIQUE(user_id, item_type, item_id)
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_item ON user_bookmarks(item_type, item_id);

-- Enable RLS
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON user_bookmarks
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON user_bookmarks
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own bookmarks" ON user_bookmarks
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON user_bookmarks
    FOR DELETE USING (auth.uid()::text = user_id);

-- Admin can manage all bookmarks
CREATE POLICY "Admins can manage all bookmarks" ON user_bookmarks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.role = 'ADMIN'
        )
    );

-- Update function for updated_at
CREATE OR REPLACE FUNCTION update_user_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_bookmarks_updated_at
    BEFORE UPDATE ON user_bookmarks
    FOR EACH ROW
    EXECUTE FUNCTION update_user_bookmarks_updated_at();

COMMENT ON TABLE user_bookmarks IS 'User bookmarks for properties, food items, store products, projects, and blog posts';
