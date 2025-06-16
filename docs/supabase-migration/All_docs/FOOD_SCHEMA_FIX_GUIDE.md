# Food Schema Relationship Fix

## Issue
The application is encountering an error when trying to fetch food items with their categories:

```
Error: {code: 'PGRST204', details: null, hint: null, message: "Could not find the 'food_categories' column of 'food_items' in the schema cache"}
```

## Root Cause
The error occurs because:
1. The Supabase PostgREST query is trying to join `food_items` with `food_categories`
2. The foreign key relationship between these tables may not be properly established in the database
3. The query syntax may not be correctly specifying the relationship

## Solutions Applied

### 1. Fixed Query Syntax
Updated the queries in both `FoodTab.tsx` and `food/page.tsx` to use the correct PostgREST syntax for foreign key relationships:

**Before:**
```typescript
.select(`
  *,
  food_categories (
    id,
    name
  )
`)
```

**After:**
```typescript
.select(`
  *,
  food_categories:categoryId (
    id,
    name
  )
`)
```

The `:categoryId` explicitly tells PostgREST which foreign key to use for the relationship.

### 2. Database Schema Fix
Created `FOOD_SCHEMA_FIX.sql` migration script that:
- Ensures both tables exist with correct structure
- Verifies the `categoryId` column exists in `food_items`
- Drops and recreates the foreign key relationship
- Creates default categories if none exist
- Sets up proper RLS policies
- Creates performance indexes

### 3. Test Script
Created `test-food-schema.ts` to verify the relationship works correctly.

## Files Modified

1. **`components/admin/FoodTab.tsx`** - Fixed query syntax
2. **`app/food/page.tsx`** - Fixed query syntax
3. **`FOOD_SCHEMA_FIX.sql`** - Database migration script
4. **`test-food-schema.ts`** - Testing script

## How to Apply the Fix

### Step 1: Run Database Migration
Execute the `FOOD_SCHEMA_FIX.sql` script in your Supabase Dashboard:
1. Go to Supabase Dashboard > SQL Editor
2. Copy and paste the contents of `FOOD_SCHEMA_FIX.sql`
3. Run the script

### Step 2: Verify the Fix
1. Check that the foreign key relationship exists:
```sql
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='food_items';
```

2. Test the relationship query:
```sql
SELECT 
    fi.id, 
    fi.name, 
    fi."categoryId",
    fc.name as category_name
FROM food_items fi
LEFT JOIN food_categories fc ON fi."categoryId" = fc.id
LIMIT 5;
```

### Step 3: Test in Application
1. Navigate to the admin dashboard > Food tab
2. Check that food items load without errors
3. Verify that category names are displayed correctly

## Expected Behavior After Fix
- Food items should load successfully in the admin dashboard
- Category names should display properly for each food item
- No more "Could not find the 'food_categories' column" errors
- The relationship query should work correctly

## Backup Plan
If the automatic relationship still doesn't work, the application can fall back to manual joins:

```typescript
// Fetch food items without relationship
const { data: items } = await supabase
  .from('food_items')
  .select('*');

// Fetch categories separately
const { data: categories } = await supabase
  .from('food_categories')
  .select('*');

// Manually merge the data
const itemsWithCategories = items?.map(item => ({
  ...item,
  food_categories: categories?.find(cat => cat.id === item.categoryId)
}));
```

## Prevention
To prevent similar issues in the future:
1. Always verify foreign key relationships are created in the database
2. Test PostgREST queries in Supabase Dashboard before using in code
3. Use the explicit `:foreignKey` syntax for relationships
4. Create proper indexes for foreign key columns
5. Set up RLS policies for all tables

## Notes
- The query syntax `food_categories:categoryId` is the correct way to specify foreign key relationships in PostgREST
- Make sure the foreign key constraint exists in the database for the relationship to work
- RLS policies must allow access to both tables for the relationship query to succeed
