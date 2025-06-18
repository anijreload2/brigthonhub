// Add missing anonymous_sender column to contact_messages table
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAnonymousSenderColumn() {
  console.log('🔧 Adding missing anonymous_sender column...\n');

  try {
    const sql = `
      -- Add the missing anonymous_sender column
      ALTER TABLE contact_messages 
      ADD COLUMN IF NOT EXISTS anonymous_sender JSONB DEFAULT NULL;
      
      -- Add comment for the new column
      COMMENT ON COLUMN contact_messages.anonymous_sender IS 'Stores name, email, phone for non-authenticated senders';
      
      -- Add index for performance
      CREATE INDEX IF NOT EXISTS idx_contact_messages_anonymous_sender ON contact_messages USING GIN (anonymous_sender);
    `;

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.log('❌ Error adding column:', error.message);
      
      // Try alternative method - individual column add
      console.log('🔄 Trying alternative method...');
      
      const { error: altError } = await supabase
        .from('contact_messages')
        .select('anonymous_sender')
        .limit(1);
      
      if (altError && altError.message.includes('does not exist')) {
        console.log('❌ Column definitely missing. Please run the SQL manually:');
        console.log('\n📝 SQL to run in Supabase Dashboard > SQL Editor:');
        console.log('ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS anonymous_sender JSONB DEFAULT NULL;');
        console.log('\n📍 File: Database/ADD_ANONYMOUS_SENDER_COLUMN.sql');
      } else {
        console.log('✅ Column may already exist or be accessible');
      }
    } else {
      console.log('✅ Successfully added anonymous_sender column');
    }

    // Verify the column exists now
    console.log('\n🔍 Verifying column exists...');
    const { error: verifyError } = await supabase
      .from('contact_messages')
      .select('anonymous_sender')
      .limit(1);
    
    if (verifyError && verifyError.message.includes('does not exist')) {
      console.log('❌ Column still missing after attempt');
    } else {
      console.log('✅ Column is now accessible');
    }

  } catch (error) {
    console.error('❌ Script failed:', error.message);
  }
}

// Run the fix
addAnonymousSenderColumn().then(() => {
  console.log('\n🏁 Anonymous sender column fix completed');
}).catch(error => {
  console.error('💥 Script failed:', error);
});
