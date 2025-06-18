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
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Fetch property by ID
    const { data: property, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      return NextResponse.json(
        { error: 'Failed to fetch property' },
        { status: 500 }
      );
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Fetch related properties (same type and location)
    const { data: relatedProperties } = await supabase
      .from('properties')
      .select('*')
      .eq('is_active', true)
      .eq('property_type', property.property_type)
      .neq('id', id)
      .limit(4);

    return NextResponse.json({
      property,
      relatedProperties: relatedProperties || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
