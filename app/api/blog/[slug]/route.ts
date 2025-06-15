import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Blog post slug is required' },
        { status: 400 }
      );
    }

    // Fetch blog post by slug
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('isActive', true)
      .eq('isPublished', true)
      .single();

    if (error) {
      console.error('Error fetching blog post:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog post' },
        { status: 500 }
      );
    }

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Fetch related posts (same category or tags)
    const { data: relatedPosts } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('isActive', true)
      .eq('isPublished', true)
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
