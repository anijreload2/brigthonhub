// Script to create missing database tables
// Run with: node create-missing-tables.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(fileName, description) {
  try {
    console.log(`\n🔄 Running migration: ${description}`);
    
    const sql = fs.readFileSync(`Database/${fileName}`, 'utf8');
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    if (error) {
      console.error(`❌ Error in ${fileName}:`, error);
      return false;
    }
    
    console.log(`✅ Successfully executed: ${description}`);
    return true;
  } catch (err) {
    console.error(`💥 Failed to run ${fileName}:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating missing database tables...');
  
  const migrations = [
    {
      file: 'MISSING_BOOKMARKS_TABLE.sql',
      description: 'Create user_bookmarks table'
    },
    {
      file: 'MISSING_USER_MESSAGES_TABLE.sql', 
      description: 'Create user_messages table'
    }
  ];
  
  let successCount = 0;
  
  for (const migration of migrations) {
    const success = await runMigration(migration.file, migration.description);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Migration Summary:`);
  console.log(`✅ Successful: ${successCount}/${migrations.length}`);
  console.log(`❌ Failed: ${migrations.length - successCount}/${migrations.length}`);
  
  if (successCount === migrations.length) {
    console.log('\n🎉 All migrations completed successfully!');
  } else {
    console.log('\n⚠️ Some migrations failed. Check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
