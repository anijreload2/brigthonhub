import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      recipientId,
      subject,
      message,
      conversationId,
      parentMessageId
    } = body;

    // Validate required fields
    if (!recipientId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user details
    const { data: senderData, error: senderError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (senderError || !senderData) {
      return NextResponse.json(
        { error: 'Sender not found' },
        { status: 404 }
      );
    }

    // Get recipient details
    const { data: recipientData, error: recipientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', recipientId)
      .single();

    if (recipientError || !recipientData) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      );
    }

    // Verify sender is admin or vendor
    if (!['ADMIN', 'VENDOR'].includes(senderData.role)) {
      return NextResponse.json(
        { error: 'Only admins and vendors can send internal messages' },
        { status: 403 }
      );
    }

    // Verify recipient is admin or vendor
    if (!['ADMIN', 'VENDOR'].includes(recipientData.role)) {
      return NextResponse.json(
        { error: 'Can only send internal messages to admins and vendors' },
        { status: 403 }
      );
    }

    // Generate or use conversation ID
    let finalConversationId = conversationId;
    if (!finalConversationId) {
      // Generate conversation ID using SQL function
      const { data: convData, error: convError } = await supabase
        .rpc('generate_conversation_id', {
          sender_id: authUser.id,
          recipient_id: recipientId
        });

      if (convError) {
        console.error('Error generating conversation ID:', convError);
        // Fallback to manual generation
        const ids = [authUser.id, recipientId].sort();
        finalConversationId = `conv_${ids[0]}_${ids[1]}`;
      } else {
        finalConversationId = convData;
      }
    }

    // Create the internal message
    const messageData = {
      sender_id: authUser.id,
      recipient_id: recipientId,
      sender_name: senderData.name || senderData.email,
      sender_email: senderData.email,
      sender_phone: senderData.phone || '',
      subject: subject,
      message: message,
      message_type: 'internal',
      conversation_id: finalConversationId,
      parent_message_id: parentMessageId || null,
      is_internal: true,
      is_read: false,
      item_type: 'internal',
      item_id: null,
      created_at: new Date().toISOString()
    };

    const { data: newMessage, error: messageError } = await supabase
      .from('contact_messages')
      .insert(messageData)
      .select()
      .single();

    if (messageError) {
      console.error('Error creating internal message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Internal message sent successfully',
      data: newMessage
    });

  } catch (error) {
    console.error('Internal messaging error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get user details to verify role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single();

    if (userError || !userData || !['ADMIN', 'VENDOR'].includes(userData.role)) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (conversationId) {
      // Get messages for specific conversation
      const { data: messages, error: messagesError } = await supabase
        .from('contact_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('is_internal', true)
        .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (messagesError) {
        return NextResponse.json(
          { error: 'Failed to fetch messages' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data: messages,
        pagination: {
          page,
          limit,
          total: messages.length
        }
      });

    } else {
      // Get all conversations for the user
      const { data: conversations, error: conversationsError } = await supabase
        .from('message_conversations')
        .select('*')
        .eq('is_internal_conversation', true)
        .or(`user1_id.eq.${authUser.id},user2_id.eq.${authUser.id}`)
        .order('last_message_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (conversationsError) {
        return NextResponse.json(
          { error: 'Failed to fetch conversations' },
          { status: 500 }
        );
      }

      // Enrich conversations with user details
      const enrichedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherUserId = conv.user1_id === authUser.id ? conv.user2_id : conv.user1_id;
          
          const { data: otherUser } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', otherUserId)
            .single();

          return {
            ...conv,
            other_user: otherUser
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: enrichedConversations,
        pagination: {
          page,
          limit,
          total: conversations.length
        }
      });
    }

  } catch (error) {
    console.error('Internal messaging fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
