const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVendorApplications() {
  console.log('🔍 Testing vendor applications schema...\n');

  try {
    // Get existing applications
    const { data: applications, error } = await supabase
      .from('vendor_applications')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error fetching applications:', error);
      return;
    }

    console.log(`📊 Found ${applications.length} vendor applications`);
    
    if (applications.length > 0) {
      console.log('\n📋 Sample application structure:');
      console.log(JSON.stringify(applications[0], null, 2));
    }

    // Test insert with new structure
    console.log('\n🧪 Testing new application structure...');
    
    const testApplication = {
      user_id: 'test-user-id-' + Date.now(),
      categories: ['property', 'food'],
      business_name: 'Test Business',
      business_description: 'Test description',
      contact_email: 'test@example.com',
      contact_phone: '+234-800-TEST',
      business_address: '123 Test Street',
      website_url: 'https://testbusiness.com',
      verification_data: {
        experience: '5 years in real estate',
        certifications: 'Real Estate License',
        contact_preferences: {
          email: true,
          phone: true,
          whatsapp: false,
          platform_messages: true
        }
      },
      status: 'pending'
    };

    const { data: insertResult, error: insertError } = await supabase
      .from('vendor_applications')
      .insert(testApplication)
      .select();

    if (insertError) {
      console.error('❌ Insert test failed:', insertError);
    } else {
      console.log('✅ Insert test successful!');
      console.log('📝 Inserted application:', JSON.stringify(insertResult[0], null, 2));
      
      // Clean up test data
      await supabase
        .from('vendor_applications')
        .delete()
        .eq('id', insertResult[0].id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testVendorApplications();
