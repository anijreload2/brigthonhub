import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    console.log('🔍 Blog API: Fetching post with slug:', slug);

    if (!slug) {
      console.log('❌ Blog API: No slug provided');
      return NextResponse.json(
        { error: 'Blog post slug is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Blog API: Attempting to fetch from blog_posts table...');
      // Fetch blog post by slug - using basic columns that should exist
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('❌ Blog API: Supabase error:', error);
      console.error('❌ Blog API: Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to fetch blog post', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Blog API: Query successful, post found:', !!post);

    if (!post) {
      console.log('❌ Blog API: Post not found for slug:', slug);
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }    // Fetch related posts (same category or tags)
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .neq('slug', slug)
      .limit(3);

    // Update view count
    await supabase
      .from('blog_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id);

    return NextResponse.json({
      post: { ...post, views: (post.views || 0) + 1 },
      relatedPosts: relatedPosts || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
