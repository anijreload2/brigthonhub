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
  ArrowLeft,
  AdminIcon
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

const VendorMessagesPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', message: '' });
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'VENDOR')) {
      router.push('/vendor/dashboard');
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

  // Fetch admin users for new message
  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .in('role', ['ADMIN', 'AGENT'])
        .eq('is_active', true);

      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  useEffect(() => {
    if (user && user.role === 'VENDOR') {
      fetchConversations();
      fetchAdminUsers();
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

  if (authLoading || (!user || user.role !== 'VENDOR')) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/vendor/dashboard')}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Messages with Admin</h1>
        </div>
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
              <CardTitle className="text-lg">Admin Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-4 text-center">Loading conversations...</div>
              ) : conversations.length > 0 ? (
                <div className="divide-y">
                  {conversations.map((conv) => (
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
                              {conv.other_user?.name || 'Admin User'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {conv.other_user?.role} Team
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
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p>No conversations with admin yet</p>
                  <p className="text-sm mt-2">Start a new conversation to get help or ask questions</p>
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
                {selectedConversation ? 'Conversation' : 'Select a conversation'}
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
                                {message.sender_id === user.id ? 'You' : message.sender_name}
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
                  
                  {/* Quick Reply */}
                  <div className="border-t pt-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a quick reply..."
                        className="flex-1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            // Handle quick reply
                          }
                        }}
                      />
                      <Button size="sm">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p>Select a conversation or start a new one</p>
                  </div>
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
            <h3 className="text-lg font-medium mb-4">Message Admin Team</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Send to</label>
                <select
                  value={selectedRecipient}
                  onChange={(e) => setSelectedRecipient(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  aria-label="Select admin recipient"
                >
                  <option value="">Select admin...</option>
                  {adminUsers.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name} ({admin.role})
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
                  placeholder="What's this about?"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  value={newMessage.message}
                  onChange={(e) => setNewMessage({ ...newMessage, message: e.target.value })}
                  placeholder="Describe your question or concern..."
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

export default VendorMessagesPage;
