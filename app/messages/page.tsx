'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, Send, ArrowLeft, Search, 
  Filter, MoreVertical, Archive, Trash2,
  Circle, CheckCircle, Clock, User,  Phone, Mail, MapPin, AlertCircle, Plus
} from 'lucide-react';
import { format } from 'date-fns';
import ComposeMessageModal from '@/components/messages/ComposeMessageModal';
import { authenticatedFetch } from '@/lib/auth-utils';

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

function MessagesPageContent() {
  const { user, isLoading } = useAuth();
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
  const [newMessage, setNewMessage] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'thread'>('inbox');
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Auto-select thread from URL parameter
  const threadId = searchParams?.get('thread');  useEffect(() => {
    // Only redirect after the auth loading is complete and user is null
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/messages');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  useEffect(() => {
    if (threadId && threads.length > 0) {
      const thread = threads.find(t => t.id === threadId);
      if (thread) {
        setSelectedThread(thread);
        setViewMode('thread');
      }
    }
  }, [threadId, threads]);  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Use the new unified contact-messages API with authentication
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      const messages = data.messages || [];
      setMessages(messages);

      // Group messages into threads
      const threadsMap = new Map<string, MessageThread>();
      messages.forEach((message: ContactMessage) => {
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
        
        // Update unread count for current user
        if (message.recipient_id === user.id && message.status === 'unread') {
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

    } finally {
      setLoading(false);
    }
  };  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;

    setSending(true);
    try {
      const recipientId = selectedThread.participants.find(p => p !== user.id);
      const lastMessage = selectedThread.last_message;
      
      if (!lastMessage) {

        return;
      }
      
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          subject: `Re: ${lastMessage.subject || 'No subject'}`,
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

    } finally {
      setSending(false);
    }
  };  const markAsRead = async (messageId: string) => {
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

    }
  };  const updateMessageStatus = async (messageId: string, status: string) => {
    try {
      const response = await authenticatedFetch('/api/contact-messages', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messageIds: [messageId],
          updates: { status }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update message status');
      }

      await fetchMessages();
    } catch (error) {

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
      thread.last_message?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.last_message?.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (otherParticipant?.name && otherParticipant.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (otherParticipant?.email && otherParticipant.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || 
      thread.messages.some(msg => msg.status === statusFilter) ||
      (statusFilter === 'unread' && thread.unread_count > 0);
    
    return matchesSearch && matchesStatus;
  });
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your messages...</p>
        </div>
      </div>
    );
  }

  // Show loading while auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to login...</p>
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
                    router.push('/messages');
                  } else {
                    router.back();
                  }
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {viewMode === 'thread' ? 'Back to Inbox' : 'Back'}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'thread' ? 'Message Thread' : 'Messages'}
                </h1>
                <p className="text-gray-600">
                  {viewMode === 'thread' 
                    ? `Conversation with ${getOtherParticipant(selectedThread!)?.name || 'User'}`
                    : 'Manage your conversations with vendors and customers'
                  }
                </p>              </div>
            </div>
            {threads.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{threads.reduce((sum, thread) => sum + thread.unread_count, 0)} unread</span>
              </div>
            )}
            <Button onClick={() => setShowComposeModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Message
            </Button>
          </div>
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
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filter messages by status"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            {/* Messages List */}
            {filteredThreads.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  {threads.length === 0 ? 'No Messages Yet' : 'No Matches Found'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {threads.length === 0 
                    ? 'When vendors or customers contact you, their messages will appear here.'
                    : 'Try adjusting your search or filter criteria.'
                  }
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">                  {filteredThreads.map((thread) => {
                    const otherParticipant = getOtherParticipant(thread);
                    const StatusIcon = MESSAGE_STATUS_ICONS[thread.last_message?.status || 'unread'];
                    const PriorityIcon = PRIORITY_ICONS[thread.last_message?.priority || 'normal'];
                    
                    return (
                      <div
                        key={thread.id}
                        onClick={() => {
                          setSelectedThread(thread);
                          setViewMode('thread');
                          router.push(`/messages?thread=${thread.id}`);
                          // Mark messages as read when opening thread
                          thread.messages
                            .filter(msg => msg.recipient_id === user?.id && msg.status === 'unread')
                            .forEach(msg => markAsRead(msg.id));
                        }}
                        className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {otherParticipant?.name || 'Unknown User'}
                                  </h3>
                                  <div className="flex items-center space-x-2">                                    {thread.last_message?.priority && thread.last_message.priority !== 'normal' && (
                                      <span className={`px-2 py-1 text-xs rounded-full ${PRIORITY_COLORS[thread.last_message.priority]}`}>
                                        <PriorityIcon className="w-3 h-3 inline mr-1" />
                                        {thread.last_message.priority}
                                      </span>
                                    )}
                                    {thread.unread_count > 0 && (
                                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                        {thread.unread_count}
                                      </span>
                                    )}
                                    <StatusIcon className="w-4 h-4 text-gray-400" />
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 truncate">
                                  {otherParticipant?.email}
                                </p>
                              </div>
                            </div>
                            <div className="mb-2">
                              <div className="flex items-center justify-between mb-1">                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {thread.last_message?.subject || 'No subject'}
                                </h4>
                                {thread.last_message?.item_type && (
                                  <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">
                                    {thread.last_message.item_type}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {thread.last_message?.message || 'No message content'}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${MESSAGE_STATUS_COLORS[thread.last_message?.status || 'unread']}`}>
                                  {(thread.last_message?.status || 'unread').charAt(0).toUpperCase() + (thread.last_message?.status || 'unread').slice(1)}
                                </span>
                                {thread.last_message?.tags && thread.last_message.tags.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    #{thread.last_message.tags[0]}
                                  </span>
                                )}
                              </div>                              <span className="text-xs text-gray-500">
                                {thread.last_message?.created_at && !isNaN(new Date(thread.last_message.created_at).getTime()) 
                                  ? format(new Date(thread.last_message.created_at), 'MMM d, h:mm a') 
                                  : 'No date'
                                }
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
          // Thread View
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
                        {getOtherParticipant(selectedThread)?.name || 'Unknown User'}
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
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm">{message.message}</p>                          <p className={`text-xs mt-1 ${
                            isFromUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.created_at && !isNaN(new Date(message.created_at).getTime()) 
                              ? format(new Date(message.created_at), 'MMM d, h:mm a')
                              : 'Invalid date'
                            }
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
                    placeholder="Type your message..."
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
            </div>          )
        )}
      </div>

      {/* Compose Message Modal */}
      <ComposeMessageModal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        onMessageSent={fetchMessages}
      />
    </div>  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading messages...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}
