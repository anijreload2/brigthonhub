import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Food item ID is required' },
        { status: 400 }
      );
    }

    // Fetch food item by ID
    const { data: foodItem, error } = await supabase
      .from('food_items')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching food item:', error);
      return NextResponse.json(
        { error: 'Failed to fetch food item' },
        { status: 500 }
      );
    }

    if (!foodItem) {
      return NextResponse.json(
        { error: 'Food item not found' },
        { status: 404 }
      );
    }

    // Fetch related food items (same category or similar)
    const { data: relatedItems } = await supabase
      .from('food_items')
      .select('*')
      .eq('is_active', true)
      .neq('id', id)
      .limit(4);

    return NextResponse.json({
      foodItem,
      relatedItems: relatedItems || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
