import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Blog API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    const categoryId = searchParams.get('categoryId');      let query = supabase
      .from('blog_posts')
      .select(`
        *,
        blog_categories(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply category filter if provided
    if (categoryId) {
      query = query.eq('categoryId', categoryId);
    }

    console.log('Blog API: Executing Supabase query');
    const { data: posts, error } = await query;

    if (error) {
      console.error('Blog API: Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blog posts', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Blog API: Retrieved ${posts?.length || 0} posts`);
    return NextResponse.json({
      posts: posts || [],
      total: posts?.length || 0
    });

  } catch (error) {
    console.error('Blog API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
