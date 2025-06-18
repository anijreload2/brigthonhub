import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');
    const messageType = url.searchParams.get('message_type');
    const isRead = url.searchParams.get('is_read');
    
    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, email),
        recipient:users!recipient_id(id, name, email)
      `)
      .order('created_at', { ascending: false });

    // Filter by user (either sender or recipient)
    if (userId) {
      query = query.or(`sender_id.eq.${userId},recipient_id.eq.${userId}`);
    }

    // Filter by message type
    if (messageType) {
      query = query.eq('message_type', messageType);
    }

    // Filter by read status
    if (isRead !== null && isRead !== undefined) {
      query = query.eq('is_read', isRead === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching messages:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages: data }, { status: 200 });

  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sender_id,
      recipient_id,
      subject,
      content,
      message_type = 'direct',
      thread_id,
      parent_id
    } = body;

    // Validate required fields
    if (!sender_id || !recipient_id || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: sender_id, recipient_id, content' },
        { status: 400 }
      );
    }

    // Verify users exist
    const { data: sender } = await supabase
      .from('users')
      .select('id')
      .eq('id', sender_id)
      .single();

    const { data: recipient } = await supabase
      .from('users')
      .select('id')
      .eq('id', recipient_id)
      .single();

    if (!sender || !recipient) {
      return NextResponse.json(
        { error: 'Invalid sender_id or recipient_id' },
        { status: 400 }
      );
    }

    // Create message
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id,
        recipient_id,
        subject,
        content,
        message_type,
        thread_id,
        parent_id,
        is_read: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select(`
        *,
        sender:users!sender_id(id, name, email),
        recipient:users!recipient_id(id, name, email)
      `)
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: data }, { status: 201 });

  } catch (error) {
    console.error('Messages POST API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { message_id, is_read, read_at } = body;

    if (!message_id) {
      return NextResponse.json(
        { error: 'Missing required field: message_id' },
        { status: 400 }
      );
    }

    // Update message read status
    const { data, error } = await supabase
      .from('messages')
      .update({
        is_read: is_read ?? true,
        read_at: read_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', message_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: data }, { status: 200 });

  } catch (error) {
    console.error('Messages PATCH API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
