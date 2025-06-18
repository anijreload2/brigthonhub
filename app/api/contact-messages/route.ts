import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';
import { notifyVendorOfNewMessage } from '@/lib/email-notifications';

// Function to get Supabase user from Authorization header
async function getSupabaseUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const adminClient = getAdminClient();
    
    const { data: { user }, error } = await adminClient.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase auth error:', error);
      return null;
    }

    // Get user role from our users table
    const { data: userData, error: userError } = await adminClient
      .from('users')
      .select('id, email, name, role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role
    };
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}

// Enhanced API for Unified Messaging System
export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    if (!authUser) {
      authUser = await getSupabaseUser(request); // Supabase token
    }
    
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

    // Generate thread ID if not provided
    let finalThreadId = threadId;
    if (!finalThreadId) {
      const participants = [senderId, recipientId].filter(Boolean).sort();
      const context = mappedContentType !== 'general' ? `${mappedContentType}-${contentId}` : 'general';
      finalThreadId = `thread-${participants.join('-')}-${context}`;
    }

    // Prepare anonymous sender data if not authenticated
    const anonymousSender = !authUser ? {
      name: senderName,
      email: senderEmail,
      phone: phone || null
    } : null;

    // Prepare the message data
    const messageData = {
      sender_id: senderId,
      recipient_id: recipientId || null,
      anonymous_sender: anonymousSender,
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: phone || null,
      subject: subject.trim(),
      message: message.trim(),
      item_type: mappedContentType, // Use item_type instead of content_type for compatibility
      item_id: contentId || null,   // Use item_id instead of content_id for compatibility
      content_type: mappedContentType, // Keep both for compatibility
      content_id: contentId || null,
      thread_id: finalThreadId,
      parent_message_id: replyTo || null,
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
      .select('*')
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save message' },
        { status: 500 }
      );
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
      threadId: finalThreadId,
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
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    if (!authUser) {
      authUser = await getSupabaseUser(request); // Supabase token
    }
    
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

    // Build base query without foreign key relationships
    let query = supabase
      .from('contact_messages')
      .select('*');

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
      // Check both content_type and item_type for compatibility
      query = query.or(`content_type.eq.${contentType},item_type.eq.${contentType}`);
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

    const { data: messages, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Fetch user details separately to avoid foreign key issues
    const userIds: string[] = Array.from(new Set([
      ...messages.map(m => m.sender_id),
      ...messages.map(m => m.recipient_id)
    ].filter(Boolean) as string[]));

    let users: Array<{id: string, name: string, email: string, role: string}> = [];
    if (userIds.length > 0) {
      const { data: userData } = await supabase
        .from('users')
        .select('id, name, email, role')
        .in('id', userIds);
      
      users = userData || [];
    }

    // Enhance messages with user data
    const enhancedMessages = messages.map(message => ({
      ...message,
      sender: message.sender_id ? users.find(u => u.id === message.sender_id) : null,
      recipient: message.recipient_id ? users.find(u => u.id === message.recipient_id) : null
    }));

    // Group messages by thread if no specific thread requested
    let result;
    if (!threadId) {
      result = groupMessagesByThread(enhancedMessages);
    } else {
      result = enhancedMessages;
    }

    return NextResponse.json({
      messages: result,
      hasMore: (messages?.length || 0) === limit,
      total: messages?.length || 0
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}export async function PATCH(request: NextRequest) {
  try {
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    if (!authUser) {
      authUser = await getSupabaseUser(request); // Supabase token
    }
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { messageIds, updates, bulkAction } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { error: 'Message IDs are required' },
        { status: 400 }
      );
    }

    // Handle bulk actions
    if (bulkAction) {
      return handleBulkAction(authUser, messageIds, bulkAction);
    }

    // Build update data
    const updateData: any = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (updates.status === 'read') {
      updateData.read_at = new Date().toISOString();
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

  // Create individual messages for each recipient
  const messages = recipients.map((recipientId: string) => ({
    sender_id: authUser.id,
    recipient_id: recipientId,
    sender_name: authUser.name,
    sender_email: authUser.email,
    sender_phone: null,
    subject: subject.trim(),
    message: message.trim(),
    content_type: 'general',
    content_id: null,
    item_type: 'general',
    item_id: null,
    message_type: 'bulk_message',
    priority,
    tags,
    status: 'unread',
    metadata: { recipient_type: recipientType, is_bulk: true },
    thread_id: `bulk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from('contact_messages')
    .insert(messages)
    .select();

  if (error) {
    console.error('Bulk message error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk messages' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    messageCount: data.length,
    recipientCount: recipients.length,
    message: 'Bulk messages sent successfully'
  });
}

async function handleBulkAction(authUser: any, messageIds: string[], action: string) {
  const updateData: any = {
    updated_at: new Date().toISOString()
  };

  switch (action) {
    case 'markAsRead':
      updateData.status = 'read';
      updateData.read_at = new Date().toISOString();
      break;
    case 'markAsUnread':
      updateData.status = 'unread';
      updateData.read_at = null;
      break;
    case 'archive':
      updateData.status = 'archived';
      break;
    case 'delete':
      updateData.status = 'deleted';
      break;
    default:
      return NextResponse.json(
        { error: 'Invalid bulk action' },
        { status: 400 }
      );
  }

  let query = supabase
    .from('contact_messages')
    .update(updateData)
    .in('id', messageIds);

  // Apply access control
  if (authUser.role !== 'ADMIN') {
    query = query.or(`sender_id.eq.${authUser.id},recipient_id.eq.${authUser.id}`);
  }

  const { data, error } = await query.select();

  if (error) {
    console.error('Bulk action error:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk action' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    updatedCount: data.length,
    message: `Bulk action "${action}" completed successfully`
  });
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
  if (!message.recipient_id) return;

  try {
    // Fetch recipient details
    const { data: recipientData } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', message.recipient_id)
      .single();

    if (!recipientData?.email) return;

    const contentTitle = itemContext?.title || itemContext?.name || `${message.content_type} item`;
    
    await notifyVendorOfNewMessage(
      recipientData.email,
      recipientData.name || 'User',
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
        metadata: {
          ...message.metadata,
          email_sent: true,
          email_sent_at: new Date().toISOString()
        }
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