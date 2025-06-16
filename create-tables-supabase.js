const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTables() {
  console.log('🚀 Creating missing database tables...');

  // Create user_bookmarks table
  console.log('\n🔄 Creating user_bookmarks table...');
  try {
    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ user_bookmarks table does not exist. Creating it...');
      
      // Since we can't create tables directly via PostgREST, we'll use a different approach
      // We need to create this table via SQL console or migration
      console.log('⚠️ Please create the user_bookmarks table via Supabase dashboard SQL editor:');
      console.log(`
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('property', 'food', 'store', 'project', 'blog')),
  item_id TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

-- Enable RLS
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own bookmarks"
  ON user_bookmarks FOR ALL
  USING (auth.uid()::text = user_id);

-- Create indexes
CREATE INDEX idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX idx_user_bookmarks_type_id ON user_bookmarks(item_type, item_id);
CREATE INDEX idx_user_bookmarks_created_at ON user_bookmarks(created_at DESC);
      `);
    } else if (error) {
      console.log('❌ Error checking user_bookmarks:', error);
    } else {
      console.log('✅ user_bookmarks table already exists');
    }
  } catch (err) {
    console.log('❌ Error with user_bookmarks:', err.message);
  }

  // Create user_messages table
  console.log('\n🔄 Creating user_messages table...');
  try {
    const { data, error } = await supabase
      .from('user_messages')
      .select('*')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ user_messages table does not exist. Creating it...');
      
      console.log('⚠️ Please create the user_messages table via Supabase dashboard SQL editor:');
      console.log(`
CREATE TABLE IF NOT EXISTS user_messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  thread_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject TEXT,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view messages they sent or received"
  ON user_messages FOR SELECT
  USING (auth.uid()::text = sender_id OR auth.uid()::text = recipient_id);

CREATE POLICY "Users can send messages"
  ON user_messages FOR INSERT
  WITH CHECK (auth.uid()::text = sender_id);

CREATE POLICY "Users can update messages they sent or received"
  ON user_messages FOR UPDATE
  USING (auth.uid()::text = sender_id OR auth.uid()::text = recipient_id);

-- Create indexes
CREATE INDEX idx_user_messages_sender ON user_messages(sender_id);
CREATE INDEX idx_user_messages_recipient ON user_messages(recipient_id);
CREATE INDEX idx_user_messages_thread ON user_messages(thread_id);
CREATE INDEX idx_user_messages_created_at ON user_messages(created_at DESC);
CREATE INDEX idx_user_messages_unread ON user_messages(recipient_id, is_read) WHERE is_read = FALSE;
      `);
    } else if (error) {
      console.log('❌ Error checking user_messages:', error);
    } else {
      console.log('✅ user_messages table already exists');
    }
  } catch (err) {
    console.log('❌ Error with user_messages:', err.message);
  }

  console.log('\n📋 Summary:');
  console.log('- Tables cannot be created directly via PostgREST API');
  console.log('- Please run the SQL commands above in Supabase Dashboard → SQL Editor');
  console.log('- This will create the missing tables with proper RLS policies');
}

createTables().catch(console.error);
