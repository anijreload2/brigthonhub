'use client';

import { useState, useEffect, Suspense, useReducer } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, Send, ArrowLeft, Search, 
  Filter, MoreVertical, Archive, Trash2,
  Circle, CheckCircle, Clock, User,
  Phone, Mail, MapPin, AlertCircle, Plus,
  Shield, Users, TrendingUp, Bell, Settings,
  CheckSquare, Flag
} from 'lucide-react';
import { format, isValid } from 'date-fns';
import ComposeMessageModal from '@/components/messages/ComposeMessageModal';
import { authenticatedFetch } from '@/lib/auth-utils';

// Safe date formatting utility
const formatSafeDate = (dateString: string, formatStr: string = 'MMM d, h:mm a'): string => {
  try {
    if (!dateString) return 'Invalid date';
    const date = new Date(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, formatStr);
  } catch (error) {
    console.error('Date formatting error:', error, 'Date string:', dateString);
    return 'Invalid date';
  }
};

interface ContactMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  item_type: 'property' | 'food' | 'store' | 'project' | 'blog' | 'general' | null;
  item_id: string | null;
  thread_id: string | null;
  parent_message_id: string | null;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  message_type: 'inquiry' | 'response' | 'notification' | 'general';
  sender_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  sender?: {
    name?: string;
    email: string;
    phone?: string;
  };
  recipient?: {
    name?: string;
    email: string;
    phone?: string;
  };
  item_data?: any;
}

interface MessageThread {
  id: string;
  participants: string[];
  last_message: ContactMessage;
  unread_count: number;
  messages: ContactMessage[];
}

const MESSAGE_STATUS_COLORS = {
  unread: 'bg-blue-100 text-blue-800',
  read: 'bg-gray-100 text-gray-800',
  replied: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800'
};

const MESSAGE_STATUS_ICONS = {
  unread: Circle,
  read: CheckCircle,
  replied: CheckCircle,
  archived: Archive
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  normal: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700'
};

const PRIORITY_ICONS = {
  low: Circle,
  normal: Circle,
  high: AlertCircle,
  urgent: AlertCircle
};

function AdminMessagesPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State declarations
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'thread'>('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    urgent: 0,
    contactForms: 0,
    thisWeek: 0
  });

  // Auto-select thread from URL parameter
  const threadId = searchParams?.get('thread');
  useEffect(() => {
    if (user === null) {
      // User is not authenticated
      router.push('/auth/login?redirect=/admin/messages');
      return;
    }
    
    if (user === undefined) {
      // Still loading user auth state
      return;
    }
    
    if (user.role !== 'ADMIN') {
      router.push('/messages');
      return;
    }
    
    fetchMessages();
  }, [user, router]);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        setViewMode('thread');
      }
    }
  }, [threadId, threads]);
  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      console.log('🔍 Fetching messages for admin ID:', user.id);
      
      // Use the new unified contact-messages API with admin access (sees all messages)
      const response = await authenticatedFetch('/api/contact-messages?role=admin', {
        method: 'GET'
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', response.status, errorText);
        throw new Error(`Failed to fetch messages: ${response.status}`);
      }

      const data = await response.json();
      const fetchedMessages = data.messages || [];
      
      console.log('✅ Successfully fetched messages count:', fetchedMessages.length);
      console.log('📋 Messages data:', fetchedMessages);
      
      setMessages(fetchedMessages);      // Calculate admin-specific stats
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const statsData = {
        total: fetchedMessages.length,
        unread: fetchedMessages.filter((m: ContactMessage) => m.status === 'unread').length,
        urgent: fetchedMessages.filter((m: ContactMessage) => m.priority === 'urgent').length,
        contactForms: fetchedMessages.filter((m: ContactMessage) => m.message_type === 'inquiry' && m.item_type === 'general').length,
        thisWeek: fetchedMessages.filter((m: ContactMessage) => new Date(m.created_at) >= oneWeekAgo).length
      };
      setStats(statsData);

      // Group messages into threads
      const threadsMap = new Map<string, MessageThread>();
      fetchedMessages.forEach((message: ContactMessage) => {
        // Use the thread_id from the database, or create one if missing
        const threadKey = message.thread_id || `${[message.sender_id, message.recipient_id].sort().join('-')}-${message.item_type}-${message.item_id}`;
        
        if (!threadsMap.has(threadKey)) {
          threadsMap.set(threadKey, {
            id: threadKey,
            participants: [message.sender_id, message.recipient_id],
            last_message: message,
            unread_count: 0,
            messages: []
          });
        }
        
        const thread = threadsMap.get(threadKey)!;
        thread.messages.push(message);
        
        // Update unread count (admin sees all unread)
        if (message.status === 'unread') {
          thread.unread_count++;
        }
        
        // Update last message if this is newer
        if (new Date(message.created_at) > new Date(thread.last_message.created_at)) {
          thread.last_message = message;
        }
      });
      
      // Sort threads by last message date
      const threadsArray = Array.from(threadsMap.values())
        .sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());
      
      setThreads(threadsArray);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };
  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;

    setSending(true);
    try {
      const recipientId = selectedThread.participants.find((p: string) => p !== user.id);
      const lastMessage = selectedThread.last_message;
      
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          subject: `Re: ${lastMessage.subject}`,
          message: newMessage.trim(),
          item_type: lastMessage.item_type,
          item_id: lastMessage.item_id,
          thread_id: lastMessage.thread_id,
          parent_message_id: lastMessage.id,
          message_type: 'response'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      await fetchMessages(); // Refresh to show new message
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  const markAsRead = async (messageId: string) => {
    try {
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds: [messageId],
          updates: { status: 'read' }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mark message as read');
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (selectedMessages.length === 0) return;

    try {
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds: selectedMessages,
          updates: { status }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update messages');
      }

      setSelectedMessages([]);
      await fetchMessages();
    } catch (error) {
      console.error('Error updating messages:', error);
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    const otherUserId = thread.participants.find(p => p !== user?.id);
    const lastMessage = thread.last_message;
    
    // Check if we have sender data from API joins
    if (lastMessage.sender_id === otherUserId && lastMessage.sender) {
      return lastMessage.sender;
    } else if (lastMessage.recipient_id === otherUserId && lastMessage.recipient) {
      return lastMessage.recipient;
    }
    
    // Fallback to message fields for anonymous/guest users
    if (lastMessage.sender_id === otherUserId) {
      return {
        name: lastMessage.sender_name,
        email: lastMessage.sender_email,
        phone: lastMessage.sender_phone
      };
    } else {
      return {
        name: 'Unknown User',
        email: lastMessage.sender_email || 'Unknown',
        phone: lastMessage.sender_phone
      };
    }
  };

  const filteredThreads = threads.filter(thread => {
    const otherParticipant = getOtherParticipant(thread);
    const matchesSearch = searchTerm === '' || 
      thread.last_message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.last_message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (otherParticipant?.name && otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (otherParticipant?.email && otherParticipant.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      thread.messages.some(msg => msg.status === statusFilter) ||
      (statusFilter === 'unread' && thread.unread_count > 0);

    const matchesType = typeFilter === 'all' || 
      thread.last_message.message_type === typeFilter;

    const matchesPriority = priorityFilter === 'all' || 
      thread.last_message.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;  });
  // Handle auth loading state
  if (user === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => {
                  if (viewMode === 'thread') {
                    setViewMode('inbox');
                    setSelectedThread(null);
                    router.push('/admin/messages');
                  } else {
                    router.push('/admin');
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {viewMode === 'thread' ? 'Back to Inbox' : 'Back to Dashboard'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-6 h-6 mr-2 text-red-600" />
                  {viewMode === 'thread' ? 'Message Thread' : 'Admin Messages'}
                </h1>
                <p className="text-gray-600">
                  {viewMode === 'thread' 
                    ? `Conversation with ${getOtherParticipant(selectedThread!)?.name || 'User'}`
                    : 'Monitor and manage all platform communications'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {selectedMessages.length > 0 && viewMode === 'inbox' && (
                <>
                  <Button variant="outline" onClick={() => bulkUpdateStatus('read')}>
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Mark Read ({selectedMessages.length})
                  </Button>
                  <Button variant="outline" onClick={() => bulkUpdateStatus('archived')}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </Button>
                </>
              )}
              <Button onClick={() => setShowComposeModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Message
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {viewMode === 'inbox' && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Messages</p>
                    <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                  </div>
                  <MessageCircle className="w-8 h-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600 font-medium">Unread</p>
                    <p className="text-2xl font-bold text-red-700">{stats.unread}</p>
                  </div>
                  <Bell className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Urgent</p>
                    <p className="text-2xl font-bold text-orange-700">{stats.urgent}</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-medium">Contact Forms</p>
                    <p className="text-2xl font-bold text-green-700">{stats.contactForms}</p>
                  </div>
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-medium">This Week</p>
                    <p className="text-2xl font-bold text-purple-700">{stats.thisWeek}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {viewMode === 'inbox' ? (
          // Inbox View
          <div>
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search all conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2 overflow-x-auto">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filter by status"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filter by type"
                >
                  <option value="all">All Types</option>
                  <option value="inquiry">Inquiries</option>
                  <option value="general">General</option>
                  <option value="notification">Notifications</option>
                  <option value="response">Responses</option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filter by priority"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Messages List */}
            {filteredThreads.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {threads.length === 0 ? 'No Messages' : 'No Matches Found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {threads.length === 0 
                    ? 'All platform messages will appear here for admin review.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {filteredThreads.map((thread) => {
                    const otherParticipant = getOtherParticipant(thread);
                    const StatusIcon = MESSAGE_STATUS_ICONS[thread.last_message.status];
                    const PriorityIcon = PRIORITY_ICONS[thread.last_message.priority || 'normal'];
                    
                    return (
                      <div
                        key={thread.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start space-x-3">                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(thread.last_message.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedMessages([...selectedMessages, thread.last_message.id]);
                              } else {
                                setSelectedMessages(selectedMessages.filter(id => id !== thread.last_message.id));
                              }
                            }}
                            className="mt-1"
                            aria-label={`Select message from ${getOtherParticipant(thread)?.name || 'Unknown'}`}
                          />
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setSelectedThread(thread);
                              setViewMode('thread');
                              router.push(`/admin/messages?thread=${thread.id}`);
                              // Mark messages as read when opening thread
                              thread.messages
                                .filter(msg => msg.status === 'unread')
                                .forEach(msg => markAsRead(msg.id));
                            }}
                          >
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {otherParticipant?.name || 'Anonymous User'}
                                  </h3>
                                  <div className="flex items-center space-x-2">
                                    {thread.last_message.priority && thread.last_message.priority !== 'normal' && (
                                      <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[thread.last_message.priority]}`}>
                                        <PriorityIcon className="w-3 h-3 inline mr-1" />
                                        {thread.last_message.priority}
                                      </span>
                                    )}
                                    {thread.unread_count > 0 && (
                                      <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                                        {thread.unread_count}
                                      </span>
                                    )}
                                    <StatusIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {otherParticipant?.email || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {thread.last_message.subject}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                                    {thread.last_message.message_type}
                                  </span>
                                  {thread.last_message.item_type && (
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                      {thread.last_message.item_type}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {thread.last_message.message}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${MESSAGE_STATUS_COLORS[thread.last_message.status]}`}>
                                  {thread.last_message.status.charAt(0).toUpperCase() + thread.last_message.status.slice(1)}
                                </span>
                                {thread.last_message.tags && thread.last_message.tags.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    #{thread.last_message.tags[0]}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500">
                                {formatSafeDate(thread.last_message.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Thread View - Same as other message pages
          selectedThread && (
            <div className="bg-white rounded-lg shadow-sm h-96 flex flex-col">
              {/* Thread Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {getOtherParticipant(selectedThread)?.name || 'User'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {getOtherParticipant(selectedThread)?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {selectedThread.messages
                  .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                  .map((message) => {
                    const isFromUser = message.sender_id === user?.id;
                    
                    return (
                      <div key={message.id} className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isFromUser 
                            ? 'bg-red-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isFromUser ? 'text-red-100' : 'text-gray-500'
                          }`}>
                            {formatSafeDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex space-x-3">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your admin response..."
                    rows={2}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Compose Message Modal */}
      <ComposeMessageModal        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onMessageSent={fetchMessages}
      />
    </div>
  );
}

export default function AdminMessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading admin messages...</div>}>
      <AdminMessagesPageContent />
    </Suspense>
  );
}
