import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Store API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category_id = searchParams.get('category_id');      let query = supabase
      .from('store_products')
      .select(`
        *,
        store_categories(*)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);    // Apply category filter if provided
    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    console.log('Store API: Executing Supabase query');
    const { data: products, error } = await query;

    if (error) {
      console.error('Store API: Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch store products', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Store API: Retrieved ${products?.length || 0} products`);
    return NextResponse.json({
      products: products || [],
      total: products?.length || 0
    });

  } catch (error) {
    console.error('Store API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
