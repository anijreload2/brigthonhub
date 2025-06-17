import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: listing, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching listing:', error);
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await supabase
      .from('vendor_listings')
      .update({ view_count: (listing.view_count || 0) + 1 })
      .eq('id', params.id);

    return NextResponse.json({ listing });

  } catch (error) {
    console.error('Error in GET /api/vendor-listings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update listing
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      vendor_id,
      category,
      title,
      description,
      price,
      currency,
      location,
      contact_info,
      images,
      specifications,
      status,
      featured
    } = body;

    // Verify ownership
    const { data: existingListing, error: fetchError } = await supabase
      .from('vendor_listings')
      .select('vendor_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.vendor_id !== vendor_id) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only update your own listings' },
        { status: 403 }
      );
    }

    // Update the listing
    const { data: listing, error: updateError } = await supabase
      .from('vendor_listings')
      .update({
        category,
        title,
        description,
        price: price ? parseFloat(price) : null,
        currency,
        location,
        contact_info,
        images,
        specifications,
        status,
        featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating listing:', updateError);
      return NextResponse.json(
        { error: 'Failed to update listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing });

  } catch (error) {
    console.error('Error in PUT /api/vendor-listings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete listing
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const vendorId = searchParams.get('vendor_id');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Missing vendor_id parameter' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: existingListing, error: fetchError } = await supabase
      .from('vendor_listings')
      .select('vendor_id')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingListing) {
      return NextResponse.json(
        { error: 'Listing not found' },
        { status: 404 }
      );
    }

    if (existingListing.vendor_id !== vendorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own listings' },
        { status: 403 }
      );
    }

    // Delete the listing
    const { error: deleteError } = await supabase
      .from('vendor_listings')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Error deleting listing:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete listing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in DELETE /api/vendor-listings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
