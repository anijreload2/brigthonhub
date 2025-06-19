require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function getTableSchema(tableName) {
  console.log(`\n🔍 Getting schema for ${tableName}:`);
  
  try {
    // Try to get the CREATE TABLE statement using pg_dump-like functionality
    const { data, error } = await supabase.rpc('get_table_schema', { 
      table_name: tableName 
    });
    
    if (error) {
      console.log('RPC failed, trying information_schema...');
      
      // Fallback: Use information_schema
      const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select(`
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale,
          ordinal_position
        `)
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');
      
      if (colError) {
        console.log('Information schema failed, trying describe approach...');
        
        // Try DESCRIBE equivalent
        const { data: describeData, error: describeError } = await supabase
          .rpc('describe_table', { table_name: tableName });
          
        if (describeError) {
          console.log('Describe failed, trying manual inspection...');
          
          // Manual inspection - try to insert invalid data to get column info
          const { error: insertError } = await supabase
            .from(tableName)
            .insert({ test_column: 'test' });
            
          if (insertError) {
            console.log('Insert error (expected):', insertError.message);
            
            // Try to parse error message for column hints
            if (insertError.message.includes('column')) {
              const columnMatch = insertError.message.match(/column "([^"]+)"/g);
              if (columnMatch) {
                console.log('Possible columns from error:', columnMatch);
              }
            }
          }
          
          return { error: 'Could not determine schema' };
        } else {
          return { method: 'describe', data: describeData };
        }
      } else {
        console.log(`✅ Found ${columns.length} columns:`);
        columns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`);
        });
        return { method: 'information_schema', columns };
      }
    } else {
      return { method: 'rpc', data };
    }
  } catch (error) {
    console.error(`Error getting schema for ${tableName}:`, error);
    return { error: error.message };
  }
}

async function main() {
  console.log('🏗️  GETTING ACTUAL TABLE SCHEMAS');
  console.log('================================');
  
  const tables = ['user_bookmarks', 'property_favorites'];
  
  for (const table of tables) {
    const schema = await getTableSchema(table);
    console.log(`\n📋 ${table.toUpperCase()} SCHEMA:`);
    console.log(JSON.stringify(schema, null, 2));
  }
  
  // Also try a direct SQL approach using raw query
  console.log('\n🔧 TRYING RAW SQL APPROACH:');
  console.log('==========================');
  
  for (const table of tables) {
    try {
      console.log(`\n📋 Checking ${table} with raw SQL...`);
      
      // Try to get column info using PostgreSQL system catalogs
      const { data, error } = await supabase.rpc('exec_sql', {
        query: `
          SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
            AND table_name = '${table}'
          ORDER BY ordinal_position;
        `
      });
      
      if (error) {
        console.log(`SQL approach failed: ${error.message}`);
        
        // Try alternative approach - check table existence and try basic operations
        console.log(`Trying basic table operations for ${table}...`);
        
        // Try SELECT with LIMIT 0 to get column structure
        const { data: emptyData, error: emptyError } = await supabase
          .from(table)
          .select('*')
          .limit(0);
          
        if (emptyError) {
          console.log(`Empty select failed: ${emptyError.message}`);
        } else {
          console.log(`Empty select succeeded - table structure can be inferred`);
        }
        
        // Try inserting minimal data to see what columns are required
        const testData = {};
        const { error: insertError } = await supabase
          .from(table)
          .insert(testData);
          
        if (insertError) {
          console.log(`Test insert error: ${insertError.message}`);
          
          // Parse the error to understand required columns
          if (insertError.message.includes('null value in column')) {
            const matches = insertError.message.match(/null value in column "([^"]+)"/g);
            if (matches) {
              console.log('Required columns (from error):', matches.map(m => m.match(/"([^"]+)"/)[1]));
            }
          }
          
          if (insertError.message.includes('duplicate key')) {
            console.log('Table has unique constraints (good sign it has proper structure)');
          }
        }
      } else {
        console.log(`✅ SQL result for ${table}:`, data);
      }
    } catch (err) {
      console.log(`Exception for ${table}:`, err.message);
    }
  }
}

main().catch(console.error);
