import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Blog API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category_id = searchParams.get('category_id');    let query = supabase
      .from('blogs')
      .select(`
        *,
        categories(*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);    // Apply category filter if provided
    if (category_id) {
      query = query.eq('category_id', category_id);
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

export async function POST(request: NextRequest) {
  try {
    console.log('Blog API POST: Starting request');
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content, slug' },
        { status: 400 }
      );
    }

    // Insert new blog post
    const { data: blog, error } = await supabase
      .from('blogs')
      .insert({
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        author_id: body.author_id,
        category_id: body.category_id,
        status: body.status || 'draft',
        published_at: body.status === 'published' ? new Date().toISOString() : null,
        featured_image: body.featured_image,
        tags: body.tags || [],
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        slug: body.slug,
        is_active: body.is_active !== undefined ? body.is_active : true
      })
      .select()
      .single();

    if (error) {
      console.error('Blog API POST: Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create blog post', details: error.message },
        { status: 500 }
      );
    }

    console.log('Blog API POST: Created blog post:', blog.id);
    return NextResponse.json({ blog }, { status: 201 });

  } catch (error) {
    console.error('Blog API POST: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
