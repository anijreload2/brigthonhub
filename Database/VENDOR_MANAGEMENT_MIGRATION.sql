-- Vendor Management & User Enhancement Migration
-- Execute this SQL in Supabase Dashboard > SQL Editor after the main schema
-- This adds the vendor management system, bookmarks, and contact messaging

-- ============================================================================
-- 1. USER ROLE & VENDOR STATUS ENHANCEMENTS
-- ============================================================================

-- Add vendor status enumeration
CREATE TYPE "VendorStatus" AS ENUM ('PENDING', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- Add vendor type enumeration for multi-category support
CREATE TYPE "VendorType" AS ENUM ('PROPERTY', 'PROJECT', 'FOOD', 'MARKETPLACE');

-- Add vendor_status and contact_preferences to existing users table
ALTER TABLE "users" 
ADD COLUMN "vendor_status" "VendorStatus" DEFAULT 'PENDING',
ADD COLUMN "contact_preferences" JSONB DEFAULT '{"show_phone": true, "show_email": true, "show_address": false}'::jsonb;

-- ============================================================================
-- 2. VENDOR APPLICATIONS & MANAGEMENT
-- ============================================================================

-- Vendor applications table for multi-category vendor registration
CREATE TABLE "vendor_applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendor_types" "VendorType"[] NOT NULL, -- Support multiple vendor types
    "business_name" TEXT NOT NULL,
    "business_description" TEXT NOT NULL,
    "business_address" TEXT NOT NULL,
    "business_phone" TEXT NOT NULL,
    "business_email" TEXT NOT NULL,
    "business_documents" TEXT[], -- URLs to uploaded documents
    "tax_id" TEXT,
    "license_number" TEXT,
    "bank_details" JSONB,
    "application_status" "VendorStatus" NOT NULL DEFAULT 'PENDING',
    "admin_notes" TEXT,
    "approved_by" TEXT, -- Admin user ID who approved
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendor_applications_pkey" PRIMARY KEY ("id")
);

-- Vendor contact preferences for each vendor type
CREATE TABLE "vendor_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendor_type" "VendorType" NOT NULL,
    "contact_name" TEXT,
    "contact_phone" TEXT,
    "contact_email" TEXT,
    "contact_address" TEXT,
    "contact_description" TEXT,
    "show_phone" BOOLEAN DEFAULT true,
    "show_email" BOOLEAN DEFAULT true,
    "show_address" BOOLEAN DEFAULT false,
    "show_description" BOOLEAN DEFAULT true,
    "is_active" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vendor_contacts_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 3. USER BOOKMARKS SYSTEM
-- ============================================================================

-- Generic bookmarks table for all content types
CREATE TABLE "user_bookmarks" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content_type" TEXT NOT NULL, -- 'property', 'food', 'store', 'project'
    "content_id" TEXT NOT NULL,
    "bookmark_data" JSONB, -- Store additional data like title, image, etc.
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_bookmarks_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "user_bookmarks_unique" UNIQUE ("userId", "content_type", "content_id")
);

-- ============================================================================
-- 4. CONTACT MESSAGING SYSTEM
-- ============================================================================

-- Contact messages between users and vendors
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL, -- User who sent the message
    "recipient_id" TEXT NOT NULL, -- Vendor who receives the message
    "content_type" TEXT NOT NULL, -- 'property', 'food', 'store', 'project'
    "content_id" TEXT, -- ID of the item being inquired about
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_email" TEXT NOT NULL,
    "sender_phone" TEXT,
    "status" TEXT DEFAULT 'unread', -- 'unread', 'read', 'replied', 'closed'
    "admin_notes" TEXT,
    "replied_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- Message replies (for threaded conversations)
CREATE TABLE "message_replies" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_type" TEXT NOT NULL, -- 'user', 'vendor', 'admin'
    "reply_content" TEXT NOT NULL,
    "attachments" TEXT[], -- URLs to uploaded files
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "message_replies_pkey" PRIMARY KEY ("id")
);

-- ============================================================================
-- 5. FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- Vendor applications constraints
ALTER TABLE "vendor_applications" 
ADD CONSTRAINT "vendor_applications_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "vendor_applications" 
ADD CONSTRAINT "vendor_applications_approved_by_fkey" 
FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL;

-- Vendor contacts constraints
ALTER TABLE "vendor_contacts" 
ADD CONSTRAINT "vendor_contacts_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- User bookmarks constraints
ALTER TABLE "user_bookmarks" 
ADD CONSTRAINT "user_bookmarks_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

-- Contact messages constraints
ALTER TABLE "contact_messages" 
ADD CONSTRAINT "contact_messages_sender_fkey" 
FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "contact_messages" 
ADD CONSTRAINT "contact_messages_recipient_fkey" 
FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- Message replies constraints
ALTER TABLE "message_replies" 
ADD CONSTRAINT "message_replies_message_fkey" 
FOREIGN KEY ("message_id") REFERENCES "contact_messages"("id") ON DELETE CASCADE;

ALTER TABLE "message_replies" 
ADD CONSTRAINT "message_replies_sender_fkey" 
FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE;

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

-- User-related indexes
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_vendor_status_idx" ON "users"("vendor_status");
CREATE INDEX "users_email_idx" ON "users"("email");

-- Vendor applications indexes
CREATE INDEX "vendor_applications_userId_idx" ON "vendor_applications"("userId");
CREATE INDEX "vendor_applications_status_idx" ON "vendor_applications"("application_status");
CREATE INDEX "vendor_applications_vendor_types_idx" ON "vendor_applications" USING GIN ("vendor_types");

-- Vendor contacts indexes
CREATE INDEX "vendor_contacts_userId_idx" ON "vendor_contacts"("userId");
CREATE INDEX "vendor_contacts_vendor_type_idx" ON "vendor_contacts"("vendor_type");
CREATE INDEX "vendor_contacts_active_idx" ON "vendor_contacts"("is_active");

-- Bookmarks indexes
CREATE INDEX "user_bookmarks_userId_idx" ON "user_bookmarks"("userId");
CREATE INDEX "user_bookmarks_content_idx" ON "user_bookmarks"("content_type", "content_id");
CREATE INDEX "user_bookmarks_created_idx" ON "user_bookmarks"("createdAt" DESC);

-- Contact messages indexes
CREATE INDEX "contact_messages_sender_idx" ON "contact_messages"("sender_id");
CREATE INDEX "contact_messages_recipient_idx" ON "contact_messages"("recipient_id");
CREATE INDEX "contact_messages_content_idx" ON "contact_messages"("content_type", "content_id");
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");
CREATE INDEX "contact_messages_created_idx" ON "contact_messages"("createdAt" DESC);

-- Message replies indexes
CREATE INDEX "message_replies_message_idx" ON "message_replies"("message_id");
CREATE INDEX "message_replies_sender_idx" ON "message_replies"("sender_id");
CREATE INDEX "message_replies_created_idx" ON "message_replies"("createdAt" DESC);

-- ============================================================================
-- 7. RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE "vendor_applications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendor_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_bookmarks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "message_replies" ENABLE ROW LEVEL SECURITY;

-- Vendor applications policies
CREATE POLICY "Users can view their own applications" 
ON "vendor_applications" FOR SELECT 
USING (auth.uid() = "userId");

CREATE POLICY "Users can create their own applications" 
ON "vendor_applications" FOR INSERT 
WITH CHECK (auth.uid() = "userId");

CREATE POLICY "Users can update their pending applications" 
ON "vendor_applications" FOR UPDATE 
USING (auth.uid() = "userId" AND "application_status" = 'PENDING');

-- Vendor contacts policies
CREATE POLICY "Users can manage their vendor contacts" 
ON "vendor_contacts" FOR ALL 
USING (auth.uid() = "userId");

CREATE POLICY "Public can view active vendor contacts" 
ON "vendor_contacts" FOR SELECT 
USING ("is_active" = true);

-- User bookmarks policies
CREATE POLICY "Users can manage their own bookmarks" 
ON "user_bookmarks" FOR ALL 
USING (auth.uid() = "userId");

-- Contact messages policies
CREATE POLICY "Users can view messages they sent or received" 
ON "contact_messages" FOR SELECT 
USING (auth.uid() = "sender_id" OR auth.uid() = "recipient_id");

CREATE POLICY "Users can send messages" 
ON "contact_messages" FOR INSERT 
WITH CHECK (auth.uid() = "sender_id");

CREATE POLICY "Recipients can update message status" 
ON "contact_messages" FOR UPDATE 
USING (auth.uid() = "recipient_id");

-- Message replies policies
CREATE POLICY "Users can view replies to their messages" 
ON "message_replies" FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM "contact_messages" 
    WHERE "id" = "message_id" 
    AND (auth.uid() = "sender_id" OR auth.uid() = "recipient_id")
));

CREATE POLICY "Users can reply to messages they're involved in" 
ON "message_replies" FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM "contact_messages" 
    WHERE "id" = "message_id" 
    AND (auth.uid() = "sender_id" OR auth.uid() = "recipient_id")
));

-- ============================================================================
-- 8. SAMPLE DATA FOR TESTING
-- ============================================================================

-- Sample vendor applications
INSERT INTO "vendor_applications" ("id", "userId", "vendor_types", "business_name", "business_description", "business_address", "business_phone", "business_email", "application_status") VALUES
('vendor_app_1', 'user_1', '{FOOD,MARKETPLACE}', 'Fresh Farm Foods', 'Local farm providing fresh organic produce and artisanal products', '123 Farm Road, Lagos', '+234-800-1234-567', 'contact@freshfarmfoods.com', 'APPROVED'),
('vendor_app_2', 'user_2', '{PROPERTY}', 'Prime Properties Ltd', 'Real estate agency specializing in commercial and residential properties', '456 Victoria Island, Lagos', '+234-800-2345-678', 'info@primeproperties.ng', 'APPROVED'),
('vendor_app_3', 'user_3', '{PROJECT}', 'Build Masters Construction', 'Professional construction and renovation services', '789 Ikoyi, Lagos', '+234-800-3456-789', 'projects@buildmasters.ng', 'PENDING');

-- Sample vendor contacts
INSERT INTO "vendor_contacts" ("id", "userId", "vendor_type", "contact_name", "contact_phone", "contact_email", "contact_address", "contact_description") VALUES
('vendor_contact_1', 'user_1', 'FOOD', 'John Farmer', '+234-800-1234-567', 'john@freshfarmfoods.com', '123 Farm Road, Lagos', 'Direct contact for fresh produce orders and bulk purchases'),
('vendor_contact_2', 'user_1', 'MARKETPLACE', 'Sarah Store Manager', '+234-800-1234-568', 'sarah@freshfarmfoods.com', '123 Farm Road, Lagos', 'Contact for artisanal products and specialty items'),
('vendor_contact_3', 'user_2', 'PROPERTY', 'Michael Agent', '+234-800-2345-678', 'michael@primeproperties.ng', '456 Victoria Island, Lagos', 'Senior property consultant for all real estate inquiries'),
('vendor_contact_4', 'user_3', 'PROJECT', 'David Project Manager', '+234-800-3456-789', 'david@buildmasters.ng', '789 Ikoyi, Lagos', 'Lead project manager for construction and renovation projects');

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
