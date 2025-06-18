const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function removeDuplicateColumns() {
  console.log('🔧 Starting duplicate column removal...\n');
  
  const changes = [
    { table: 'projects', column: 'contactName', keep: 'contact_name' },
    { table: 'projects', column: 'contactPhone', keep: 'contact_phone' },
    { table: 'projects', column: 'contactEmail', keep: 'contact_email' },
    { table: 'projects', column: 'contactAddress', keep: 'contact_address' },
    { table: 'food_items', column: 'sellerName', keep: 'seller_name' },
    { table: 'food_items', column: 'sellerPhone', keep: 'seller_phone' },
    { table: 'food_items', column: 'sellerEmail', keep: 'seller_email' },
    { table: 'food_items', column: 'sellerAddress', keep: 'seller_address' },
    { table: 'food_items', column: 'sellerDescription', keep: 'seller_description' }
  ];
  
  try {
    for (const change of changes) {
      console.log(`🗑️ Removing ${change.table}.${change.column} (keeping ${change.keep})`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: `ALTER TABLE ${change.table} DROP COLUMN IF EXISTS ${change.column};`
      });
      
      if (error) {
        console.error(`  ❌ Failed: ${error.message}`);
      } else {
        console.log(`  ✅ Removed successfully`);
      }
    }
    
    console.log('\n🔍 Verifying duplicate removal...');
    
    // Verify projects table
    const { data: projectsData } = await supabase
      .from('projects')
      .select('contact_name, contact_phone, contact_email, contact_address')
      .limit(1);
    
    if (projectsData && projectsData.length > 0) {
      console.log('✅ Projects table - snake_case columns still exist:', Object.keys(projectsData[0]));
    }
    
    // Verify food_items table
    const { data: foodData } = await supabase
      .from('food_items') 
      .select('seller_name, seller_phone, seller_email, seller_address, seller_description')
      .limit(1);
    
    if (foodData && foodData.length > 0) {
      console.log('✅ Food items table - snake_case columns still exist:', Object.keys(foodData[0]));
    }
    
    console.log('\n🎉 DUPLICATE COLUMN REMOVAL COMPLETE!');
    
  } catch (error) {
    console.error('💥 Error during duplicate removal:', error);
  }
}

removeDuplicateColumns();
