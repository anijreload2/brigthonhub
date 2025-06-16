-- Complete Schema Fix for Missing Tables and Relationships
-- This addresses all missing tables and relationship issues found in the admin components

-- Diagnostic check for existing tables
DO $$
BEGIN
    RAISE NOTICE '=== MIGRATION DIAGNOSTIC ===';
    
    -- Check if testimonials table already exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE NOTICE 'WARNING: testimonials table already exists';
        
        -- Check its structure
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
            RAISE NOTICE 'testimonials.service_category column exists';
        ELSE
            RAISE NOTICE 'ERROR: testimonials.service_category column MISSING - will cause index creation to fail';
        END IF;
        
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'project_id') THEN
            RAISE NOTICE 'WARNING: testimonials.project_id column exists (old structure)';
        END IF;
    ELSE
        RAISE NOTICE 'testimonials table does not exist - will be created';
    END IF;
    
    RAISE NOTICE '=== END DIAGNOSTIC ===';
END $$;

-- Create vendor_applications table (missing from original schema)
CREATE TABLE IF NOT EXISTS "vendor_applications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "categories" TEXT[] NOT NULL,
    "business_name" TEXT NOT NULL,
    "business_description" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_phone" TEXT,
    "business_address" TEXT,
    "website_url" TEXT,
    "social_media" JSONB,
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,
    "admin_notes" TEXT,
    "documents" TEXT[], -- URLs to uploaded documents
    "verification_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- Create image_uploads table if it doesn't exist (for the image management system)
CREATE TABLE IF NOT EXISTS "image_uploads" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "filename" VARCHAR(255) NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "file_size" INTEGER NOT NULL CHECK (file_size <= 1048576), -- 1MB max
    "mime_type" VARCHAR(100) NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif')),
    "upload_purpose" VARCHAR(50) NOT NULL CHECK (upload_purpose IN ('profile', 'content', 'product')),
    "content_type" VARCHAR(50) CHECK (content_type IN ('property', 'food', 'store', 'project', 'blog', 'user_profile', 'vendor_profile')),
    "content_id" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "public_url" TEXT NOT NULL,
    "metadata" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create testimonials table (referenced in admin)
-- Handle case where table might already exist with different structure
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        -- Check if it has the old structure (with project_id but no service_category)
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'project_id') AND
           NOT EXISTS (SELECT FROM information_schema.columns 
                       WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
            
            RAISE NOTICE 'Updating testimonials table structure...';
            
            -- Add missing columns to existing table
            ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "service_category" TEXT;
            ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "project_reference" TEXT;
            
            -- Drop the problematic project_id column if it exists
            ALTER TABLE "testimonials" DROP COLUMN IF EXISTS "project_id";
            
            RAISE NOTICE 'testimonials table structure updated';
        ELSE
            RAISE NOTICE 'testimonials table already has correct structure';
        END IF;
    ELSE
        -- Create new table
        CREATE TABLE "testimonials" (
            "id" TEXT NOT NULL,
            "client_name" TEXT NOT NULL,
            "client_title" TEXT,
            "client_company" TEXT,
            "testimonial_text" TEXT NOT NULL,
            "rating" INTEGER CHECK (rating >= 1 AND rating <= 5),
            "client_image" TEXT,
            "service_category" TEXT,
            "project_reference" TEXT, -- Free text reference instead of FK
            "is_featured" BOOLEAN NOT NULL DEFAULT false,
            "is_active" BOOLEAN NOT NULL DEFAULT true,
            "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
        );
        RAISE NOTICE 'testimonials table created successfully';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error with testimonials table: %', SQLERRM;
END $$;

-- Create contact_messages table (for general inquiries)
CREATE TABLE IF NOT EXISTS "contact_messages" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT DEFAULT 'general',
    "status" TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'closed')),
    "priority" TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    "assigned_to" TEXT,
    "admin_notes" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Add missing foreign key constraints for new tables with error handling
DO $$
BEGIN
    -- Add foreign key for vendor_applications.user_id
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'vendor_applications_user_id_fkey') THEN
        ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_user_id_fkey" 
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint vendor_applications_user_id_fkey';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint vendor_applications_user_id_fkey: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add foreign key for vendor_applications.reviewed_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'vendor_applications_reviewed_by_fkey') THEN
        ALTER TABLE "vendor_applications" ADD CONSTRAINT "vendor_applications_reviewed_by_fkey" 
        FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint vendor_applications_reviewed_by_fkey';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint vendor_applications_reviewed_by_fkey: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add foreign key for image_uploads.uploaded_by
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'image_uploads_uploaded_by_fkey') THEN
        ALTER TABLE "image_uploads" ADD CONSTRAINT "image_uploads_uploaded_by_fkey" 
        FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint image_uploads_uploaded_by_fkey';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint image_uploads_uploaded_by_fkey: %', SQLERRM;
END $$;

-- Add foreign key constraint for testimonials only if projects table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'projects') THEN
        ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_fkey" 
        FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Foreign key constraint added for testimonials.project_id';
    ELSE
        RAISE NOTICE 'Projects table not found, skipping foreign key constraint for testimonials.project_id';
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        RAISE NOTICE 'Foreign key constraint testimonials_project_id_fkey already exists';
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint for testimonials.project_id: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Add foreign key for contact_messages.assigned_to
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'contact_messages_assigned_to_fkey') THEN
        ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_assigned_to_fkey" 
        FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        RAISE NOTICE 'Added foreign key constraint contact_messages_assigned_to_fkey';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not add foreign key constraint contact_messages_assigned_to_fkey: %', SQLERRM;
END $$;

-- Add missing indexes for performance with error handling
DO $$
BEGIN
    -- Vendor applications indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendor_applications') THEN
        CREATE INDEX IF NOT EXISTS "vendor_applications_user_id_idx" ON "vendor_applications"("user_id");
        CREATE INDEX IF NOT EXISTS "vendor_applications_status_idx" ON "vendor_applications"("status");
        CREATE INDEX IF NOT EXISTS "vendor_applications_submitted_at_idx" ON "vendor_applications"("submitted_at");
        RAISE NOTICE 'Created indexes for vendor_applications';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create vendor_applications indexes: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Image uploads indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'image_uploads') THEN
        CREATE INDEX IF NOT EXISTS "image_uploads_uploaded_by_idx" ON "image_uploads"("uploaded_by");
        CREATE INDEX IF NOT EXISTS "image_uploads_content_type_idx" ON "image_uploads"("content_type");
        CREATE INDEX IF NOT EXISTS "image_uploads_content_id_idx" ON "image_uploads"("content_id");
        CREATE INDEX IF NOT EXISTS "image_uploads_upload_purpose_idx" ON "image_uploads"("upload_purpose");
        RAISE NOTICE 'Created indexes for image_uploads';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create image_uploads indexes: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Testimonials indexes (check if columns exist)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        -- Check if service_category column exists before creating index
        IF EXISTS (SELECT FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
            CREATE INDEX IF NOT EXISTS "testimonials_service_category_idx" ON "testimonials"("service_category");
            RAISE NOTICE 'Created service_category index for testimonials';
        ELSE
            RAISE NOTICE 'service_category column not found in testimonials table';
        END IF;
        
        CREATE INDEX IF NOT EXISTS "testimonials_is_featured_idx" ON "testimonials"("is_featured");
        CREATE INDEX IF NOT EXISTS "testimonials_is_active_idx" ON "testimonials"("is_active");
        RAISE NOTICE 'Created basic indexes for testimonials';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create testimonials indexes: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Contact messages indexes
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        CREATE INDEX IF NOT EXISTS "contact_messages_status_idx" ON "contact_messages"("status");
        CREATE INDEX IF NOT EXISTS "contact_messages_category_idx" ON "contact_messages"("category");
        CREATE INDEX IF NOT EXISTS "contact_messages_created_at_idx" ON "contact_messages"("created_at");
        RAISE NOTICE 'Created indexes for contact_messages';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not create contact_messages indexes: %', SQLERRM;
END $$;

-- Enable RLS for all new tables
ALTER TABLE "vendor_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "image_uploads" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for vendor_applications
DROP POLICY IF EXISTS "vendor_applications_read_own" ON "vendor_applications";
CREATE POLICY "vendor_applications_read_own" ON "vendor_applications"
    FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "vendor_applications_insert_own" ON "vendor_applications";
CREATE POLICY "vendor_applications_insert_own" ON "vendor_applications"
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "vendor_applications_admin_all" ON "vendor_applications";
CREATE POLICY "vendor_applications_admin_all" ON "vendor_applications"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'ADMIN'
    ));

-- Create RLS policies for image_uploads
DROP POLICY IF EXISTS "image_uploads_read_own" ON "image_uploads";
CREATE POLICY "image_uploads_read_own" ON "image_uploads"
    FOR SELECT USING (auth.uid()::text = uploaded_by);

DROP POLICY IF EXISTS "image_uploads_insert_own" ON "image_uploads";
CREATE POLICY "image_uploads_insert_own" ON "image_uploads"
    FOR INSERT WITH CHECK (auth.uid()::text = uploaded_by);

DROP POLICY IF EXISTS "image_uploads_admin_all" ON "image_uploads";
CREATE POLICY "image_uploads_admin_all" ON "image_uploads"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'ADMIN'
    ));

-- Create RLS policies for testimonials
DROP POLICY IF EXISTS "testimonials_read_active" ON "testimonials";
CREATE POLICY "testimonials_read_active" ON "testimonials"
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "testimonials_admin_all" ON "testimonials";
CREATE POLICY "testimonials_admin_all" ON "testimonials"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'ADMIN'
    ));

-- Create RLS policies for contact_messages
DROP POLICY IF EXISTS "contact_messages_read_all" ON "contact_messages";
CREATE POLICY "contact_messages_read_all" ON "contact_messages"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "contact_messages_insert_all" ON "contact_messages";
CREATE POLICY "contact_messages_insert_all" ON "contact_messages"
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "contact_messages_admin_all" ON "contact_messages";
CREATE POLICY "contact_messages_admin_all" ON "contact_messages"
    FOR ALL USING (EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid()::text 
        AND users.role = 'ADMIN'
    ));

-- Create trigger functions for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers for new tables
DROP TRIGGER IF EXISTS update_vendor_applications_updated_at ON "vendor_applications";
CREATE TRIGGER update_vendor_applications_updated_at
    BEFORE UPDATE ON "vendor_applications"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_image_uploads_updated_at ON "image_uploads";
CREATE TRIGGER update_image_uploads_updated_at
    BEFORE UPDATE ON "image_uploads"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON "testimonials";
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON "testimonials"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON "contact_messages";
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON "contact_messages"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing with error handling
DO $$
BEGIN
    -- Check if testimonials table has the expected structure
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') AND
       EXISTS (SELECT FROM information_schema.columns 
               WHERE table_name = 'testimonials' AND column_name = 'service_category') THEN
        
        INSERT INTO "testimonials" (id, client_name, client_title, testimonial_text, rating, service_category, project_reference, is_featured, created_at, updated_at)
        VALUES 
            ('testimonial-001', 'John Doe', 'CEO', 'Excellent service and professional work!', 5, 'Real Estate', 'Brighton Heights Development', true, NOW(), NOW()),
            ('testimonial-002', 'Jane Smith', 'Manager', 'Very satisfied with the project outcome.', 5, 'Food Services', 'Restaurant Setup Project', false, NOW(), NOW()),
            ('testimonial-003', 'Mike Johnson', 'Director', 'High quality work delivered on time.', 4, 'General Construction', 'Office Renovation', true, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Sample testimonials data inserted successfully';
    ELSE
        RAISE NOTICE 'Cannot insert sample data - testimonials table structure mismatch';
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not insert sample testimonials data: %', SQLERRM;
END $$;

-- Verify all tables exist
DO $$
BEGIN
    -- Check if all required tables exist
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'vendor_applications') THEN
        RAISE EXCEPTION 'vendor_applications table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'image_uploads') THEN
        RAISE EXCEPTION 'image_uploads table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'testimonials') THEN
        RAISE EXCEPTION 'testimonials table was not created successfully';
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'contact_messages') THEN
        RAISE EXCEPTION 'contact_messages table was not created successfully';
    END IF;
    
    RAISE NOTICE 'All missing tables created successfully!';
END $$;
