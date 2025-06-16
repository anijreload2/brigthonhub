const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔍 Testing vendor application with admin client...\n');
      // Test inserting a vendor application bypassing RLS
    const testId = require('crypto').randomUUID();
    const testApplication = {
      id: testId,
      user_id: 'admin-001', // Known admin user ID
      categories: ['properties'],
      business_name: 'Test Business',
      business_description: 'Test Description',
      contact_email: 'test@example.com',
      contact_phone: '+1234567890',
      business_address: 'Test Address',
      website_url: 'https://test.com',
      verification_data: {
        experience: 'Test experience',
        certifications: 'Test certifications',
        contact_preferences: ['email']
      },
      status: 'pending'
    };
    
    console.log('📝 Test application data:');
    console.log(JSON.stringify(testApplication, null, 2));
    
    const { data, error } = await supabaseAdmin
      .from('vendor_applications')
      .insert(testApplication)
      .select();
      
    if (error) {
      console.error('❌ Insert error:', error);
    } else {
      console.log('✅ Insert successful:');
      console.log(JSON.stringify(data, null, 2));
    }
    
    // Also check existing vendor applications
    console.log('\n📋 Checking existing vendor applications...');
    const { data: existing, error: existingError } = await supabaseAdmin
      .from('vendor_applications')
      .select('*')
      .limit(3);
      
    if (existingError) {
      console.error('❌ Query error:', existingError);
    } else {
      console.log('✅ Existing applications:', existing.length);
      if (existing.length > 0) {
        console.log('First application:', JSON.stringify(existing[0], null, 2));
      }
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
