-- Enable public read access for all main tables
-- Run this in your Supabase SQL Editor

-- Properties
CREATE POLICY "Allow public read access" ON "properties" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "property_categories" FOR SELECT USING (true);

-- Food
CREATE POLICY "Allow public read access" ON "food_items" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "food_categories" FOR SELECT USING (true);

-- Store
CREATE POLICY "Allow public read access" ON "store_products" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "store_categories" FOR SELECT USING (true);

-- Projects
CREATE POLICY "Allow public read access" ON "projects" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "project_categories" FOR SELECT USING (true);

-- Blog
CREATE POLICY "Allow public read access" ON "blog_posts" FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON "blog_categories" FOR SELECT USING (true);

-- Content blocks (for hero sections)
CREATE POLICY "Allow public read access" ON "content_blocks" FOR SELECT USING (true);
