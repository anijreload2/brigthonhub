// Test Food Schema Relationship
// Run this script to verify the food_items and food_categories relationship

import { supabase } from './lib/supabase';

async function testFoodSchema() {
  console.log('🔍 Testing Food Schema Relationship...');

  try {
    // Test 1: Check if food_categories table exists and has data
    console.log('\n1. Testing food_categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('food_categories')
      .select('*')
      .limit(5);

    if (categoriesError) {
      console.error('❌ Error fetching food_categories:', categoriesError);
    } else {
      console.log(`✅ Found ${categories?.length || 0} food categories`);
      if (categories && categories.length > 0) {
        console.log('   Sample category:', categories[0]);
      }
    }

    // Test 2: Check if food_items table exists and has data
    console.log('\n2. Testing food_items table...');
    const { data: items, error: itemsError } = await supabase
      .from('food_items')
      .select('*')
      .limit(5);

    if (itemsError) {
      console.error('❌ Error fetching food_items:', itemsError);
    } else {
      console.log(`✅ Found ${items?.length || 0} food items`);
      if (items && items.length > 0) {
        console.log('   Sample item:', items[0]);
      }
    }

    // Test 3: Test the relationship query
    console.log('\n3. Testing food_items with category relationship...');
    const { data: joinedData, error: joinError } = await supabase
      .from('food_items')
      .select(`
        id,
        name,
        categoryId,
        food_categories:categoryId (
          id,
          name
        )
      `)
      .limit(3);

    if (joinError) {
      console.error('❌ Error with relationship query:', joinError);
      
      // Try alternative syntax
      console.log('\n   Trying alternative syntax...');
      const { data: altData, error: altError } = await supabase
        .from('food_items')
        .select(`
          id,
          name,
          categoryId
        `)
        .limit(3);

      if (altError) {
        console.error('❌ Alternative query also failed:', altError);
      } else {
        console.log('✅ Basic food_items query works');
        console.log('   Items:', altData);
        
        // Manual join
        if (altData && altData.length > 0) {
          const categoryIds = Array.from(new Set(altData.map((item: any) => item.categoryId)));
          const { data: catData, error: catError } = await supabase
            .from('food_categories')
            .select('id, name')
            .in('id', categoryIds);

          if (!catError && catData) {
            console.log('✅ Manual category lookup works');
            console.log('   Categories:', catData);
          }
        }
      }
    } else {
      console.log(`✅ Relationship query successful! Found ${joinedData?.length || 0} items with categories`);
      if (joinedData && joinedData.length > 0) {
        console.log('   Sample with category:', joinedData[0]);
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }

  console.log('\n🔍 Test complete! Check the results above.');
}

// Export for use in other files
export { testFoodSchema };

// Run if called directly
if (typeof window !== 'undefined') {
  // Browser environment - can be called manually
  (window as any).testFoodSchema = testFoodSchema;
}
