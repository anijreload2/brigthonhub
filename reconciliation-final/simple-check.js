const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: '../.env.local' });

console.log('🔧 Environment check:');
console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Found' : 'Missing');
console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Found' : 'Missing');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('❌ Environment variables not found!');
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTables() {
  try {
    console.log('\n🔍 Checking known tables directly...\n');
    
    const knownTables = [
      'users', 'projects', 'properties', 'contact_messages', 
      'vendor_applications', 'testimonials', 'food_items',
      'user_profiles', 'blogs', 'messages', 'categories'
    ];
    
    const results = {
      timestamp: new Date().toISOString(),
      existing_tables: {},
      missing_tables: [],
      table_summary: {}
    };
    
    for (const tableName of knownTables) {
      try {
        console.log(`📋 Checking table: ${tableName}`);
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
          results.existing_tables[tableName] = {
            exists: true,
            columns: columns,
            column_count: columns.length,
            has_data: data && data.length > 0,
            sample_data: data && data.length > 0 ? data[0] : null
          };
          console.log(`  ✅ ${tableName}: ${columns.length} columns`);
        } else {
          results.missing_tables.push({
            name: tableName,
            error: error.message
          });
          console.log(`  ❌ ${tableName}: ${error.message}`);
        }
      } catch (e) {
        results.missing_tables.push({
          name: tableName,
          error: e.message
        });
        console.log(`  ❌ ${tableName}: ${e.message}`);
      }
    }
    
    // Generate summary
    results.table_summary = {
      total_checked: knownTables.length,
      existing_count: Object.keys(results.existing_tables).length,
      missing_count: results.missing_tables.length,
      total_columns: Object.values(results.existing_tables)
        .reduce((sum, table) => sum + table.column_count, 0)
    };
    
    // Save results
    const outputPath = path.join(__dirname, 'table-check-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    
    console.log('\n📊 SUMMARY:');
    console.log(`✅ Existing tables: ${results.table_summary.existing_count}`);
    console.log(`❌ Missing tables: ${results.table_summary.missing_count}`);
    console.log(`📋 Total columns: ${results.table_summary.total_columns}`);
    console.log(`💾 Results saved to: ${outputPath}\n`);
    
    return results;
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

checkTables();
