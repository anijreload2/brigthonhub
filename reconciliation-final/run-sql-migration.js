const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runSQLMigration() {
  console.log('🔧 Starting database schema migration...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'fix-database-schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}:`);
      console.log(`   ${statement.substring(0, 100)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement + ';'
        });
        
        if (error) {
          console.log(`   ❌ Error: ${error.message}`);
          // Continue with next statement
        } else {
          console.log(`   ✅ Success`);
        }
      } catch (err) {
        console.log(`   ❌ Exception: ${err.message}`);
        // Continue with next statement
      }
      
      // Small delay between statements
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n🎉 Migration completed!');
    
    // Verify the changes
    console.log('\n🔍 Verifying table structures...');
    
    const tables = [
      'blog_categories',
      'project_categories', 
      'store_categories',
      'food_categories',
      'property_categories'
    ];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (!error && data) {
          console.log(`✅ ${table} - accessible`);
        } else {
          console.log(`❌ ${table} - ${error?.message || 'not accessible'}`);
        }
      } catch (err) {
        console.log(`❌ ${table} - ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative approach using direct ALTER TABLE commands
async function runDirectAlterCommands() {
  console.log('\n🔧 Running direct ALTER TABLE commands...');
  
  const alterCommands = [
    // blog_categories
    'ALTER TABLE blog_categories RENAME COLUMN "isActive" TO is_active',
    'ALTER TABLE blog_categories RENAME COLUMN "createdAt" TO created_at', 
    'ALTER TABLE blog_categories RENAME COLUMN "updatedAt" TO updated_at',
    
    // project_categories
    'ALTER TABLE project_categories RENAME COLUMN "isActive" TO is_active',
    'ALTER TABLE project_categories RENAME COLUMN "createdAt" TO created_at',
    'ALTER TABLE project_categories RENAME COLUMN "updatedAt" TO updated_at',
    
    // store_categories  
    'ALTER TABLE store_categories RENAME COLUMN "isActive" TO is_active',
    'ALTER TABLE store_categories RENAME COLUMN "createdAt" TO created_at',
    'ALTER TABLE store_categories RENAME COLUMN "updatedAt" TO updated_at',
    
    // food_categories
    'ALTER TABLE food_categories RENAME COLUMN "isActive" TO is_active', 
    'ALTER TABLE food_categories RENAME COLUMN "createdAt" TO created_at',
    'ALTER TABLE food_categories RENAME COLUMN "updatedAt" TO updated_at',
    
    // property_categories
    'ALTER TABLE property_categories RENAME COLUMN "isActive" TO is_active',
    'ALTER TABLE property_categories RENAME COLUMN "createdAt" TO created_at', 
    'ALTER TABLE property_categories RENAME COLUMN "updatedAt" TO updated_at'
  ];
  
  for (let i = 0; i < alterCommands.length; i++) {
    const command = alterCommands[i];
    console.log(`\n📝 Executing: ${command}`);
    
    try {
      // Try using the sql method directly
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(0); // Just to test connection
        
      // Since we can't execute DDL through the client, let's output the commands
      console.log(`   📋 Command ready: ${command};`);
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
  }
  
  console.log('\n📋 All ALTER TABLE commands listed above need to be run in Supabase SQL Editor');
}

async function main() {
  try {
    await runDirectAlterCommands();
  } catch (error) {
    console.error('❌ Failed:', error);
  }
}

main();
