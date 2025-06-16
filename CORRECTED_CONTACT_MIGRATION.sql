-- CORRECTED CONTACT MIGRATION
-- Safe migration script that only adds missing columns without referencing non-existent ones
-- Run this in Supabase SQL Editor

-- Add seller contact fields to food_items
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_address TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS seller_description TEXT;

-- Add camelCase versions for food_items (admin interface compatibility)
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

-- Add seller contact fields to store_products
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_name TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_phone TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_email TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_address TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS seller_description TEXT;

-- Add camelCase versions for store_products
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerName" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerPhone" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerEmail" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerAddress" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "sellerDescription" TEXT;

-- Add contact fields to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_name TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS contact_address TEXT;

-- Add camelCase versions for projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactName" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactPhone" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "contactAddress" TEXT;

-- Add author contact fields to blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_name TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_email TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_phone TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS author_bio TEXT;

-- Add camelCase versions for blog_posts
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorName" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorEmail" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorPhone" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorBio" TEXT;

-- Add categoryId fields for admin interface compatibility
ALTER TABLE food_items ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE store_products ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "categoryId" TEXT;

-- Update existing records to sync snake_case and camelCase columns
-- Food items
UPDATE food_items SET seller_name = "sellerName" WHERE "sellerName" IS NOT NULL AND seller_name IS NULL;
UPDATE food_items SET seller_phone = "sellerPhone" WHERE "sellerPhone" IS NOT NULL AND seller_phone IS NULL;
UPDATE food_items SET seller_email = "sellerEmail" WHERE "sellerEmail" IS NOT NULL AND seller_email IS NULL;
UPDATE food_items SET seller_address = "sellerAddress" WHERE "sellerAddress" IS NOT NULL AND seller_address IS NULL;
UPDATE food_items SET seller_description = "sellerDescription" WHERE "sellerDescription" IS NOT NULL AND seller_description IS NULL;

UPDATE food_items SET "sellerName" = seller_name WHERE seller_name IS NOT NULL AND "sellerName" IS NULL;
UPDATE food_items SET "sellerPhone" = seller_phone WHERE seller_phone IS NOT NULL AND "sellerPhone" IS NULL;
UPDATE food_items SET "sellerEmail" = seller_email WHERE seller_email IS NOT NULL AND "sellerEmail" IS NULL;
UPDATE food_items SET "sellerAddress" = seller_address WHERE seller_address IS NOT NULL AND "sellerAddress" IS NULL;
UPDATE food_items SET "sellerDescription" = seller_description WHERE seller_description IS NOT NULL AND "sellerDescription" IS NULL;

-- Store products
UPDATE store_products SET seller_name = "sellerName" WHERE "sellerName" IS NOT NULL AND seller_name IS NULL;
UPDATE store_products SET seller_phone = "sellerPhone" WHERE "sellerPhone" IS NOT NULL AND seller_phone IS NULL;
UPDATE store_products SET seller_email = "sellerEmail" WHERE "sellerEmail" IS NOT NULL AND seller_email IS NULL;
UPDATE store_products SET seller_address = "sellerAddress" WHERE "sellerAddress" IS NOT NULL AND seller_address IS NULL;
UPDATE store_products SET seller_description = "sellerDescription" WHERE "sellerDescription" IS NOT NULL AND seller_description IS NULL;

UPDATE store_products SET "sellerName" = seller_name WHERE seller_name IS NOT NULL AND "sellerName" IS NULL;
UPDATE store_products SET "sellerPhone" = seller_phone WHERE seller_phone IS NOT NULL AND "sellerPhone" IS NULL;
UPDATE store_products SET "sellerEmail" = seller_email WHERE seller_email IS NOT NULL AND "sellerEmail" IS NULL;
UPDATE store_products SET "sellerAddress" = seller_address WHERE seller_address IS NOT NULL AND "sellerAddress" IS NULL;
UPDATE store_products SET "sellerDescription" = seller_description WHERE seller_description IS NOT NULL AND "sellerDescription" IS NULL;

-- Projects
UPDATE projects SET contact_name = "contactName" WHERE "contactName" IS NOT NULL AND contact_name IS NULL;
UPDATE projects SET contact_phone = "contactPhone" WHERE "contactPhone" IS NOT NULL AND contact_phone IS NULL;
UPDATE projects SET contact_email = "contactEmail" WHERE "contactEmail" IS NOT NULL AND contact_email IS NULL;
UPDATE projects SET contact_address = "contactAddress" WHERE "contactAddress" IS NOT NULL AND contact_address IS NULL;

UPDATE projects SET "contactName" = contact_name WHERE contact_name IS NOT NULL AND "contactName" IS NULL;
UPDATE projects SET "contactPhone" = contact_phone WHERE contact_phone IS NOT NULL AND "contactPhone" IS NULL;
UPDATE projects SET "contactEmail" = contact_email WHERE contact_email IS NOT NULL AND "contactEmail" IS NULL;
UPDATE projects SET "contactAddress" = contact_address WHERE contact_address IS NOT NULL AND "contactAddress" IS NULL;

-- Blog posts
UPDATE blog_posts SET author_name = "authorName" WHERE "authorName" IS NOT NULL AND author_name IS NULL;
UPDATE blog_posts SET author_email = "authorEmail" WHERE "authorEmail" IS NOT NULL AND author_email IS NULL;
UPDATE blog_posts SET author_phone = "authorPhone" WHERE "authorPhone" IS NOT NULL AND author_phone IS NULL;
UPDATE blog_posts SET author_bio = "authorBio" WHERE "authorBio" IS NOT NULL AND author_bio IS NULL;

UPDATE blog_posts SET "authorName" = author_name WHERE author_name IS NOT NULL AND "authorName" IS NULL;
UPDATE blog_posts SET "authorEmail" = author_email WHERE author_email IS NOT NULL AND "authorEmail" IS NULL;
UPDATE blog_posts SET "authorPhone" = author_phone WHERE author_phone IS NOT NULL AND "authorPhone" IS NULL;
UPDATE blog_posts SET "authorBio" = author_bio WHERE author_bio IS NOT NULL AND "authorBio" IS NULL;
