'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  MessageCircle, Send, ArrowLeft, Search, 
  Filter, MoreVertical, Archive, Trash2,
  Circle, CheckCircle, Clock, User,
  Phone, Mail, MapPin
} from 'lucide-react';
import { format } from 'date-fns';

interface ContactMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied' | 'archived';
  item_type: 'property' | 'food' | 'store' | 'project' | 'blog';
  item_id: string;
  thread_id: string;
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

function MessagesPageContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newMessage, setNewMessage] = useState('');
  const [viewMode, setViewMode] = useState<'inbox' | 'thread'>('inbox');

  // Auto-select thread from URL parameter
  const threadId = searchParams?.get('thread');

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/messages');
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
        // Fetch all messages where user is sender or recipient
      const { data: messagesData, error } = await supabase
        .from('user_messages')
        .select(`
          *,
          sender:users!user_messages_sender_id_fkey(name, email, phone),
          recipient:users!user_messages_recipient_id_fkey(name, email, phone)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const messages = messagesData || [];
      setMessages(messages);

      // Group messages into threads
      const threadsMap = new Map<string, MessageThread>();
        messages.forEach(message => {
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
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedThread || !newMessage.trim()) return;

    setSending(true);
    try {
      const recipientId = selectedThread.participants.find(p => p !== user.id);
      const lastMessage = selectedThread.last_message;
        const { error } = await supabase
        .from('user_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          subject: `Re: ${lastMessage.subject}`,
          message: newMessage.trim(),
          status: 'unread',
          item_type: lastMessage.item_type,
          item_id: lastMessage.item_id,
          thread_id: lastMessage.thread_id
        });

      if (error) throw error;

      setNewMessage('');
      await fetchMessages(); // Refresh to show new message
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {      const { error } = await supabase
        .from('user_messages')
        .update({ status: 'read', updated_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user?.id); // Only mark as read if current user is recipient

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const updateMessageStatus = async (messageId: string, status: string) => {
    try {      const { error } = await supabase
        .from('user_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  };

  const getOtherParticipant = (thread: MessageThread) => {
    const otherUserId = thread.participants.find(p => p !== user?.id);
    const lastMessage = thread.last_message;
    
    if (lastMessage.sender_id === otherUserId) {
      return lastMessage.sender;
    } else {
      return lastMessage.recipient;
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
                </p>
              </div>
            </div>
            {threads.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageCircle className="w-4 h-4" />
                <span>{threads.reduce((sum, thread) => sum + thread.unread_count, 0)} unread</span>
              </div>
            )}
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
                <div className="divide-y divide-gray-200">
                  {filteredThreads.map((thread) => {
                    const otherParticipant = getOtherParticipant(thread);
                    const StatusIcon = MESSAGE_STATUS_ICONS[thread.last_message.status];
                    
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
                                  <div className="flex items-center space-x-2">
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
                              <h4 className="text-sm font-medium text-gray-900 mb-1">
                                {thread.last_message.subject}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {thread.last_message.message}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 text-xs rounded-full ${MESSAGE_STATUS_COLORS[thread.last_message.status]}`}>
                                {thread.last_message.status.charAt(0).toUpperCase() + thread.last_message.status.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(thread.last_message.created_at), 'MMM d, h:mm a')}
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
                          <p className="text-sm">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isFromUser ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
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
            </div>
          )
        )}
      </div>
    </div>  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading messages...</div>}>
      <MessagesPageContent />
    </Suspense>
  );
}
