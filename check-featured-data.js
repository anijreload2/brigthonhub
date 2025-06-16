const { supabase } = require('./lib/supabase');

async function checkFeaturedData() {
  console.log('🔍 Checking featured data availability...\n');

  try {
    // Check properties
    console.log('📍 PROPERTIES:');
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, isActive')
      .eq('isActive', true)
      .limit(5);

    if (propError) {
      console.log('❌ Properties error:', propError.message);
    } else {
      console.log(`✅ Found ${properties?.length || 0} active properties`);
      if (properties && properties.length > 0) {
        properties.forEach(p => console.log(`  - ${p.title} (${p.id})`));
      }
    }

    // Check food items
    console.log('\n🍽️ FOOD ITEMS:');
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('id, name, isActive')
      .eq('isActive', true)
      .limit(5);

    if (foodError) {
      console.log('❌ Food items error:', foodError.message);
    } else {
      console.log(`✅ Found ${foodItems?.length || 0} active food items`);
      if (foodItems && foodItems.length > 0) {
        foodItems.forEach(f => console.log(`  - ${f.name} (${f.id})`));
      }
    }

    // Check store products
    console.log('\n🛒 STORE PRODUCTS:');
    const { data: products, error: storeError } = await supabase
      .from('store_products')
      .select('id, name, isActive')
      .eq('isActive', true)
      .limit(5);

    if (storeError) {
      console.log('❌ Store products error:', storeError.message);
    } else {
      console.log(`✅ Found ${products?.length || 0} active store products`);
      if (products && products.length > 0) {
        products.forEach(p => console.log(`  - ${p.name} (${p.id})`));
      }
    }

    // Check projects
    console.log('\n💼 PROJECTS:');
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id, title, isActive')
      .eq('isActive', true)
      .limit(5);

    if (projError) {
      console.log('❌ Projects error:', projError.message);
    } else {
      console.log(`✅ Found ${projects?.length || 0} active projects`);
      if (projects && projects.length > 0) {
        projects.forEach(p => console.log(`  - ${p.title} (${p.id})`));
      }
    }

    // Check testimonials
    console.log('\n⭐ TESTIMONIALS:');
    const { data: testimonials, error: testError } = await supabase
      .from('testimonials')
      .select('id, name, is_active, is_featured')
      .eq('is_active', true)
      .limit(5);

    if (testError) {
      console.log('❌ Testimonials error:', testError.message);
    } else {
      console.log(`✅ Found ${testimonials?.length || 0} active testimonials`);
      if (testimonials && testimonials.length > 0) {
        testimonials.forEach(t => console.log(`  - ${t.name} (featured: ${t.is_featured}) (${t.id})`));
      }
    }

    console.log('\n🎯 SUMMARY:');
    const totalItems = (properties?.length || 0) + (foodItems?.length || 0) + (products?.length || 0) + (projects?.length || 0);
    if (totalItems === 0) {
      console.log('⚠️  NO ACTIVE DATA FOUND - This explains why featured sections show fallback/static data');
      console.log('💡 SOLUTION: Add sample data through the admin interface or run seed scripts');
    } else {
      console.log(`✅ Total active items found: ${totalItems}`);
      console.log('🔄 Featured sections should be pulling from database');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkFeaturedData();
