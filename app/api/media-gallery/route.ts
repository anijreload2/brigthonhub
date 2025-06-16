import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('media_gallery')
      .select('*')
      .eq('isActive', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media gallery:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data });
  } catch (error: any) {
    console.error('Error fetching media gallery:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Auto-populate uploadedById with a system user ID or current user
    // In a real app, you'd extract this from the JWT token or session
    const mediaData = {
      ...body,
      uploadedById: body.uploadedById || 'system-user', // Default to system user
      isActive: body.isActive !== undefined ? body.isActive : true
    };

    const { data, error } = await supabase
      .from('media_gallery')
      .insert([mediaData])
      .select()
      .single();

    if (error) {
      console.error('Error creating media file:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('media_gallery')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating media file:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ media: data });
  } catch (error: any) {
    console.error('Error updating media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('media_gallery')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting media file:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Media file deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting media file:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
