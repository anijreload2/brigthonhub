import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { notifyVendorOfNewMessage } from '@/lib/email-notifications';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    
    const body = await request.json();
    const {
      name,
      email,
      phone,
      subject,
      message,
      contentType,
      contentId,
      recipientId,
      metadata
    } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Map content types to database types
    const itemTypeMap: Record<string, string> = {
      property: 'property',
      project: 'project',
      food_item: 'food',
      store_product: 'store',
      general: 'general'
    };

    const itemType = itemTypeMap[contentType] || 'general';

    let senderId = null;
    
    // If user is authenticated, use their ID as sender
    if (authUser) {
      senderId = authUser.id;
    } else {
      // For non-authenticated users, we need to create a guest record or handle differently
      // For now, we'll allow messages without a user account
      senderId = null;
    }    // Prepare the contact message data
    const contactMessageData = {
      sender_id: senderId,
      recipient_id: recipientId || null,
      sender_name: name,
      sender_email: email,
      sender_phone: phone || null,
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread',
      content_type: itemType,
      content_id: contentId || null
    };

    // Insert the contact message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(contactMessageData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // If we have a recipient and content, try to fetch additional context
    let itemContext = null;
    if (recipientId && contentId && itemType !== 'general') {
      try {
        const tableMap: Record<string, string> = {
          property: 'properties',
          food: 'food_items',
          store: 'store_products',
          project: 'projects'
        };
        
        const tableName = tableMap[itemType];
        if (tableName) {
          const { data: itemData } = await supabase
            .from(tableName)
            .select('id, title, name, price, location')
            .eq('id', contentId)
            .single();
          
          if (itemData) {
            itemContext = itemData;
          }
        }
      } catch (error) {        console.error('Error fetching item context:', error);
        // Continue without context
      }
    }

    // Send email notification to recipient if we have their details
    if (recipientId) {
      try {
        // Fetch recipient details
        const { data: recipientData } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', recipientId)
          .single();

        if (recipientData && recipientData.email) {
          const contentTitle = itemContext?.title || itemContext?.name || `${itemType} item`;
          
          // Send email notification (non-blocking)
          notifyVendorOfNewMessage(
            recipientData.email,
            recipientData.name || 'Vendor',
            name,
            email,
            subject,
            message,
            itemType,
            contentTitle
          ).catch(error => {
            console.error('Failed to send email notification:', error);
            // Don't fail the API call if email fails
          });
        }
      } catch (error) {
        console.error('Error fetching recipient details for notification:', error);
        // Continue without notification
      }
    }

    return NextResponse.json({
      success: true,
      messageId: data.id,
      itemContext,
      message: 'Message sent successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const itemType = searchParams.get('itemType');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');    // Build query
    let query = supabase
      .from('contact_messages')
      .select(`
        *,
        sender:users!contact_messages_sender_id_fkey(name, email, phone),
        recipient:users!contact_messages_recipient_id_fkey(name, email, phone)
      `)
      .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (itemType && itemType !== 'all') {
      query = query.eq('content_type', itemType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      messages: data || [],
      hasMore: (data?.length || 0) === limit
    });

  } catch (error) {
    console.error('API error:', error);    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, messageId } = body;

    // Validate required fields
    if (!messageId) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      );
    }

    if (!status || !['read', 'unread', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required (read, unread, archived)' },
        { status: 400 }
      );
    }

    // Update the message status, but only if the user is the recipient
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', messageId)
      .eq('recipient_id', authUser.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update message status' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Message not found or unauthorized' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: data,
      status: data.status
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
