const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTables() {
  console.log('🔍 Verifying missing tables have been created...\n');

  // Test user_messages table
  console.log('📋 Testing user_messages table...');
  try {
    const { data, error } = await supabase
      .from('user_messages')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ user_messages table error:', error.message);
    } else {
      console.log('✅ user_messages table exists and accessible');
      console.log(`📊 Current records: ${data.length}`);
    }
  } catch (err) {
    console.log('❌ user_messages table error:', err.message);
  }

  // Test user_bookmarks table
  console.log('\n📋 Testing user_bookmarks table...');
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ user_bookmarks table error:', error.message);
    } else {
      console.log('✅ user_bookmarks table exists and accessible');
      console.log(`📊 Current records: ${data.length}`);
    }
  } catch (err) {
    console.log('❌ user_bookmarks table error:', err.message);
  }

  // Test RLS policies by trying to insert (should fail without proper auth)
  console.log('\n📋 Testing RLS policies...');
  
  // Test user_messages RLS
  try {
    const { error } = await supabase
      .from('user_messages')
      .insert({
        sender_id: '00000000-0000-0000-0000-000000000000',
        recipient_id: '00000000-0000-0000-0000-000000000000',
        message: 'test',
        subject: 'test'
      });
    
    if (error && error.code === '42501') {
      console.log('✅ user_messages RLS is active (insert blocked as expected)');
    } else if (error) {
      console.log('⚠️  user_messages RLS test result:', error.message);
    } else {
      console.log('⚠️  user_messages RLS may not be active (insert succeeded)');
    }
  } catch (err) {
    console.log('⚠️  user_messages RLS test error:', err.message);
  }

  // Test user_bookmarks RLS
  try {
    const { error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000',
        item_type: 'property',
        item_id: '1'
      });
    
    if (error && error.code === '42501') {
      console.log('✅ user_bookmarks RLS is active (insert blocked as expected)');
    } else if (error) {
      console.log('⚠️  user_bookmarks RLS test result:', error.message);
    } else {
      console.log('⚠️  user_bookmarks RLS may not be active (insert succeeded)');
    }
  } catch (err) {
    console.log('⚠️  user_bookmarks RLS test error:', err.message);
  }

  console.log('\n✅ Table verification complete!');
}

verifyTables().catch(console.error);
