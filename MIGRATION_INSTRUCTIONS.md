# Migration Instructions

## Run ONLY this migration file:

**CORRECTED_CONTACT_MIGRATION.sql** ✅

## How to run:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the entire contents of `CORRECTED_CONTACT_MIGRATION.sql`
4. Paste and run the migration
5. Then run the seed data files in this order:
   - `corrected-seed-blog.sql`
   - `corrected-seed-food.sql` 
   - `corrected-seed-store.sql`
   - `corrected-seed-projects.sql`

## ❌ DO NOT RUN:
- FINAL_CONTACT_MIGRATION.sql (has error with non-existent column)
- Any other migration files

## ✅ The CORRECTED migration includes:
- Seller contact fields (food_items, store_products)
- Project contact fields  
- Blog author contact fields
- Both snake_case and camelCase columns
- Safe IF NOT EXISTS checks
