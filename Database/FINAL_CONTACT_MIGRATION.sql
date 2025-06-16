-- Final Comprehensive Detail Migration
-- This adds all contact and seller fields for complete detail page functionality
-- Run this after the SAFE_DETAIL_MIGRATION.sql

-- Add contact fields to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- Add author contact fields to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_phone TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;

-- Add categoryId fields if missing (for admin interface compatibility)
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Update categoryId fields from existing category_id fields
UPDATE food_items SET "categoryId" = category_id WHERE category_id IS NOT NULL AND "categoryId" IS NULL;
UPDATE store_products SET "categoryId" = category_id WHERE category_id IS NOT NULL AND "categoryId" IS NULL;
UPDATE projects SET "categoryId" = category_id WHERE category_id IS NOT NULL AND "categoryId" IS NULL;
UPDATE blog_posts SET "categoryId" = category_id WHERE category_id IS NOT NULL AND "categoryId" IS NULL;

-- Add camelCase versions of seller fields for consistency with TypeScript
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactAddress" TEXT;

ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorName" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorEmail" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorPhone" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorBio" TEXT;

-- Sync data from snake_case to camelCase columns
UPDATE food_items SET "sellerName" = seller_name WHERE seller_name IS NOT NULL AND "sellerName" IS NULL;
UPDATE food_items SET "sellerPhone" = seller_phone WHERE seller_phone IS NOT NULL AND "sellerPhone" IS NULL;
UPDATE food_items SET "sellerEmail" = seller_email WHERE seller_email IS NOT NULL AND "sellerEmail" IS NULL;
UPDATE food_items SET "sellerAddress" = seller_address WHERE seller_address IS NOT NULL AND "sellerAddress" IS NULL;
UPDATE food_items SET "sellerDescription" = seller_description WHERE seller_description IS NOT NULL AND "sellerDescription" IS NULL;

UPDATE store_products SET "sellerName" = seller_name WHERE seller_name IS NOT NULL AND "sellerName" IS NULL;
UPDATE store_products SET "sellerPhone" = seller_phone WHERE seller_phone IS NOT NULL AND "sellerPhone" IS NULL;
UPDATE store_products SET "sellerEmail" = seller_email WHERE seller_email IS NOT NULL AND "sellerEmail" IS NULL;
UPDATE store_products SET "sellerAddress" = seller_address WHERE seller_address IS NOT NULL AND "sellerAddress" IS NULL;
UPDATE store_products SET "sellerDescription" = seller_description WHERE seller_description IS NOT NULL AND "sellerDescription" IS NULL;

UPDATE projects SET "contactName" = contact_name WHERE contact_name IS NOT NULL AND "contactName" IS NULL;
UPDATE projects SET "contactPhone" = contact_phone WHERE contact_phone IS NOT NULL AND "contactPhone" IS NULL;
UPDATE projects SET "contactEmail" = contact_email WHERE contact_email IS NOT NULL AND "contactEmail" IS NULL;
UPDATE projects SET "contactAddress" = contact_address WHERE contact_address IS NOT NULL AND "contactAddress" IS NULL;

UPDATE blog_posts SET "authorName" = author_name WHERE author_name IS NOT NULL AND "authorName" IS NULL;
UPDATE blog_posts SET "authorEmail" = author_email WHERE author_email IS NOT NULL AND "authorEmail" IS NULL;
UPDATE blog_posts SET "authorPhone" = author_phone WHERE author_phone IS NOT NULL AND "authorPhone" IS NULL;
UPDATE blog_posts SET "authorBio" = author_bio WHERE author_bio IS NOT NULL AND "authorBio" IS NULL;

-- Success message
SELECT 'Final Comprehensive Detail Migration completed successfully!' as result;
