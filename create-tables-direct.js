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
  const { error: bookmarksError } = await supabase.rpc('sql', {
    query: `
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_type TEXT NOT NULL CHECK (item_type IN ('property', 'food', 'store', 'project', 'blog')),
        item_id TEXT NOT NULL,
        title TEXT,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, item_type, item_id)
      );

      -- Enable RLS
      ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can manage their own bookmarks" ON user_bookmarks
        FOR ALL USING (auth.uid()::text = user_id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_bookmarks_type_id ON user_bookmarks(item_type, item_id);
    `
  });

  if (bookmarksError) {
    console.log('❌ Error creating user_bookmarks:', bookmarksError);
  } else {
    console.log('✅ user_bookmarks table created successfully');
  }

  // Create user_messages table
  console.log('\n🔄 Creating user_messages table...');
  const { error: messagesError } = await supabase.rpc('sql', {
    query: `
      CREATE TABLE IF NOT EXISTS user_messages (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        thread_id TEXT NOT NULL,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subject TEXT,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Enable RLS
      ALTER TABLE user_messages ENABLE ROW LEVEL SECURITY;

      -- Create policies
      CREATE POLICY "Users can view messages they sent or received" ON user_messages
        FOR SELECT USING (auth.uid()::text = sender_id OR auth.uid()::text = recipient_id);

      CREATE POLICY "Users can send messages" ON user_messages
        FOR INSERT WITH CHECK (auth.uid()::text = sender_id);

      CREATE POLICY "Users can update messages they sent or received" ON user_messages
        FOR UPDATE USING (auth.uid()::text = sender_id OR auth.uid()::text = recipient_id);

      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_user_messages_thread_id ON user_messages(thread_id);
      CREATE INDEX IF NOT EXISTS idx_user_messages_sender_id ON user_messages(sender_id);
      CREATE INDEX IF NOT EXISTS idx_user_messages_recipient_id ON user_messages(recipient_id);
      CREATE INDEX IF NOT EXISTS idx_user_messages_created_at ON user_messages(created_at);
    `
  });

  if (messagesError) {
    console.log('❌ Error creating user_messages:', messagesError);
  } else {
    console.log('✅ user_messages table created successfully');
  }

  console.log('\n📊 Table creation complete!');
}

createTables().catch(console.error);
