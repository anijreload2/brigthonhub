'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Plus, 
  User, 
  Clock,
  CheckCircle,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Conversation {
  conversation_id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  message_count: number;
  unread_count: number;
  other_user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;
  conversation_id: string;
}

const AdminMessagesPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!user || !['ADMIN', 'AGENT'].includes(user.role))) {
      router.push('/admin');
      return;
    }
  }, [user, authLoading, router]);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/internal-messages');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/internal-messages?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  // Fetch vendors for new message
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('role', 'VENDOR')
        .eq('is_active', true);

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  useEffect(() => {
    if (user && ['ADMIN', 'AGENT'].includes(user.role)) {
      fetchConversations();
      fetchVendors();
    }
  }, [user]);

  const sendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.message.trim() || !selectedRecipient) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('/api/internal-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: selectedRecipient,
          subject: newMessage.subject,
          message: newMessage.message,
          conversationId: selectedConversation,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Message sent successfully',
        });
        setNewMessage({ subject: '', message: '' });
        setShowNewMessage(false);
        setSelectedRecipient('');
        fetchConversations();
        
        if (selectedConversation) {
          fetchMessages(selectedConversation);
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.other_user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || (!user || !['ADMIN', 'AGENT'].includes(user.role))) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Internal Messages</h1>
        <Button 
          onClick={() => setShowNewMessage(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading conversations...</div>
              ) : filteredConversations.length > 0 ? (
                <div className="divide-y">
                  {filteredConversations.map((conv) => (
                    <div
                      key={conv.conversation_id}
                      onClick={() => {
                        setSelectedConversation(conv.conversation_id);
                        fetchMessages(conv.conversation_id);
                      }}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${
                        selectedConversation === conv.conversation_id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <User className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {conv.other_user?.name || 'Unknown User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {conv.other_user?.role}
                            </p>
                          </div>
                        </div>
                        {conv.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {conv.message_count} messages
                      </p>
                      <p className="text-xs text-gray-400">
                        Last: {new Date(conv.last_message_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  No conversations found
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Messages Display */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedConversation ? 'Messages' : 'Select a conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="h-full flex flex-col">
              {selectedConversation ? (
                <>
                  <div className="flex-1 overflow-y-auto mb-4">
                    {messagesLoading ? (
                      <div className="text-center py-8">Loading messages...</div>
                    ) : messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg ${
                              message.sender_id === user.id
                                ? 'bg-blue-100 ml-8'
                                : 'bg-gray-100 mr-8'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-medium text-sm">
                                {message.sender_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(message.created_at).toLocaleString()}
                              </p>
                            </div>
                            <p className="font-medium text-sm mb-1">
                              {message.subject}
                            </p>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No messages in this conversation
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a conversation to view messages
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Send New Message</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient</label>                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  aria-label="Select recipient"
                >
                  <option value="">Select a vendor...</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <Input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  placeholder="Message subject..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Type your message..."
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button onClick={sendMessage} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowNewMessage(false);
                  setNewMessage({ subject: '', message: '' });
                  setSelectedRecipient('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessagesPage;
