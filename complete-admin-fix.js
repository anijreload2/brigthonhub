const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addMissingColumnsToAdminActivities() {
  try {
    console.log('🔧 Adding all missing columns to admin_activities table...');
    
    const columnsToAdd = [
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS action TEXT;',
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS entity_type TEXT;', 
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS entity_id TEXT;',
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS details JSONB;',
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS admin_id TEXT;',
      'ALTER TABLE admin_activities ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();'
    ];
    
    for (const sql of columnsToAdd) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`Error: ${error.message}`);
      } else {
        console.log(`✅ Executed: ${sql.split(' ')[6]}`);
      }
    }
    
    // Test the fix
    console.log('\n🧪 Testing complete admin_activities table...');
    const { data: testData, error: testError } = await supabase
      .from('admin_activities')
      .insert({
        action: 'test_complete',
        entity_type: 'vendor_application',
        entity_id: 'test-456',
        user_id: 'admin-001',
        admin_id: 'admin-001',
        details: { test: 'complete fix verification' }
      })
      .select()
      .single();
    
    if (testError) {
      console.log('❌ Test still failed:', testError.message);
    } else {
      console.log('✅ Complete fix successful!');
      await supabase.from('admin_activities').delete().eq('id', testData.id);
    }
    
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

addMissingColumnsToAdminActivities();
