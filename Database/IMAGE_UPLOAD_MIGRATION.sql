-- Image Upload System Migration
-- Creates tables and policies for vendor/admin image uploads

-- Create image_uploads table
CREATE TABLE IF NOT EXISTS image_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size <= 1048576), -- 1MB max
    mime_type VARCHAR(100) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif')),
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    upload_purpose VARCHAR(50) NOT NULL CHECK (upload_purpose IN ('product', 'profile', 'content', 'general')),
    content_type VARCHAR(50) CHECK (content_type IN ('property', 'food', 'store', 'project', 'blog', 'user_profile', 'vendor_profile')),
    content_id UUID, -- Reference to the specific content item
    alt_text VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_image_uploads_uploaded_by ON image_uploads(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_image_uploads_content_type_id ON image_uploads(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_image_uploads_upload_purpose ON image_uploads(upload_purpose);
CREATE INDEX IF NOT EXISTS idx_image_uploads_status ON image_uploads(status);
CREATE INDEX IF NOT EXISTS idx_image_uploads_created_at ON image_uploads(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_image_uploads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_image_uploads_updated_at
    BEFORE UPDATE ON image_uploads
    FOR EACH ROW
    EXECUTE FUNCTION update_image_uploads_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE image_uploads ENABLE ROW LEVEL SECURITY;

-- Policy for users to see their own uploads
CREATE POLICY "Users can view their own uploads" ON image_uploads
    FOR SELECT USING (uploaded_by = auth.uid());

-- Policy for users to insert their own uploads
CREATE POLICY "Users can upload images" ON image_uploads
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

-- Policy for users to update their own uploads
CREATE POLICY "Users can update their own uploads" ON image_uploads
    FOR UPDATE USING (uploaded_by = auth.uid());

-- Policy for users to delete their own uploads
CREATE POLICY "Users can delete their own uploads" ON image_uploads
    FOR DELETE USING (uploaded_by = auth.uid());

-- Policy for admins to see all uploads
CREATE POLICY "Admins can view all uploads" ON image_uploads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agent')
        )
    );

-- Policy for admins to manage all uploads
CREATE POLICY "Admins can manage all uploads" ON image_uploads
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'agent')
        )
    );

-- Create storage bucket policies (for Supabase Storage)
-- Note: These would be set up in Supabase Storage dashboard or via API

-- Create image_stats view for analytics
CREATE OR REPLACE VIEW image_stats AS
SELECT 
    upload_purpose,
    content_type,
    COUNT(*) as total_images,
    SUM(file_size) as total_size_bytes,
    ROUND(AVG(file_size)) as avg_size_bytes,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_images,
    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as images_last_30_days
FROM image_uploads
GROUP BY upload_purpose, content_type;

-- Grant access to the view
GRANT SELECT ON image_stats TO authenticated;

-- Create function to clean up orphaned images
CREATE OR REPLACE FUNCTION cleanup_orphaned_images()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete images that reference non-existent content
    WITH deleted AS (
        UPDATE image_uploads 
        SET status = 'deleted', updated_at = NOW()
        WHERE status = 'active'
        AND content_id IS NOT NULL
        AND content_type IS NOT NULL
        AND (
            (content_type = 'property' AND NOT EXISTS (SELECT 1 FROM properties WHERE id = image_uploads.content_id)) OR
            (content_type = 'food' AND NOT EXISTS (SELECT 1 FROM food_items WHERE id = image_uploads.content_id)) OR
            (content_type = 'store' AND NOT EXISTS (SELECT 1 FROM store_products WHERE id = image_uploads.content_id)) OR
            (content_type = 'project' AND NOT EXISTS (SELECT 1 FROM projects WHERE id = image_uploads.content_id)) OR
            (content_type = 'blog' AND NOT EXISTS (SELECT 1 FROM blog_posts WHERE id = image_uploads.content_id))
        )
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user upload stats
CREATE OR REPLACE FUNCTION get_user_upload_stats(user_id UUID)
RETURNS TABLE(
    total_uploads INTEGER,
    total_size_mb NUMERIC,
    active_uploads INTEGER,
    uploads_by_purpose JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_uploads,
        ROUND((SUM(file_size) / 1048576.0)::NUMERIC, 2) as total_size_mb,
        COUNT(CASE WHEN status = 'active' THEN 1 END)::INTEGER as active_uploads,
        JSONB_OBJECT_AGG(upload_purpose, cnt) as uploads_by_purpose
    FROM (
        SELECT 
            upload_purpose,
            COUNT(*) as cnt,
            file_size,
            status
        FROM image_uploads 
        WHERE uploaded_by = user_id
        GROUP BY upload_purpose, file_size, status
    ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE image_uploads IS 'Stores metadata for all uploaded images including vendor product images and admin content images';
COMMENT ON COLUMN image_uploads.file_size IS 'File size in bytes, maximum 1MB (1048576 bytes)';
COMMENT ON COLUMN image_uploads.upload_purpose IS 'Purpose of the upload: product, profile, content, or general';
COMMENT ON COLUMN image_uploads.content_type IS 'Type of content the image belongs to';
COMMENT ON COLUMN image_uploads.content_id IS 'ID of the specific content item this image belongs to';
COMMENT ON COLUMN image_uploads.is_primary IS 'Whether this is the primary/featured image for the content';
COMMENT ON COLUMN image_uploads.metadata IS 'Additional metadata like image dimensions, processing info, etc';

-- Sample data for testing (optional)
-- INSERT INTO image_uploads (filename, original_filename, file_size, mime_type, file_url, storage_path, uploaded_by, upload_purpose, content_type)
-- VALUES ('sample-product-001.jpg', 'my_product_photo.jpg', 524288, 'image/jpeg', 'https://storage.example.com/images/sample-product-001.jpg', 'uploads/products/sample-product-001.jpg', '00000000-0000-0000-0000-000000000000', 'product', 'food');
