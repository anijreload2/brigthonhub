/*
 * Quick check of user_bookmarks table state
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkBookmarkTable() {
  try {
    console.log('🔍 Checking user_bookmarks table...');
    
    const { data, error, count } = await supabase
      .from('user_bookmarks')
      .select('*', { count: 'exact' });

    if (error) {
      console.error('❌ Table access error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
      return;
    }

    console.log(`📊 Total bookmarks in table: ${count}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Recent bookmarks:');
      data.forEach((bookmark, index) => {
        console.log(`${index + 1}. ${bookmark.item_type} - ${bookmark.title}`);
        console.log(`   User: ${bookmark.user_id}`);
        console.log(`   Created: ${bookmark.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️  No bookmarks found in table');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkBookmarkTable();
