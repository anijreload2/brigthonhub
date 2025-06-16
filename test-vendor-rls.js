const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create both clients for testing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  try {
    console.log('🔍 Testing vendor application submission...\n');
    
    // First, let's check the current user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError);
      return;
    }
    
    if (!user) {
      console.log('❌ No authenticated user');
      
      // Try to sign in as admin
      console.log('🔑 Attempting to sign in as admin...');
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@brightonhub.ng',
        password: 'Admin123!@#'
      });
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError);
        return;
      }
      
      console.log('✅ Signed in as:', authData.user?.email);
    } else {
      console.log('✅ Already authenticated as:', user.email);
    }
    
    // Get fresh auth state
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    if (!currentUser) {
      console.error('❌ Still no authenticated user');
      return;
    }
    
    console.log('👤 Current user ID:', currentUser.id);
    console.log('👤 Current user email:', currentUser.email);
    
    // Test vendor application submission
    console.log('\n🧪 Testing vendor application submission...');
    
    const testApplication = {
      user_id: currentUser.id,
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
    
    const { data, error } = await supabase
      .from('vendor_applications')
      .insert(testApplication);
      
    if (error) {
      console.error('❌ Insert error:', error);
      
      // Try with admin client
      console.log('\n🔐 Trying with admin client...');
      const { data: adminData, error: adminError } = await supabaseAdmin
        .from('vendor_applications')
        .insert(testApplication);
        
      if (adminError) {
        console.error('❌ Admin insert error:', adminError);
      } else {
        console.log('✅ Admin insert successful:', adminData);
      }
    } else {
      console.log('✅ Insert successful:', data);
    }
    
  } catch (err) {
    console.error('❌ Connection error:', err.message);
  }
})();
