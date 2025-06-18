-- COLUMN NAMING STANDARDIZATION
-- This script standardizes all timestamp columns to snake_case (created_at, updated_at)
-- Run this in Supabase Dashboard > SQL Editor
-- Date: June 18, 2025

-- ===============================================
-- 1. STANDARDIZE PROPERTIES TABLE
-- ===============================================

-- Rename camelCase columns to snake_case in properties table
ALTER TABLE properties 
RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE properties 
RENAME COLUMN "updatedAt" TO updated_at;

-- ===============================================
-- 2. STANDARDIZE FOOD_ITEMS TABLE
-- ===============================================

ALTER TABLE food_items 
RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE food_items 
RENAME COLUMN "updatedAt" TO updated_at;

-- ===============================================
-- 3. STANDARDIZE STORE_PRODUCTS TABLE
-- ===============================================

ALTER TABLE store_products 
RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE store_products 
RENAME COLUMN "updatedAt" TO updated_at;

-- ===============================================
-- 4. STANDARDIZE PROJECTS TABLE
-- ===============================================

ALTER TABLE projects 
RENAME COLUMN "createdAt" TO created_at;

ALTER TABLE projects 
RENAME COLUMN "updatedAt" TO updated_at;

-- ===============================================
-- 5. UPDATE INDEXES (if they exist)
-- ===============================================

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_properties_createdAt;
DROP INDEX IF EXISTS idx_food_items_createdAt;
DROP INDEX IF EXISTS idx_store_products_createdAt;
DROP INDEX IF EXISTS idx_projects_createdAt;

-- Create new indexes with proper names
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at);
CREATE INDEX IF NOT EXISTS idx_food_items_created_at ON food_items(created_at);
CREATE INDEX IF NOT EXISTS idx_store_products_created_at ON store_products(created_at);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- ===============================================
-- 6. VERIFY CHANGES
-- ===============================================

-- Verify all tables now use snake_case consistently
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns 
WHERE table_name IN ('properties', 'food_items', 'store_products', 'projects', 'users', 'contact_messages')
  AND column_name IN ('created_at', 'updated_at', 'createdAt', 'updatedAt')
ORDER BY table_name, column_name;
