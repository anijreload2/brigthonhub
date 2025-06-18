import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { notifyVendorOfNewMessage } from '@/lib/email-notifications';

// Enhanced API for Unified Messaging System
// Extends existing contact-messages functionality

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authUser = getAuthUser(request);
    
    const body = await request.json();
    const {
      // Existing fields
      name,
      email,
      phone,
      subject,
      message,
      contentType,
      contentId,
      recipientId,
      metadata,
      // New unified messaging fields
      threadId,
      replyTo,
      messageType,
      priority = 'normal',
      tags = [],
      attachments = [],
      recipients = [] // For bulk messaging
    } = body;

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    // For anonymous users, require name and email
    if (!authUser && (!name || !email)) {
      return NextResponse.json(
        { error: 'Name and email are required for anonymous users' },
        { status: 400 }
      );
    }

    // Validate email format for anonymous users
    if (!authUser && email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
    }

    // Map content types to database types (maintain backward compatibility)
    const contentTypeMap: Record<string, string> = {
      property: 'property',
      project: 'project',
      food_item: 'food_item',
      store_product: 'store_product',
      blog_post: 'blog_post',
      general: 'general'
    };

    const mappedContentType = contentTypeMap[contentType] || 'general';

    // Determine message type
    let finalMessageType = messageType || 'direct_message';
    if (mappedContentType !== 'general' && contentId) {
      finalMessageType = 'product_inquiry';
    }
    if (subject.toLowerCase().includes('contact form')) {
      finalMessageType = 'contact_form';
    }

    // Handle bulk messaging (admin only)
    if (finalMessageType === 'bulk_message' || recipients.length > 0) {
      if (!authUser || authUser.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Bulk messaging requires admin privileges' },
          { status: 403 }
        );
      }
      return handleBulkMessage(authUser, body);
    }

    // Prepare sender information
    let senderName = name;
    let senderEmail = email;
    let senderId = null;

    if (authUser) {
      senderId = authUser.id;
      senderName = authUser.name || name || senderEmail;
      senderEmail = authUser.email || email;
    }

    // Prepare the message data
    const messageData = {
      sender_id: senderId,
      recipient_id: recipientId || null,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: phone || null,
      subject: subject.trim(),
      message: message.trim(),
      content_type: mappedContentType,
      content_id: contentId || null,
      thread_id: threadId || null, // Will be auto-generated if null
      reply_to: replyTo || null,
      message_type: finalMessageType,
      priority,
      tags,
      attachments,
      status: 'unread',
      metadata: metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Insert the message
    const { data, error } = await supabase
      .from('contact_messages')
      .insert(messageData)
      .select(`
        *,
        sender:users!contact_messages_sender_id_fkey(id, name, email),
        recipient:users!contact_messages_recipient_id_fkey(id, name, email, role)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
    }

    // Add participants to thread if this is a new thread
    if (data.thread_id && senderId && recipientId) {
      await addThreadParticipants(data.thread_id, [senderId, recipientId]);
    }

    // Fetch item context for product inquiries
    let itemContext = null;
    if (contentId && mappedContentType !== 'general') {
      itemContext = await fetchItemContext(mappedContentType, contentId);
    }

    // Send email notification
    if (recipientId) {
      await sendEmailNotification(data, itemContext);
    }

    return NextResponse.json({
      success: true,
      messageId: data.id,
      threadId: data.thread_id,
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
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const messageType = searchParams.get('messageType');
    const threadId = searchParams.get('threadId');
    const contentType = searchParams.get('contentType');
    const priority = searchParams.get('priority');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    // Build base query
    let query = supabase
      .from('contact_messages')
      .select(`
        *,
        sender:users!contact_messages_sender_id_fkey(id, name, email, role),
        recipient:users!contact_messages_recipient_id_fkey(id, name, email, role)
      `);

    // Apply user access control
    if (authUser.role === 'ADMIN') {
      // Admins can see all messages
    } else {
      // Regular users can only see messages they sent or received
      query = query.or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`);
    }

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (messageType && messageType !== 'all') {
      query = query.eq('message_type', messageType);
    }

    if (threadId) {
      query = query.eq('thread_id', threadId);
    }

    if (contentType && contentType !== 'all') {
      query = query.eq('content_type', contentType);
    }

    if (priority && priority !== 'all') {
      query = query.eq('priority', priority);
    }

    if (search) {
      query = query.or(`subject.ilike.%${search}%,message.ilike.%${search}%,sender_name.ilike.%${search}%`);
    }

    // Apply ordering and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Group messages by thread if no specific thread requested
    let result;
    if (!threadId) {
      result = groupMessagesByThread(data || []);
    } else {
      result = data || [];
    }

    return NextResponse.json({
      messages: result,
      hasMore: (data?.length || 0) === limit,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageIds, status, priority, tags } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) {
      updateData.status = status;
      if (status === 'read') {
        updateData.read_at = new Date().toISOString();
      }
    }

    if (priority) {
      updateData.priority = priority;
    }

    if (tags) {
      updateData.tags = tags;
    }

    // Build query with access control
    let query = supabase
      .from('contact_messages')
      .update(updateData);

    if (authUser.role === 'ADMIN') {
      // Admins can update any message
      query = query.in('id', messageIds);
    } else {
      // Users can only update messages they sent or received
      query = query
        .in('id', messageIds)
        .or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`);
    }

    const { data, error } = await query.select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update messages' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updatedCount: data?.length || 0,
      message: 'Messages updated successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper Functions

async function handleBulkMessage(authUser: any, body: any) {
  const { subject, message, recipients, recipientType, priority = 'normal', tags = [] } = body;

  // Create the bulk message
  const bulkMessageData = {
    sender_id: authUser.id,
    recipient_id: null, // Bulk messages don't have a single recipient
    sender_name: authUser.name,
    sender_email: authUser.email,
    sender_phone: null,
    subject: subject.trim(),
    message: message.trim(),
    content_type: 'general',
    content_id: null,
    message_type: 'bulk_message',
    recipient_type: 'broadcast',
    priority,
    tags,
    status: 'unread',
    metadata: { recipient_type: recipientType, recipient_count: recipients.length },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data: bulkMessage, error: bulkError } = await supabase
    .from('contact_messages')
    .insert(bulkMessageData)
    .select()
    .single();

  if (bulkError) {
    throw new Error('Failed to create bulk message');
  }

  // Create recipient records
  const recipientRecords = recipients.map((recipientId: string) => ({
    message_id: bulkMessage.id,
    recipient_id: recipientId,
    recipient_type: recipientType,
    status: 'unread',
    delivered_at: new Date().toISOString()
  }));

  const { error: recipientError } = await supabase
    .from('bulk_message_recipients')
    .insert(recipientRecords);

  if (recipientError) {
    throw new Error('Failed to create recipient records');
  }

  return NextResponse.json({
    success: true,
    messageId: bulkMessage.id,
    recipientCount: recipients.length,
    message: 'Bulk message sent successfully'
  });
}

async function addThreadParticipants(threadId: string, userIds: string[]) {
  const participants = userIds.map(userId => ({
    thread_id: threadId,
    user_id: userId,
    user_type: 'user', // Will be updated by trigger based on user role
    joined_at: new Date().toISOString()
  }));

  await supabase
    .from('message_participants')
    .insert(participants)
    .onConflict('thread_id, user_id')
    .ignoreDuplicates();
}

async function fetchItemContext(contentType: string, contentId: string) {
  const tableMap: Record<string, string> = {
    property: 'properties',
    food_item: 'food_items',
    store_product: 'store_products',
    project: 'projects',
    blog_post: 'blog_posts'
  };
  
  const tableName = tableMap[contentType];
  if (!tableName) return null;

  try {
    const { data } = await supabase
      .from(tableName)
      .select('id, title, name, price, location')
      .eq('id', contentId)
      .single();
    
    return data;
  } catch (error) {
    console.error('Error fetching item context:', error);
    return null;
  }
}

async function sendEmailNotification(message: any, itemContext: any) {
  if (!message.recipient?.email) return;

  try {
    const contentTitle = itemContext?.title || itemContext?.name || `${message.content_type} item`;
    
    await notifyVendorOfNewMessage(
      message.recipient.email,
      message.recipient.name || 'User',
      message.sender_name,
      message.sender_email,
      message.subject,
      message.message,
      message.content_type,
      contentTitle
    );

    // Update message to mark email as sent
    await supabase
      .from('contact_messages')
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString()
      })
      .eq('id', message.id);

  } catch (error) {
    console.error('Failed to send email notification:', error);
  }
}

function groupMessagesByThread(messages: any[]) {
  const threads = new Map();
  
  messages.forEach(message => {
    const threadId = message.thread_id || 'no-thread';
    
    if (!threads.has(threadId)) {
      threads.set(threadId, {
        thread_id: threadId,
        participants: [],
        last_message: message,
        unread_count: 0,
        total_messages: 0,
        messages: []
      });
    }
    
    const thread = threads.get(threadId);
    thread.messages.push(message);
    thread.total_messages++;
    
    // Track participants
    if (message.sender_id && !thread.participants.includes(message.sender_id)) {
      thread.participants.push(message.sender_id);
    }
    if (message.recipient_id && !thread.participants.includes(message.recipient_id)) {
      thread.participants.push(message.recipient_id);
    }
    
    // Count unread messages
    if (message.status === 'unread') {
      thread.unread_count++;
    }
    
    // Update last message if this is newer
    if (new Date(message.created_at) > new Date(thread.last_message.created_at)) {
      thread.last_message = message;
    }
  });
  
  return Array.from(threads.values()).sort((a, b) => 
    new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime()
  );
}
