import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch vendor listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('vendor_listings')
      .select(`
        *,
        vendor:users!vendor_listings_vendor_id_fkey (
          id,
          name,
          email,
          avatar_url
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (vendorId) {
      query = query.eq('vendor_id', vendorId);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor listings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch listings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      listings: data || [],
      total: count || 0,
      hasMore: (data?.length || 0) === limit
    });

  } catch (error) {
    console.error('Error in GET /api/vendor-listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new vendor listing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vendor_id,
      category,
      title,
      description,
      price,
      currency = 'NGN',
      location,
      contact_info = {},
      images = [],
      specifications = {},
      featured = false
    } = body;

    // Validate required fields
    if (!vendor_id || !category || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: vendor_id, category, title, description' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['property', 'food', 'marketplace', 'projects'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: property, food, marketplace, projects' },
        { status: 400 }
      );
    }

    // Check if vendor exists and is approved for this category
    const { data: vendorApplications, error: vendorError } = await supabase
      .from('vendor_applications')
      .select('categories, status')
      .eq('user_id', vendor_id)
      .eq('status', 'approved');

    if (vendorError) {
      console.error('Error checking vendor status:', vendorError);
      return NextResponse.json(
        { error: 'Failed to verify vendor status' },
        { status: 500 }
      );
    }

    const approvedCategories = vendorApplications
      ?.flatMap(app => app.categories) || [];

    if (!approvedCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Vendor not approved for this category' },
        { status: 403 }
      );
    }

    // Create the listing
    const { data: listing, error: createError } = await supabase
      .from('vendor_listings')
      .insert({
        vendor_id,
        category,
        title,
        description,
        price: price ? parseFloat(price) : null,
        currency,
        location,
        contact_info,
        images,
        specifications,
        featured,
        status: 'active'
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating listing:', createError);
      return NextResponse.json(
        { error: 'Failed to create listing' },
        { status: 500 }
      );
    }

    // Update vendor analytics
    const today = new Date().toISOString().split('T')[0];
    await supabase
      .from('vendor_analytics')
      .upsert({
        vendor_id,
        date: today,
        listings_created: 1
      }, {
        onConflict: 'vendor_id,date',
        ignoreDuplicates: false
      });

    return NextResponse.json({ listing }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/vendor-listings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
