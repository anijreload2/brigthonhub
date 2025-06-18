import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const status = searchParams.get('status') || 'published';
    const category_id = searchParams.get('category_id');
    const author_id = searchParams.get('author_id');
    const search = searchParams.get('search');
    
    let query = supabase
      .from('blogs')
      .select(`
        id,
        title,
        content,
        excerpt,
        author_id,
        category_id,
        status,
        published_at,
        featured_image,
        tags,
        meta_title,
        meta_description,
        slug,
        views_count,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    
    if (author_id) {
      query = query.eq('author_id', author_id);
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data: blogs, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch blogs', details: error.message },
        { status: 500 }
      );
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('blogs')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (category_id) countQuery = countQuery.eq('category_id', category_id);
    if (author_id) countQuery = countQuery.eq('author_id', author_id);
    if (search) {
      countQuery = countQuery.or(`title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { count } = await countQuery;

    return NextResponse.json({
      data: blogs || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const { title, content, slug } = body;
    
    if (!title || !content || !slug) {
      return NextResponse.json(
        { error: 'Title, content, and slug are required' },
        { status: 400 }
      );
    }

    // Prepare blog data
    const blogData = {
      title: title.trim(),
      content,
      excerpt: body.excerpt?.trim() || content.substring(0, 200) + '...',
      author_id: user.id,
      category_id: body.category_id || null,
      status: body.status || 'draft',
      published_at: body.status === 'published' ? new Date().toISOString() : null,
      featured_image: body.featured_image || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      meta_title: body.meta_title?.trim() || title.trim(),
      meta_description: body.meta_description?.trim() || body.excerpt?.trim() || content.substring(0, 160),
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
      views_count: 0,
      is_active: true
    };

    const { data: blog, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A blog with this slug already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create blog', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blog }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const blogId = searchParams.get('id');
    
    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Check if user owns the blog or is admin
    const { data: existingBlog, error: fetchError } = await supabase
      .from('blogs')
      .select('author_id')
      .eq('id', blogId)
      .single();
    
    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }
    
    if (existingBlog.author_id !== user.id) {
      return NextResponse.json(
        { error: 'Permission denied' },
        { status: 403 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (body.title) updateData.title = body.title.trim();
    if (body.content !== undefined) updateData.content = body.content;
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt?.trim();
    if (body.category_id !== undefined) updateData.category_id = body.category_id;    if (body.status !== undefined) {
      updateData.status = body.status;
      if (body.status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }
    if (body.featured_image !== undefined) updateData.featured_image = body.featured_image;
    if (body.tags !== undefined) updateData.tags = Array.isArray(body.tags) ? body.tags : [];
    if (body.meta_title !== undefined) updateData.meta_title = body.meta_title?.trim();
    if (body.meta_description !== undefined) updateData.meta_description = body.meta_description?.trim();
    if (body.slug !== undefined) {
      updateData.slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

    const { data: blog, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', blogId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A blog with this slug already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update blog', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: blog });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
