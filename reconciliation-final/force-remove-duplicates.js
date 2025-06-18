const { createClient } = require('@supabase/supabase-js');

// Load environment variables - try service role key for admin operations
require('dotenv').config({ path: '../.env.local' });

// Check if we have service role key, otherwise use anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔧 Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role (Admin)' : 'Anon Key');

const supabase = createClient(supabaseUrl, supabaseKey);

async function removeDuplicatesDirectly() {
  console.log('🔧 Attempting to remove duplicate columns directly...\n');
  
  const sqlCommands = [
    'ALTER TABLE projects DROP COLUMN IF EXISTS "contactName";',
    'ALTER TABLE projects DROP COLUMN IF EXISTS "contactPhone";', 
    'ALTER TABLE projects DROP COLUMN IF EXISTS "contactEmail";',
    'ALTER TABLE projects DROP COLUMN IF EXISTS "contactAddress";',
    'ALTER TABLE food_items DROP COLUMN IF EXISTS "sellerName";',
    'ALTER TABLE food_items DROP COLUMN IF EXISTS "sellerPhone";',
    'ALTER TABLE food_items DROP COLUMN IF EXISTS "sellerEmail";',
    'ALTER TABLE food_items DROP COLUMN IF EXISTS "sellerAddress";',
    'ALTER TABLE food_items DROP COLUMN IF EXISTS "sellerDescription";'
  ];
  
  try {
    for (const sql of sqlCommands) {
      console.log(`🗑️ Executing: ${sql}`);
      
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: sql
      });
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
        
        // Try alternative method - maybe the columns need different quoting
        const altSql = sql.replace(/"/g, '');
        console.log(`  🔄 Trying without quotes: ${altSql}`);
        
        const { data: altData, error: altError } = await supabase.rpc('exec_sql', {
          sql_query: altSql
        });
        
        if (altError) {
          console.error(`  ❌ Alternative also failed: ${altError.message}`);
        } else {
          console.log(`  ✅ Alternative succeeded`);
        }
      } else {
        console.log(`  ✅ Success: ${data}`);
      }
    }
    
    console.log('\n🔍 Checking if removal worked...');
    
    // Verify by selecting the specific columns
    try {
      const { data: testData, error: testError } = await supabase
        .from('projects')
        .select('contactName')
        .limit(1);
      
      if (testError && testError.message.includes('does not exist')) {
        console.log('✅ contactName column successfully removed from projects');
      } else {
        console.log('🔴 contactName column still exists in projects');
      }
    } catch (e) {
      console.log('✅ contactName column appears to be removed (selection failed as expected)');
    }
    
  } catch (error) {
    console.error('💥 Error during removal:', error);
    console.log('\n🤔 This might be a permissions issue. Let me try a different approach...');
    
    // Alternative: Check what permissions we have
    console.log('\n🔍 Checking our current permissions...');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: 'SELECT current_user, current_setting(\'is_superuser\');'
      });
      
      console.log('Current user info:', data);
    } catch (e) {
      console.log('Cannot check user permissions:', e.message);
    }
  }
}

removeDuplicatesDirectly();
