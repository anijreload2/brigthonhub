const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBlogDatabase() {
  console.log('🔍 Testing blog database...');
  
  try {
    // Check if blog_posts table exists
    const { data: posts, error: postsError } = await supabase
      .from('blog_posts')
      .select('*')
      .limit(5);
      
    if (postsError) {
      console.error('❌ Error fetching blog posts:', postsError);
      
      // Check if table exists at all
      const { data: tables, error: tablesError } = await supabase.rpc('get_table_info', { table_name: 'blog_posts' });
      if (tablesError) {
        console.error('❌ Error checking table existence:', tablesError);
      }
    } else {
      console.log('✅ Blog posts table accessible');
      console.log(`📊 Found ${posts?.length || 0} blog posts`);
      if (posts && posts.length > 0) {
        console.log('📝 Sample post:', {
          id: posts[0].id,
          title: posts[0].title,
          slug: posts[0].slug,
          isActive: posts[0].isActive,
          isPublished: posts[0].isPublished
        });
      }
    }
    
    // Try to fetch the specific post
    const { data: specificPost, error: specificError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', 'lagos-real-estate-trends-2024')
      .single();
      
    if (specificError) {
      console.error('❌ Error fetching specific post:', specificError);
    } else {
      console.log('✅ Found specific post:', specificPost?.title);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testBlogDatabase();
