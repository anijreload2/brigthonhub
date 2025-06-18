// Standardize column naming across all tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function standardizeColumnNaming() {
  console.log('🔧 Standardizing column naming to snake_case...\n');

  const tablesToFix = [
    { table: 'properties', from: 'createdAt', to: 'created_at' },
    { table: 'properties', from: 'updatedAt', to: 'updated_at' },
    { table: 'food_items', from: 'createdAt', to: 'created_at' },
    { table: 'food_items', from: 'updatedAt', to: 'updated_at' },
    { table: 'store_products', from: 'createdAt', to: 'created_at' },
    { table: 'store_products', from: 'updatedAt', to: 'updated_at' },
    { table: 'projects', from: 'createdAt', to: 'created_at' },
    { table: 'projects', from: 'updatedAt', to: 'updated_at' }
  ];

  for (const { table, from, to } of tablesToFix) {
    try {
      console.log(`🔄 Renaming ${table}.${from} to ${table}.${to}...`);
      
      const sql = `ALTER TABLE ${table} RENAME COLUMN "${from}" TO ${to};`;
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          console.log(`⏭️  ${table}.${from} already renamed or doesn't exist`);
        } else {
          console.log(`❌ Error renaming ${table}.${from}:`, error.message);
        }
      } else {
        console.log(`✅ Successfully renamed ${table}.${from} to ${table}.${to}`);
      }
      
    } catch (err) {
      console.log(`❌ Failed to rename ${table}.${from}:`, err.message);
    }
  }

  // Verify the changes
  console.log('\n🔍 Verifying column standardization...');
  
  const tablesToCheck = ['properties', 'food_items', 'store_products', 'projects', 'users', 'contact_messages'];
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Error checking ${tableName}:`, error.message);
        continue;
      }
      
      if (data && data.length > 0) {
        const columns = Object.keys(data[0]);
        const dateColumns = columns.filter(col => 
          col.includes('created') || col.includes('updated')
        );
        
        if (dateColumns.length > 0) {
          const hasSnakeCase = dateColumns.some(col => col.includes('_'));
          const hasCamelCase = dateColumns.some(col => !col.includes('_') && (col.includes('created') || col.includes('updated')));
          
          if (hasSnakeCase && !hasCamelCase) {
            console.log(`✅ ${tableName}: ${dateColumns.join(', ')} (standardized)`);
          } else if (hasCamelCase && !hasSnakeCase) {
            console.log(`⚠️  ${tableName}: ${dateColumns.join(', ')} (still camelCase)`);
          } else {
            console.log(`❓ ${tableName}: ${dateColumns.join(', ')} (mixed)`);
          }
        } else {
          console.log(`📊 ${tableName}: No date columns found`);
        }
      }
      
    } catch (err) {
      console.log(`❌ Failed to check ${tableName}:`, err.message);
    }
  }
}

// Run the standardization
standardizeColumnNaming().then(() => {
  console.log('\n🏁 Column naming standardization completed');
  console.log('\n📝 Next: Update TypeScript interfaces to use snake_case');
}).catch(error => {
  console.error('💥 Script failed:', error);
});
