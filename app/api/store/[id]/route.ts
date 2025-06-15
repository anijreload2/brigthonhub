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
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Fetch product by ID
    const { data: product, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('id', id)
      .eq('isActive', true)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Fetch related products (same category)
    const { data: relatedProducts } = await supabase
      .from('store_products')
      .select('*')
      .eq('isActive', true)
      .eq('category', product.category)
      .neq('id', id)
      .limit(4);

    return NextResponse.json({
      product,
      relatedProducts: relatedProducts || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
