import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Properties API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');    const category_id = searchParams.get('category_id');
    const propertyType = searchParams.get('propertyType');
    const listingType = searchParams.get('listingType');
    console.log('Properties API: Limit set to', limit, 'offset:', offset);
      let query = supabase
      .from('properties')
      .select(`
        *,
        category:property_categories(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);    // Apply filters
    if (category_id) {
      query = query.eq('category_id', category_id);
    }
    if (propertyType) {
      query = query.eq('property_type', propertyType);
    }
    if (listingType) {
      query = query.eq('listing_type', listingType);
    }

    console.log('Properties API: Executing Supabase query');
    const { data: properties, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch properties', details: error.message },
        { status: 500 }
      );
    }

    console.log('Properties API: Found', properties?.length || 0, 'properties');

    return NextResponse.json({ 
      properties: properties || [],
      count: properties?.length || 0
    });

  } catch (error) {
    console.error('Properties API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch properties', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
