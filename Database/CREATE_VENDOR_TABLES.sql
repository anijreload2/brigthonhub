-- VENDOR SYSTEM DATABASE TABLES CREATION
-- Execute this in Supabase SQL Editor after creating exec_sql function
-- Phase 1: Create all missing vendor-related tables

BEGIN;

-- 1. CREATE VENDOR_LISTINGS TABLE
CREATE TABLE IF NOT EXISTS vendor_listings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL,
  category text NOT NULL CHECK (category IN ('property', 'food', 'marketplace', 'projects')),
  title text NOT NULL,
  description text NOT NULL,
  price decimal(12,2),
  currency text DEFAULT 'NGN',
  location text,
  contact_info jsonb DEFAULT '{}',
  images text[] DEFAULT '{}',
  specifications jsonb DEFAULT '{}',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'sold', 'expired')),
  featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  updated_at timestamp with time zone DEFAULT NOW(),
  
  -- Foreign key constraint (will be added after checking users table)
  CONSTRAINT vendor_listings_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 2. CREATE VENDOR_MESSAGES TABLE
CREATE TABLE IF NOT EXISTS vendor_messages (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL,
  customer_id text NOT NULL,
  listing_id text,
  subject text,
  message text NOT NULL,
  read_by_vendor boolean DEFAULT false,
  read_by_customer boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT NOW(),
  
  -- Foreign key constraints
  CONSTRAINT vendor_messages_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT vendor_messages_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT vendor_messages_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES vendor_listings(id) ON DELETE SET NULL
);

-- 3. CREATE VENDOR_ANALYTICS TABLE
CREATE TABLE IF NOT EXISTS vendor_analytics (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL,
  date date NOT NULL,
  listing_views integer DEFAULT 0,
  contact_requests integer DEFAULT 0,
  messages_received integer DEFAULT 0,
  listings_created integer DEFAULT 0,
  revenue decimal(12,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT NOW(),
  
  -- Foreign key constraint
  CONSTRAINT vendor_analytics_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint for vendor per date
  CONSTRAINT vendor_analytics_vendor_date_unique UNIQUE (vendor_id, date)
);

-- 4. ENHANCE VENDOR_APPLICATIONS TABLE (add missing columns)
DO $$
BEGIN
  -- Add instant_approval column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vendor_applications' 
                 AND column_name = 'instant_approval') THEN
    ALTER TABLE vendor_applications ADD COLUMN instant_approval boolean DEFAULT false;
  END IF;
  
  -- Add business_documents column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vendor_applications' 
                 AND column_name = 'business_documents') THEN
    ALTER TABLE vendor_applications ADD COLUMN business_documents jsonb DEFAULT '{}';
  END IF;
  
  -- Add subscription_plan column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'vendor_applications' 
                 AND column_name = 'subscription_plan') THEN
    ALTER TABLE vendor_applications ADD COLUMN subscription_plan text DEFAULT 'basic';
  END IF;
END $$;

-- 5. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS vendor_listings_vendor_id_idx ON vendor_listings(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_listings_category_idx ON vendor_listings(category);
CREATE INDEX IF NOT EXISTS vendor_listings_status_idx ON vendor_listings(status);
CREATE INDEX IF NOT EXISTS vendor_listings_created_at_idx ON vendor_listings(created_at);
CREATE INDEX IF NOT EXISTS vendor_listings_featured_idx ON vendor_listings(featured) WHERE featured = true;

CREATE INDEX IF NOT EXISTS vendor_messages_vendor_id_idx ON vendor_messages(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_messages_customer_id_idx ON vendor_messages(customer_id);
CREATE INDEX IF NOT EXISTS vendor_messages_listing_id_idx ON vendor_messages(listing_id);
CREATE INDEX IF NOT EXISTS vendor_messages_created_at_idx ON vendor_messages(created_at);

CREATE INDEX IF NOT EXISTS vendor_analytics_vendor_id_idx ON vendor_analytics(vendor_id);
CREATE INDEX IF NOT EXISTS vendor_analytics_date_idx ON vendor_analytics(date);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE vendor_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_analytics ENABLE ROW LEVEL SECURITY;

-- 7. CREATE RLS POLICIES FOR VENDOR_LISTINGS
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can manage own listings" ON vendor_listings;
DROP POLICY IF EXISTS "Public can view active listings" ON vendor_listings;
DROP POLICY IF EXISTS "Admins can manage all listings" ON vendor_listings;

-- Vendors can manage their own listings
CREATE POLICY "Vendors can manage own listings" ON vendor_listings
FOR ALL USING (
  vendor_id = auth.uid()::text OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role IN ('ADMIN', 'VENDOR')
  )
);

-- Public can view active listings
CREATE POLICY "Public can view active listings" ON vendor_listings
FOR SELECT USING (status = 'active');

-- Admins can manage all listings
CREATE POLICY "Admins can manage all listings" ON vendor_listings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'ADMIN'
  )
);

-- 8. CREATE RLS POLICIES FOR VENDOR_MESSAGES
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can access own messages" ON vendor_messages;
DROP POLICY IF EXISTS "Admins can access all messages" ON vendor_messages;

-- Users can access messages where they are vendor or customer
CREATE POLICY "Users can access own messages" ON vendor_messages
FOR ALL USING (
  vendor_id = auth.uid()::text OR 
  customer_id = auth.uid()::text
);

-- Admins can access all messages
CREATE POLICY "Admins can access all messages" ON vendor_messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'ADMIN'
  )
);

-- 9. CREATE RLS POLICIES FOR VENDOR_ANALYTICS
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Vendors can view own analytics" ON vendor_analytics;
DROP POLICY IF EXISTS "Admins can view all analytics" ON vendor_analytics;

-- Vendors can view their own analytics
CREATE POLICY "Vendors can view own analytics" ON vendor_analytics
FOR SELECT USING (vendor_id = auth.uid()::text);

-- Admins can view all analytics
CREATE POLICY "Admins can view all analytics" ON vendor_analytics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid()::text 
    AND users.role = 'ADMIN'
  )
);

-- 10. CREATE TRIGGERS FOR AUTOMATIC UPDATES
-- Update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to vendor_listings
DROP TRIGGER IF EXISTS update_vendor_listings_updated_at ON vendor_listings;
CREATE TRIGGER update_vendor_listings_updated_at
  BEFORE UPDATE ON vendor_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 11. CREATE FUNCTION TO UPDATE ANALYTICS
CREATE OR REPLACE FUNCTION update_vendor_analytics(
  p_vendor_id text,
  p_listing_views integer DEFAULT 0,
  p_contact_requests integer DEFAULT 0,
  p_messages_received integer DEFAULT 0,
  p_listings_created integer DEFAULT 0,
  p_revenue decimal DEFAULT 0
)
RETURNS void AS $$
BEGIN
  INSERT INTO vendor_analytics (
    vendor_id, 
    date, 
    listing_views, 
    contact_requests, 
    messages_received, 
    listings_created,
    revenue
  ) VALUES (
    p_vendor_id, 
    CURRENT_DATE, 
    p_listing_views, 
    p_contact_requests, 
    p_messages_received, 
    p_listings_created,
    p_revenue
  )
  ON CONFLICT (vendor_id, date) 
  DO UPDATE SET
    listing_views = vendor_analytics.listing_views + p_listing_views,
    contact_requests = vendor_analytics.contact_requests + p_contact_requests,
    messages_received = vendor_analytics.messages_received + p_messages_received,
    listings_created = vendor_analytics.listings_created + p_listings_created,
    revenue = vendor_analytics.revenue + p_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. CREATE TRIGGER TO AUTO-UPDATE ANALYTICS
CREATE OR REPLACE FUNCTION trigger_update_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when new listing is created
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'vendor_listings' THEN
    PERFORM update_vendor_analytics(NEW.vendor_id, 0, 0, 0, 1, 0);
  END IF;
  
  -- Update analytics when listing view count changes
  IF TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'vendor_listings' AND OLD.view_count != NEW.view_count THEN
    PERFORM update_vendor_analytics(NEW.vendor_id, NEW.view_count - OLD.view_count, 0, 0, 0, 0);
  END IF;
  
  -- Update analytics when new message is received
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'vendor_messages' THEN
    PERFORM update_vendor_analytics(NEW.vendor_id, 0, 0, 1, 0, 0);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply analytics triggers
DROP TRIGGER IF EXISTS vendor_listings_analytics_trigger ON vendor_listings;
CREATE TRIGGER vendor_listings_analytics_trigger
  AFTER INSERT OR UPDATE ON vendor_listings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();

DROP TRIGGER IF EXISTS vendor_messages_analytics_trigger ON vendor_messages;
CREATE TRIGGER vendor_messages_analytics_trigger
  AFTER INSERT ON vendor_messages
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_analytics();

-- 13. GRANT PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vendor_messages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON vendor_analytics TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION update_vendor_analytics TO authenticated;

COMMIT;

-- 14. VERIFICATION QUERIES
DO $$
BEGIN
  RAISE NOTICE '=== VENDOR SYSTEM TABLES CREATION COMPLETED ===';
  RAISE NOTICE 'Tables created:';
  RAISE NOTICE '✅ vendor_listings - Product/service listings management';
  RAISE NOTICE '✅ vendor_messages - Vendor-customer communication';
  RAISE NOTICE '✅ vendor_analytics - Performance tracking';
  RAISE NOTICE '✅ Enhanced vendor_applications with new columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Features implemented:';
  RAISE NOTICE '✅ Row Level Security policies';
  RAISE NOTICE '✅ Performance indexes';
  RAISE NOTICE '✅ Automatic analytics updates';
  RAISE NOTICE '✅ Foreign key relationships';
  RAISE NOTICE '✅ Data validation constraints';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Create vendor signup API endpoint';
  RAISE NOTICE '2. Implement vendor listings management';
  RAISE NOTICE '3. Build messaging system';
  RAISE NOTICE '4. Enhance vendor dashboard';
END $$;
