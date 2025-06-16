const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔍 Checking vendor_applications table access and RLS policies...\n');
    
    // Test 1: Query vendor_applications table directly
    console.log('📋 Test 1: Querying vendor_applications table...');
    const { data: applications, error: queryError } = await supabase
      .from('vendor_applications')
      .select('id, business_name, status, created_at')
      .limit(5);

    if (queryError) {
      console.error('❌ Error querying vendor_applications:', queryError);
    } else {
      console.log('✅ Successfully queried vendor_applications');
      console.log(`📊 Found ${applications.length} applications`);
      if (applications.length > 0) {
        console.log('📝 Sample data:', applications[0]);
      }
    }

    // Test 2: Try to insert a test record (should work with service role)
    console.log('\n📋 Test 2: Testing INSERT permission...');
    const testApplication = {
      business_name: 'RLS Test Business',
      business_type: 'restaurant',
      contact_name: 'Test Contact',
      email: 'test@example.com',
      phone: '123-456-7890',
      description: 'Test application for RLS',
      status: 'pending'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('vendor_applications')
      .insert(testApplication)
      .select();

    if (insertError) {
      console.error('❌ Error inserting test record:', insertError);
    } else {
      console.log('✅ Successfully inserted test record');
      console.log('📝 Inserted record:', insertData[0]);

      // Clean up - delete the test record
      if (insertData[0]?.id) {
        const { error: deleteError } = await supabase
          .from('vendor_applications')
          .delete()
          .eq('id', insertData[0].id);

        if (deleteError) {
          console.error('⚠️ Warning: Could not delete test record:', deleteError);
        } else {
          console.log('🧹 Test record cleaned up successfully');
        }
      }
    }

    // Test 3: Check table structure
    console.log('\n📋 Test 3: Checking table structure...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('vendor_applications')
      .select('*')
      .limit(0); // Get structure without data

    if (schemaError) {
      console.error('❌ Error checking table structure:', schemaError);
    } else {
      console.log('✅ Table structure accessible');
    }

  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
})();
