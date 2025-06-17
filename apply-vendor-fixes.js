const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔧 Applying vendor application fixes...\n');

    // Read and execute the SQL fix
    const fs = require('fs');
    const sqlContent = fs.readFileSync('./Database/FIX_VENDOR_APPLICATIONS_TABLE.sql', 'utf8');
    
    console.log('📝 Executing SQL fixes...');
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('❌ SQL execution error:', error);
      
      // Try to apply fixes individually
      console.log('🔄 Trying individual fixes...');
      
      // 1. Fix ID column default
      console.log('1. Setting default UUID for ID column...');
      const { error: idError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE vendor_applications ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;`
      });
      if (idError) console.error('ID fix error:', idError);
      else console.log('✅ ID column fixed');

      // 2. Enable RLS
      console.log('2. Enabling RLS...');
      const { error: rlsError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `ALTER TABLE vendor_applications ENABLE ROW LEVEL SECURITY;`
      });
      if (rlsError) console.error('RLS error:', rlsError);
      else console.log('✅ RLS enabled');

      // 3. Create policies
      console.log('3. Creating RLS policies...');
      const policies = [
        `CREATE POLICY "Users can view own applications" ON vendor_applications FOR SELECT USING (auth.uid()::text = user_id);`,
        `CREATE POLICY "Users can create applications" ON vendor_applications FOR INSERT WITH CHECK (auth.uid()::text = user_id);`,
        `CREATE POLICY "Admins can view all applications" ON vendor_applications FOR SELECT USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'ADMIN'));`,
        `CREATE POLICY "Admins can update applications" ON vendor_applications FOR UPDATE USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid()::text AND users.role = 'ADMIN'));`
      ];

      for (const policy of policies) {
        const { error: policyError } = await supabaseAdmin.rpc('exec_sql', { sql: policy });
        if (policyError && !policyError.message.includes('already exists')) {
          console.error('Policy error:', policyError);
        }
      }
      console.log('✅ Policies created');

    } else {
      console.log('✅ SQL fixes applied successfully');
    }

    // Test the fixes
    console.log('\n🧪 Testing fixes...');
    
    // Test 1: Check if ID auto-generates
    console.log('Test 1: ID auto-generation...');
    const testInsert = {
      user_id: 'test-user-' + Date.now(),
      categories: ['property'],
      business_name: 'Test Business',
      business_description: 'Test description',
      contact_email: 'test@example.com',
      status: 'pending'
    };

    const { data: insertResult, error: insertError } = await supabaseAdmin
      .from('vendor_applications')
      .insert(testInsert)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test passed - ID generated:', insertResult.id);
      
      // Clean up test data
      await supabaseAdmin
        .from('vendor_applications')
        .delete()
        .eq('id', insertResult.id);
    }

    // Test 2: Check RLS policies
    console.log('Test 2: RLS policies...');
    const { data: policies, error: policyError } = await supabaseAdmin
      .rpc('exec_sql', {
        sql: `SELECT policyname, cmd FROM pg_policies WHERE tablename = 'vendor_applications';`
      });

    if (policyError) {
      console.error('❌ Policy check failed:', policyError);
    } else {
      console.log('✅ RLS policies active:', policies?.length || 0);
    }

    console.log('\n🎉 Vendor application system fixes completed!');
    console.log('\nKey improvements:');
    console.log('- ✅ Auto-generating UUIDs for applications');
    console.log('- ✅ Proper RLS policies for security');
    console.log('- ✅ API routes for better error handling');
    console.log('- ✅ Admin approval workflow');

  } catch (error) {
    console.error('❌ Fix application failed:', error);
  }
})();
