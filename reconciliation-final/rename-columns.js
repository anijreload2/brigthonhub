const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function renameCamelCaseColumns() {
  console.log('🔧 Starting camelCase to snake_case column renaming...\n');
  
  // Following PROJECT_RULES.md exactly
  const renamings = [
    // Projects table
    { table: 'projects', from: 'category_id', to: 'category_id' },
    { table: 'projects', from: 'beforeImages', to: 'before_images' },
    { table: 'projects', from: 'afterImages', to: 'after_images' },
    { table: 'projects', from: 'startDate', to: 'start_date' },
    { table: 'projects', from: 'endDate', to: 'end_date' },
    { table: 'projects', from: 'clientName', to: 'client_name' },
    { table: 'projects', from: 'is_active', to: 'is_active' },
    
    // Properties table
    { table: 'properties', from: 'category_id', to: 'category_id' },
    { table: 'properties', from: 'propertyType', to: 'property_type' },
    { table: 'properties', from: 'listingType', to: 'listing_type' },
    { table: 'properties', from: 'is_active', to: 'is_active' },
    { table: 'properties', from: 'agentId', to: 'agent_id' },
    
    // Food items table
    { table: 'food_items', from: 'category_id', to: 'category_id' },
    { table: 'food_items', from: 'minimumOrder', to: 'minimum_order' },
    { table: 'food_items', from: 'nutritionalInfo', to: 'nutritional_info' },
    { table: 'food_items', from: 'is_active', to: 'is_active' },
    { table: 'food_items', from: 'vendorId', to: 'vendor_id' },
    
    // User profiles table
    { table: 'user_profiles', from: 'user_id', to: 'user_id' },
    { table: 'user_profiles', from: 'first_name', to: 'first_name' },
    { table: 'user_profiles', from: 'last_name', to: 'last_name' },
    { table: 'user_profiles', from: 'businessName', to: 'business_name' },
    { table: 'user_profiles', from: 'businessAddress', to: 'business_address' },
    { table: 'user_profiles', from: 'businessPhone', to: 'business_phone' },
    { table: 'user_profiles', from: 'created_at', to: 'created_at' },
    { table: 'user_profiles', from: 'updated_at', to: 'updated_at' }
  ];
  
  try {
    for (const rename of renamings) {
      console.log(`🔄 ${rename.table}: ${rename.from} → ${rename.to}`);
      
      const sql = `ALTER TABLE ${rename.table} RENAME COLUMN "${rename.from}" TO "${rename.to}";`;
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: sql
      });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`  ⚠️ Column ${rename.from} does not exist (might already be renamed)`);
        } else if (error.message.includes('already exists')) {
          console.log(`  ⚠️ Column ${rename.to} already exists (might already be renamed)`);
        } else {
          console.error(`  ❌ Error: ${error.message}`);
        }
      } else {
        console.log(`  ✅ Renamed successfully`);
      }
    }
    
    console.log('\n🔍 Verifying column renames...');
    
    // Check each table for the new snake_case columns
    const tables = ['projects', 'properties', 'food_items', 'user_profiles'];
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (data && data.length > 0) {
          const columns = Object.keys(data[0]);
          const camelCaseColumns = columns.filter(col => /[A-Z]/.test(col) && !col.includes('_'));
          
          console.log(`📋 ${tableName}:`);
          console.log(`  Total columns: ${columns.length}`);
          console.log(`  Remaining camelCase: ${camelCaseColumns.length > 0 ? camelCaseColumns.join(', ') : 'None ✅'}`);
        }
      } catch (e) {
        console.log(`📋 ${tableName}: Error checking - ${e.message}`);
      }
    }
    
    console.log('\n🎉 COLUMN RENAMING COMPLETE!');
    
  } catch (error) {
    console.error('💥 Error during column renaming:', error);
  }
}

renameCamelCaseColumns();
