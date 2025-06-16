const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔍 Checking RLS policies for vendor_applications table...\n');
    
    const { data, error } = await supabase.rpc('exec_sql', {
      query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd,
          qual,
          with_check
        FROM pg_policies 
        WHERE tablename = 'vendor_applications'
        ORDER BY policyname;
      `
    });

    if (error) {
      console.error('❌ Error checking RLS policies:', error);
    } else {
      console.log('📋 RLS Policies for vendor_applications:');
      console.log(JSON.stringify(data, null, 2));
    }

    // Also check if RLS is enabled
    const { data: rlsData, error: rlsError } = await supabase.rpc('exec_sql', {
      query: `
        SELECT 
          tablename,
          rowsecurity
        FROM pg_tables 
        WHERE tablename = 'vendor_applications';
      `
    });

    if (rlsError) {
      console.error('❌ Error checking RLS status:', rlsError);
    } else {
      console.log('\n🔒 RLS Status:');
      console.log(JSON.stringify(rlsData, null, 2));
    }

  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
})();
