const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function investigateIssues() {
  console.log('🔍 Investigating Brighton Hub Issues...\n');
  
  // 1. Check if AI training tables exist
  console.log('📊 ISSUE 1: AI Training Backend Tables');
  console.log('='.repeat(50));
  
  const aiTables = ['ai_training_data', 'training_data', 'ai_responses'];
  for (const table of aiTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        if (error.code === 'PGRST106') {
          console.log(`❌ Table '${table}' does NOT exist`);
        } else {
          console.log(`❌ Error accessing '${table}': ${error.message}`);
        }
      } else {
        console.log(`✅ Table '${table}' exists with columns:`, Object.keys(data[0] || {}));
      }
    } catch (err) {
      console.log(`❌ Exception checking '${table}': ${err.message}`);
    }
  }
  
  // 2. Check projects table for image issues
  console.log('\n📊 ISSUE 2: Projects Image Display');
  console.log('='.repeat(50));
  
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, title, before_images, after_images, status')
      .limit(3);
      
    if (error) {
      console.log(`❌ Error fetching projects: ${error.message}`);
    } else {
      console.log(`✅ Found ${projects.length} projects`);
      projects.forEach(project => {
        console.log(`  Project: ${project.title}`);
        console.log(`    Before images: ${project.before_images ? 'EXISTS' : 'NULL/EMPTY'}`);
        console.log(`    After images: ${project.after_images ? 'EXISTS' : 'NULL/EMPTY'}`);
        console.log(`    Status: ${project.status}`);
      });
    }
  } catch (err) {
    console.log(`❌ Exception checking projects: ${err.message}`);
  }
  
  // 3. Check vendor products relationship
  console.log('\n📊 ISSUE 3: Vendor Products Display');
  console.log('='.repeat(50));
  
  try {
    // Check if vendors table exists
    const { data: vendors, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .limit(1);
      
    if (vendorError && vendorError.code === 'PGRST106') {
      console.log('❌ vendors table does NOT exist');
    } else if (vendorError) {
      console.log(`❌ Error accessing vendors: ${vendorError.message}`);
    } else {
      console.log(`✅ vendors table exists`);
    }
    
    // Check store_products for vendor relationship
    const { data: products, error: productError } = await supabase
      .from('store_products')
      .select('id, name, vendor_id, seller_name')
      .limit(3);
      
    if (productError) {
      console.log(`❌ Error fetching store_products: ${productError.message}`);
    } else {
      console.log(`✅ Found ${products.length} store products`);
      products.forEach(product => {
        console.log(`  Product: ${product.name}`);
        console.log(`    Vendor ID: ${product.vendor_id || 'NULL'}`);
        console.log(`    Seller: ${product.seller_name || 'NULL'}`);
      });
    }
    
    // Check food_items for vendor relationship
    const { data: foodItems, error: foodError } = await supabase
      .from('food_items')
      .select('id, name, vendor_id, seller_name')
      .limit(3);
      
    if (foodError) {
      console.log(`❌ Error fetching food_items: ${foodError.message}`);
    } else {
      console.log(`✅ Found ${foodItems.length} food items`);
      foodItems.forEach(item => {
        console.log(`  Food: ${item.name}`);
        console.log(`    Vendor ID: ${item.vendor_id || 'NULL'}`);
        console.log(`    Seller: ${item.seller_name || 'NULL'}`);
      });
    }
    
  } catch (err) {
    console.log(`❌ Exception checking vendor products: ${err.message}`);
  }
  
  // 4. Check if missing critical tables
  console.log('\n📊 ISSUE 4: Missing Critical Tables Check');
  console.log('='.repeat(50));
  
  const criticalTables = [
    'vendors',
    'vendor_applications', 
    'ai_training_data',
    'testimonials',
    'site_settings',
    'media_gallery'
  ];
  
  for (const table of criticalTables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error && error.code === 'PGRST106') {
        console.log(`❌ MISSING: '${table}' table does not exist`);
      } else if (error) {
        console.log(`❌ ERROR: '${table}' - ${error.message}`);
      } else {
        console.log(`✅ EXISTS: '${table}' table found`);
      }
    } catch (err) {
      console.log(`❌ EXCEPTION: '${table}' - ${err.message}`);
    }
  }
}

async function main() {
  try {
    await investigateIssues();
    console.log('\n🎯 Investigation completed!');
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

main();
