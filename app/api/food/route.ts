import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('Food API: Starting request');
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');
    const offset = parseInt(searchParams.get('offset') || '0');    const categoryId = searchParams.get('categoryId');
    
    const supabaseAdmin = getAdminClient();
    let query = supabaseAdmin
      .from('food_items')
      .select(`
        *,
        category:food_categories(*)
      `)
      .eq('isActive', true)
      .order('createdAt', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply category filter if provided
    if (categoryId) {
      query = query.eq('categoryId', categoryId);
    }

    console.log('Food API: Executing Supabase query');
    const { data: foodItems, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch food items', details: error.message },
        { status: 500 }
      );
    }

    console.log('Food API: Found', foodItems?.length || 0, 'food items');

    return NextResponse.json({
      foodItems: foodItems || [],
      count: foodItems?.length || 0
    });

  } catch (error) {
    console.error('Food API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch food items', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
