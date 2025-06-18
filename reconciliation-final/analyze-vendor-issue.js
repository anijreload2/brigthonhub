const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://jahtkqvekhdjwoflatpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphaHRrcXZla2hkandvZmxhdHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMDQ3NzgsImV4cCI6MjA2NTU4MDc3OH0.bxXr3ED7qSa7cg0jwv1v2yY5oWJAJQIU06638Ksc6Mg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeVendorIssue() {
  console.log('=== ANALYZING VENDOR ISSUE ===');
  
  // First, find the vendor IDs from properties
  const { data: properties, error: propError } = await supabase
    .from('properties')
    .select('vendor_id, title, id')
    .not('vendor_id', 'is', null);

  if (propError) {
    console.log('Error fetching vendor properties:', propError.message);
    return;
  }

  console.log(`Found ${properties.length} properties with vendor_id:`);
  const vendorIds = [...new Set(properties.map(p => p.vendor_id))];
  console.log('Unique vendor IDs:', vendorIds);

  // Now check if these vendor IDs exist in user_profiles
  for (const vendorId of vendorIds) {
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', vendorId);

    if (userError) {
      console.log(`Error fetching user profile for ${vendorId}:`, userError.message);
    } else if (userProfile.length === 0) {
      console.log(`❌ No user_profile found for vendor ID: ${vendorId}`);
    } else {
      const user = userProfile[0];
      console.log(`✅ Found user profile for ${vendorId}:`);
      console.log(`   - Name: ${user.full_name || 'No name'}`);
      console.log(`   - Email: ${user.email || 'No email'}`);
      console.log(`   - Role: ${user.role || 'No role'}`);
      console.log(`   - Status: ${user.status || 'No status'}`);
    }
  }

  // Also check all user profiles to see what roles exist
  const { data: allUsers, error: allUsersError } = await supabase
    .from('user_profiles')
    .select('id, full_name, email, role, status');

  if (allUsersError) {
    console.log('Error fetching all users:', allUsersError.message);
  } else {
    console.log(`\n=== ALL USER PROFILES (${allUsers.length} total) ===`);
    const roleStats = {};
    allUsers.forEach(user => {
      const role = user.role || 'null';
      roleStats[role] = (roleStats[role] || 0) + 1;
      if (vendorIds.includes(user.id)) {
        console.log(`🔍 VENDOR USER: ${user.id} - ${user.full_name} (${user.email}) - Role: ${role} - Status: ${user.status}`);
      }
    });
    
    console.log('\n=== ROLE STATISTICS ===');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`${role}: ${count} users`);
    });
  }

  // Check if vendor_applications table has any data
  const { data: applications, error: appError } = await supabase
    .from('vendor_applications')
    .select('*');

  if (appError) {
    console.log('Error fetching vendor applications:', appError.message);
  } else {
    console.log(`\n=== VENDOR APPLICATIONS TABLE ===`);
    console.log(`Found ${applications.length} applications`);
  }
}

analyzeVendorIssue().catch(console.error);
