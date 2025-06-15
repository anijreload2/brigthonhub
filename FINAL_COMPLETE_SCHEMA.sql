-- BrightonHub Multi-Service Platform COMPLETE Database Schema
-- This SQL matches the Prisma schema EXACTLY
-- Execute this SQL in Supabase Dashboard > SQL Editor

-- Drop existing types if they exist (to handle re-runs)
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "PropertyType" CASCADE;
DROP TYPE IF EXISTS "ListingType" CASCADE;
DROP TYPE IF EXISTS "InquiryStatus" CASCADE;
DROP TYPE IF EXISTS "OrderStatus" CASCADE;
DROP TYPE IF EXISTS "ProjectStatus" CASCADE;
DROP TYPE IF EXISTS "MessageRole" CASCADE;

-- Drop existing tables if they exist (CASCADE will handle foreign key dependencies)
DROP TABLE IF EXISTS "site_settings" CASCADE;
DROP TABLE IF EXISTS "media_gallery" CASCADE;
DROP TABLE IF EXISTS "content_blocks" CASCADE;
DROP TABLE IF EXISTS "admin_activities" CASCADE;
DROP TABLE IF EXISTS "ai_messages" CASCADE;
DROP TABLE IF EXISTS "ai_conversations" CASCADE;
DROP TABLE IF EXISTS "ai_training_data" CASCADE;
DROP TABLE IF EXISTS "blog_posts" CASCADE;
DROP TABLE IF EXISTS "blog_categories" CASCADE;
DROP TABLE IF EXISTS "project_inquiries" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "project_categories" CASCADE;
DROP TABLE IF EXISTS "store_order_items" CASCADE;
DROP TABLE IF EXISTS "store_orders" CASCADE;
DROP TABLE IF EXISTS "store_products" CASCADE;
DROP TABLE IF EXISTS "store_categories" CASCADE;
DROP TABLE IF EXISTS "food_order_items" CASCADE;
DROP TABLE IF EXISTS "food_orders" CASCADE;
DROP TABLE IF EXISTS "food_items" CASCADE;
DROP TABLE IF EXISTS "food_categories" CASCADE;
DROP TABLE IF EXISTS "property_favorites" CASCADE;
DROP TABLE IF EXISTS "property_inquiries" CASCADE;
DROP TABLE IF EXISTS "properties" CASCADE;
DROP TABLE IF EXISTS "property_categories" CASCADE;
DROP TABLE IF EXISTS "user_sessions" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Create Enums
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'REGISTERED', 'VENDOR', 'AGENT', 'ADMIN');
CREATE TYPE "PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE');
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');
CREATE TYPE "InquiryStatus" AS ENUM ('PENDING', 'CONTACTED', 'CLOSED');
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
CREATE TYPE "ProjectStatus" AS ENUM ('PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- User Management & Authentication
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'REGISTERED',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "avatar" TEXT,    "bio" TEXT,
    "businessName" TEXT,
    "businessAddress" TEXT,
    "businessPhone" TEXT,
    "location" TEXT,
    "preferences" JSONB,
    "notifications" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- Real Estate Module
-- Property Management
CREATE TABLE "property_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT,
    "propertyType" "PropertyType" NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "area" DECIMAL(65,30),
    "images" TEXT[],
    "features" TEXT[],
    "coordinates" JSONB,    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "property_inquiries" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "property_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "property_favorites" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "property_favorites_pkey" PRIMARY KEY ("id")
);

-- Food Services Module
CREATE TABLE "food_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "unit" TEXT NOT NULL,
    "minimumOrder" INTEGER NOT NULL DEFAULT 1,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[],
    "nutritionalInfo" JSONB,
    "origin" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "vendorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "food_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "deliveryDate" TIMESTAMP(3),
    "deliveryAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "food_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "food_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "food_order_items_pkey" PRIMARY KEY ("id")
);

-- Marketplace Module
CREATE TABLE "store_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "store_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "images" TEXT[],
    "features" TEXT[],
    "brand" TEXT,
    "model" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "store_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "deliveryAddress" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "store_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "store_order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    CONSTRAINT "store_order_items_pkey" PRIMARY KEY ("id")
);

-- Project Showcase Module
CREATE TABLE "project_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "project_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "beforeImages" TEXT[],
    "afterImages" TEXT[],
    "status" "ProjectStatus" NOT NULL DEFAULT 'PLANNING',
    "budget" DECIMAL(65,30),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "location" TEXT,
    "clientName" TEXT,
    "testimonial" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "project_inquiries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "budget" DECIMAL(65,30),
    "status" "InquiryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,    CONSTRAINT "project_inquiries_pkey" PRIMARY KEY ("id")
);

-- Blog & Content Module
CREATE TABLE "blog_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "categoryId" TEXT NOT NULL,
    "featuredImage" TEXT,
    "tags" TEXT[],
    "readingTime" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- AI Assistant Module
CREATE TABLE "ai_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_training_data" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ai_training_data_pkey" PRIMARY KEY ("id")
);

-- Content Management
CREATE TABLE "content_blocks" (
    "id" TEXT NOT NULL,
    "block_type" TEXT NOT NULL,
    "block_title" TEXT,
    "block_content" JSONB,
    "page_location" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "content_blocks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "media_gallery" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER,
    "alt_text" TEXT,
    "uploadedById" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "media_gallery_pkey" PRIMARY KEY ("id")
);

-- Admin Dashboard Module
CREATE TABLE "admin_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- Add Foreign Key Constraints
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "properties" ADD CONSTRAINT "properties_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "property_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_inquiries" ADD CONSTRAINT "property_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "food_items" ADD CONSTRAINT "food_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "food_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "food_orders" ADD CONSTRAINT "food_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;ALTER TABLE "food_order_items" ADD CONSTRAINT "food_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "food_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "food_order_items" ADD CONSTRAINT "food_order_items_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "food_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_products" ADD CONSTRAINT "store_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "store_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "store_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "store_order_items" ADD CONSTRAINT "store_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "store_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "project_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "project_inquiries" ADD CONSTRAINT "project_inquiries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "project_inquiries" ADD CONSTRAINT "project_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "admin_activities" ADD CONSTRAINT "admin_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "media_gallery" ADD CONSTRAINT "media_gallery_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add Unique Constraints
ALTER TABLE "users" ADD CONSTRAINT "users_email_key" UNIQUE ("email");
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_key" UNIQUE ("userId");
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_token_key" UNIQUE ("token");
ALTER TABLE "food_orders" ADD CONSTRAINT "food_orders_orderNumber_key" UNIQUE ("orderNumber");
ALTER TABLE "store_orders" ADD CONSTRAINT "store_orders_orderNumber_key" UNIQUE ("orderNumber");
ALTER TABLE "property_favorites" ADD CONSTRAINT "property_favorites_propertyId_userId_key" UNIQUE ("propertyId", "userId");
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_slug_key" UNIQUE ("slug");
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_key_key" UNIQUE ("key");

-- Create Default Admin User and Sample Data
INSERT INTO "users" ("id", "email", "name", "role", "createdAt", "updatedAt") 
VALUES ('admin-001', 'admin@brightonhub.com', 'System Administrator', 'ADMIN', NOW(), NOW());

INSERT INTO "user_profiles" ("id", "userId", "firstName", "lastName", "createdAt", "updatedAt")
VALUES ('profile-admin-001', 'admin-001', 'System', 'Administrator', NOW(), NOW());

-- Create sample categories for testing
INSERT INTO "food_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('food-cat-001', 'Grains & Cereals', 'Rice, wheat, corn and other grains', NOW(), NOW()),
    ('food-cat-002', 'Vegetables', 'Fresh vegetables and produce', NOW(), NOW()),
    ('food-cat-003', 'Fruits', 'Fresh fruits and tropical produce', NOW(), NOW());

INSERT INTO "store_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('store-cat-001', 'Office Furniture', 'Desks, chairs, and office equipment', NOW(), NOW()),
    ('store-cat-002', 'Building Materials', 'Construction and building supplies', NOW(), NOW()),
    ('store-cat-003', 'Electronics', 'Computers, phones, and electronic devices', NOW(), NOW());

INSERT INTO "project_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('proj-cat-001', 'Residential Construction', 'Home building and renovation projects', NOW(), NOW()),
    ('proj-cat-002', 'Commercial Development', 'Office and commercial building projects', NOW(), NOW()),
    ('proj-cat-003', 'Infrastructure', 'Roads, bridges, and public infrastructure', NOW(), NOW());

INSERT INTO "blog_categories" ("id", "name", "description", "createdAt", "updatedAt")
VALUES 
    ('blog-cat-001', 'Real Estate News', 'Latest updates in Nigerian real estate', NOW(), NOW()),
    ('blog-cat-002', 'Food & Agriculture', 'Agricultural trends and food industry news', NOW(), NOW()),
    ('blog-cat-003', 'Business Tips', 'Entrepreneurship and business advice', NOW(), NOW());

-- Create site settings
INSERT INTO "site_settings" ("id", "key", "value", "type", "createdAt", "updatedAt")
VALUES 
    ('setting-001', 'site_name', 'BrightonHub', 'string', NOW(), NOW()),
    ('setting-002', 'contact_email', 'contact@brightonhub.com', 'string', NOW(), NOW()),
    ('setting-003', 'contact_phone', '+234-800-BRIGHTON', 'string', NOW(), NOW()),
    ('setting-004', 'maintenance_mode', 'false', 'boolean', NOW(), NOW());