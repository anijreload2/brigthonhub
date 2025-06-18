import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parent_id = searchParams.get('parent_id');
    const include_children = searchParams.get('include_children') === 'true';
    
    let query = supabase
      .from('categories')
      .select(`
        id,
        name,
        description,
        type,
        slug,
        parent_id,
        sort_order,
        is_active,
        created_at,
        updated_at
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    // Filter by type if provided
    if (type) {
      query = query.eq('type', type);
    }

    // Filter by parent_id if provided
    if (parent_id !== null) {
      if (parent_id) {
        query = query.eq('parent_id', parent_id);
      } else {
        query = query.is('parent_id', null);
      }
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    // If include_children is true, fetch children for each category
    if (include_children && categories) {
      for (const category of categories) {
        const { data: children } = await supabase
          .from('categories')
          .select('*')
          .eq('parent_id', category.id)
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .order('name', { ascending: true });
        
        (category as any).children = children || [];
      }
    }

    return NextResponse.json({
      data: categories || [],
      count: categories?.length || 0
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
    const { name, type, slug } = body;
    
    if (!name || !type || !slug) {
      return NextResponse.json(
        { error: 'Name, type, and slug are required' },
        { status: 400 }
      );
    }

    // Validate type
    const validTypes = ['project', 'property', 'food', 'blog'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Type must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare category data
    const categoryData = {
      name: name.trim(),
      description: body.description?.trim() || null,
      type,
      slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-'),
      parent_id: body.parent_id || null,
      sort_order: body.sort_order || 0,
      is_active: true
    };

    // Validate parent_id if provided
    if (categoryData.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from('categories')
        .select('id, type')
        .eq('id', categoryData.parent_id)
        .single();
      
      if (parentError || !parent) {
        return NextResponse.json(
          { error: 'Invalid parent category' },
          { status: 400 }
        );
      }
      
      if (parent.type !== type) {
        return NextResponse.json(
          { error: 'Parent category must have the same type' },
          { status: 400 }
        );
      }
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: category }, { status: 201 });

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
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Check if category exists
    const { data: existingCategory, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single();
    
    if (fetchError) {
      console.error('Database error:', fetchError);
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update provided fields
    if (body.name) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.slug) {
      updateData.slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }
    if (body.parent_id !== undefined) {
      updateData.parent_id = body.parent_id;
      
      // Validate parent_id if provided
      if (body.parent_id) {
        const { data: parent, error: parentError } = await supabase
          .from('categories')
          .select('id, type')
          .eq('id', body.parent_id)
          .single();
        
        if (parentError || !parent) {
          return NextResponse.json(
            { error: 'Invalid parent category' },
            { status: 400 }
          );
        }
        
        if (parent.type !== existingCategory.type) {
          return NextResponse.json(
            { error: 'Parent category must have the same type' },
            { status: 400 }
          );
        }

        // Prevent circular reference
        if (body.parent_id === categoryId) {
          return NextResponse.json(
            { error: 'Category cannot be its own parent' },
            { status: 400 }
          );
        }
      }
    }
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order;
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

    const { data: category, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      if (error.code === '23505') { // Unique violation
        return NextResponse.json(
          { error: 'A category with this slug already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to update category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: category });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
    const categoryId = searchParams.get('id');
    
    if (!categoryId) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Check if category has children
    const { data: children, error: childrenError } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', categoryId)
      .eq('is_active', true);
    
    if (childrenError) {
      console.error('Database error:', childrenError);
      return NextResponse.json(
        { error: 'Failed to check category children' },
        { status: 500 }
      );
    }

    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with active children. Delete or move children first.' },
        { status: 409 }
      );
    }

    // Soft delete by setting is_active to false
    const { data: category, error } = await supabase
      .from('categories')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete category', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Category deleted successfully',
      data: category 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
