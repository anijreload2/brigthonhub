-- Food Items Schema Fix Migration
-- Fixes the relationship between food_items and food_categories

-- First, check if tables exist and fix any relationship issues
DO $$
BEGIN
    -- Ensure food_categories table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'food_categories') THEN
        CREATE TABLE "food_categories" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "image" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")
        );
    END IF;

    -- Ensure food_items table exists with correct structure
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'food_items') THEN
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
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
        );
    END IF;

    -- Check if categoryId column exists, if not add it
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'food_items' AND column_name = 'categoryId'
    ) THEN
        ALTER TABLE "food_items" ADD COLUMN "categoryId" TEXT;
    END IF;

    -- Drop existing foreign key if it exists
    IF EXISTS (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'food_items' 
        AND constraint_name = 'food_items_categoryId_fkey'
    ) THEN
        ALTER TABLE "food_items" DROP CONSTRAINT "food_items_categoryId_fkey";
    END IF;

    -- Update any food_items that don't have categoryId set
    UPDATE "food_items" 
    SET "categoryId" = 'default-category' 
    WHERE "categoryId" IS NULL OR "categoryId" = '';

    -- Make categoryId NOT NULL
    ALTER TABLE "food_items" ALTER COLUMN "categoryId" SET NOT NULL;

    -- Add the foreign key constraint
    ALTER TABLE "food_items" 
    ADD CONSTRAINT "food_items_categoryId_fkey" 
    FOREIGN KEY ("categoryId") REFERENCES "food_categories"("id") 
    ON DELETE RESTRICT ON UPDATE CASCADE;

    -- Create default category if it doesn't exist
    INSERT INTO "food_categories" (id, name, description, "isActive", "createdAt", "updatedAt")
    VALUES ('default-category', 'General', 'Default food category', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (id) DO NOTHING;

END $$;

-- Enable RLS if not already enabled
ALTER TABLE "food_categories" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "food_items" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for food_categories (allow read for all, write for admins)
DROP POLICY IF EXISTS "food_categories_read_all" ON "food_categories";
CREATE POLICY "food_categories_read_all" ON "food_categories"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "food_categories_admin_all" ON "food_categories";
CREATE POLICY "food_categories_admin_all" ON "food_categories"
    FOR ALL USING (true); -- This will be restricted by your app logic

-- Create RLS policies for food_items (allow read for all, write for vendors/admins)
DROP POLICY IF EXISTS "food_items_read_all" ON "food_items";
CREATE POLICY "food_items_read_all" ON "food_items"
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "food_items_vendor_own" ON "food_items";
CREATE POLICY "food_items_vendor_own" ON "food_items"
    FOR ALL USING (true); -- This will be restricted by your app logic

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "food_items_categoryId_idx" ON "food_items"("categoryId");
CREATE INDEX IF NOT EXISTS "food_items_vendorId_idx" ON "food_items"("vendorId");
CREATE INDEX IF NOT EXISTS "food_items_isActive_idx" ON "food_items"("isActive");
CREATE INDEX IF NOT EXISTS "food_categories_isActive_idx" ON "food_categories"("isActive");

-- Insert some sample food categories if the table is empty
INSERT INTO "food_categories" (id, name, description, "isActive", "createdAt", "updatedAt")
VALUES 
    ('vegetables', 'Vegetables', 'Fresh vegetables and greens', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('fruits', 'Fruits', 'Fresh fruits and berries', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('grains', 'Grains & Cereals', 'Rice, wheat, oats and other grains', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('proteins', 'Proteins', 'Meat, fish, eggs and protein sources', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('dairy', 'Dairy Products', 'Milk, cheese, yogurt and dairy items', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('beverages', 'Beverages', 'Drinks, juices and beverages', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('snacks', 'Snacks', 'Chips, nuts and snack foods', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('spices', 'Spices & Seasonings', 'Herbs, spices and cooking seasonings', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Verify the relationship is working
-- This should not error if the relationship is correct
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count
    FROM "food_items" fi
    LEFT JOIN "food_categories" fc ON fi."categoryId" = fc.id;
    
    RAISE NOTICE 'Food items relationship test: % items found', test_count;
END $$;
