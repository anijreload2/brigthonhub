import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get user from authorization header
async function getUserFromAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

// GET /api/bookmarks - Get user's bookmarked items
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const itemType = url.searchParams.get('type'); // Filter by type if specified

    let query = supabase
      .from('user_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by item type if specified
    if (itemType) {
      query = query.eq('item_type', itemType);
    }

    const { data: bookmarks, error } = await query;

    if (error) {
      console.error('Bookmarks fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
    }

    // Enrich bookmarks with actual item data based on type
    const enrichedBookmarks = await Promise.all(
      bookmarks.map(async (bookmark) => {
        let itemData = null;
        
        try {
          switch (bookmark.item_type) {
            case 'property':
              const { data: property } = await supabase
                .from('properties')
                .select('id, title, price, location, image_url')
                .eq('id', bookmark.item_id)
                .single();
              itemData = property;
              break;
              
            case 'vendor':
              const { data: vendor } = await supabase
                .from('vendor_listings')
                .select('id, business_name, category, location, logo_url')
                .eq('id', bookmark.item_id)
                .single();
              itemData = vendor;
              break;
                case 'project':
              const { data: project } = await supabase
                .from('projects')
                .select('id, title, description, image_url, status')
                .eq('id', bookmark.item_id)
                .single();
              itemData = project;
              break;
                case 'blog':
              const { data: blog } = await supabase
                .from('blog_posts')
                .select('id, title, excerpt, featured_image, published_at')
                .eq('id', bookmark.item_id)
                .single();
              itemData = blog;
              break;
              
            case 'food':
              const { data: food } = await supabase
                .from('food_items')
                .select('id, name, description, images, price, unit')
                .eq('id', bookmark.item_id)
                .single();
              itemData = food;
              break;
              
            case 'store':
              const { data: storeItem } = await supabase
                .from('store_products')
                .select('id, name, description, images, price, brand')
                .eq('id', bookmark.item_id)
                .single();
              itemData = storeItem;
              break;
              
            default:
              // For unknown types, just return the bookmark as-is
              break;
          }
        } catch (itemError) {
          console.warn(`Failed to fetch ${bookmark.item_type} data for bookmark ${bookmark.id}:`, itemError);
        }

        return {
          ...bookmark,
          item_data: itemData
        };
      })
    );    return NextResponse.json({ bookmarks: enrichedBookmarks }, { status: 200 });

  } catch (error) {
    console.error('Bookmarks API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/bookmarks - Add a new bookmark
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { item_id, item_type, title } = body;

    // Validate required fields
    if (!item_id || !item_type) {
      return NextResponse.json(
        { error: 'Missing required fields: item_id, item_type' },
        { status: 400 }
      );
    }

    // Validate item_type
    const validTypes = ['property', 'vendor', 'project', 'blog', 'testimonial', 'food', 'store'];
    if (!validTypes.includes(item_type)) {
      return NextResponse.json(
        { error: `Invalid item_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const { data: existing } = await supabase
      .from('user_bookmarks')
      .select('id')
      .eq('user_id', user.id)
      .eq('item_id', item_id)
      .eq('item_type', item_type)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Item is already bookmarked' },
        { status: 409 }
      );
    }

    // Create the bookmark
    const { data: bookmark, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: user.id,
        item_id,
        item_type,
        title: title || `${item_type} ${item_id}`
      })
      .select()
      .single();

    if (error) {
      console.error('Bookmark creation error:', error);
      return NextResponse.json({ error: 'Failed to create bookmark' }, { status: 500 });
    }

    return NextResponse.json({ 
      bookmark,
      message: 'Bookmark created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Bookmark creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/bookmarks - Remove bookmark(s)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const bookmarkId = url.searchParams.get('id');
    const itemId = url.searchParams.get('item_id');
    const itemType = url.searchParams.get('item_type');

    // Option 1: Delete by bookmark ID
    if (bookmarkId) {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', user.id); // Ensure user can only delete their own bookmarks

      if (error) {
        console.error('Bookmark deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Bookmark deleted successfully' }, { status: 200 });
    }

    // Option 2: Delete by item_id and item_type
    if (itemId && itemType) {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('item_id', itemId)
        .eq('item_type', itemType);

      if (error) {
        console.error('Bookmark deletion error:', error);
        return NextResponse.json({ error: 'Failed to delete bookmark' }, { status: 500 });
      }

      return NextResponse.json({ message: 'Bookmark deleted successfully' }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'Must provide either bookmark id or both item_id and item_type' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Bookmark deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
