import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../lib/supabase';

export async function GET() {
  try {
    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('ai_training_data')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching AI training data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trainingData: data || [] });
  } catch (error: any) {
    console.error('Error fetching AI training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const trainingDataItem = {
      id: crypto.randomUUID(),
      category: body.category || 'general',
      question: body.question,
      answer: body.answer,
      language: body.language || 'en',
      is_active: body.is_active !== false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('ai_training_data')
      .insert([trainingDataItem])
      .select()
      .single();

    if (error) {
      console.error('Error creating AI training data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trainingData: data }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating AI training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updatedItem = {
      ...updateData,
      updated_at: new Date().toISOString()
    };    const adminClient = getAdminClient();
    const { data, error } = await adminClient
      .from('ai_training_data')
      .update(updatedItem)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating AI training data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ trainingData: data });
  } catch (error: any) {
    console.error('Error updating AI training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }    const adminClient = getAdminClient();
    const { error } = await adminClient
      .from('ai_training_data')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting AI training data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'AI training data deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting AI training data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
