
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Mic, 
  MicOff,
  Languages,
  Trash2,
  Download,
  Star,
  MessageSquare,
  Lightbulb,
  Home,
  Utensils,
  ShoppingCart,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/components/auth/auth-provider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const sampleResponses = {
  'property': 'I can help you find the perfect property! Based on your budget of ₦50 million for a 3-bedroom apartment in Lekki, I found several great options:\n\n1. **Modern Apartment in Lekki Phase 1** - ₦45M\n   - 3 bedrooms, 3 bathrooms\n   - Swimming pool, gym, 24/7 security\n   - Close to shopping centers\n\n2. **Luxury Flat in Lekki Gardens** - ₦48M\n   - 3 bedrooms, 4 bathrooms\n   - Fitted kitchen, balcony\n   - Gated estate with excellent facilities\n\nWould you like me to show you more details about any of these properties or help you schedule a viewing?',
  
  'food': 'Great! I can help you with bulk food supply for your restaurant. For fresh tomatoes and peppers, here are some excellent options:\n\n**Fresh Tomatoes:**\n- Premium Jos tomatoes: ₦2,500 per basket\n- Minimum order: 5 baskets\n- Origin: Jos, Plateau State\n\n**Scotch Bonnet Peppers:**\n- Fresh hot peppers: ₦3,200 per kg\n- Minimum order: 2kg\n- Origin: Kaduna State\n\n**Special Restaurant Package:**\n- 10 baskets tomatoes + 5kg peppers = ₦41,000\n- Free same-day delivery in Lagos\n- Quality guarantee\n\nWould you like me to place this order or would you prefer to see more options?',
  
  'office': 'Perfect! Setting up a modern office for 20 employees requires careful planning. Here\'s what I recommend:\n\n**Essential Furniture:**\n- 20 ergonomic office chairs: ₦1,900,000\n- 10 executive desks: ₦1,850,000\n- Meeting table for 12: ₦350,000\n- Reception desk: ₦180,000\n\n**Technology & Equipment:**\n- 20 desktop computers: ₦6,400,000\n- Network setup & WiFi: ₦450,000\n- Printer/Scanner combo: ₦180,000\n\n**Total Estimated Cost: ₦11,310,000**\n\nThis includes delivery and basic setup. Would you like me to break down the costs further or help you with financing options?',
  
  'project': 'Renovating a 4-bedroom house is an exciting project! Here are the key considerations:\n\n**Planning Phase:**\n- Budget: Typically ₦8-15M for full renovation\n- Timeline: 3-6 months depending on scope\n- Permits: Ensure all necessary approvals\n\n**Priority Areas:**\n1. **Kitchen & Bathrooms** (40% of budget)\n2. **Electrical & Plumbing** (25% of budget)\n3. **Flooring & Painting** (20% of budget)\n4. **Fixtures & Fittings** (15% of budget)\n\n**Our Services:**\n- Free consultation and quote\n- Project management\n- Quality materials sourcing\n- Professional contractors\n\nWould you like me to schedule a consultation or provide a detailed quote for your renovation project?'
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [quickActions, setQuickActions] = useState<any[]>([]);
  const [isLoadingActions, setIsLoadingActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const router = useRouter();

  // Protect the AI assistant - only for registered users
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
  }, [user, router]);

  // Fetch quick actions from training data
  useEffect(() => {
    const fetchQuickActions = async () => {
      if (!user) return;
      
      try {
        setIsLoadingActions(true);
        const response = await fetch('/api/ai-assistant/quick-actions');
        if (response.ok) {
          const data = await response.json();
          setQuickActions(data.quickActions || []);
        } else {
          console.error('Failed to fetch quick actions');
          // Fall back to default actions if API fails
          setQuickActions([
            {
              id: 'default-1',
              icon: 'Home',
              title: 'Property Search',
              description: 'Find properties in Lagos',
              prompt: 'Help me find a 3-bedroom apartment in Lekki, Lagos under ₦50 million'
            },
            {
              id: 'default-2',
              icon: 'Utensils',
              title: 'Food Supply',
              description: 'Bulk food ordering',
              prompt: 'I need to order fresh tomatoes and peppers for my restaurant in bulk'
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching quick actions:', error);
        setQuickActions([]);
      } finally {
        setIsLoadingActions(false);
      }
    };

    fetchQuickActions();
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Only scroll to bottom if there are more than 1 message (i.e., user has started chatting)
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        role: 'assistant',
        content: `Hello${user ? ` ${user.name}` : ''}! 👋 I'm your BrightonHub AI Assistant. I can help you with:\n\n🏠 **Property Search** - Find your perfect home or investment\n🍅 **Food Supply** - Bulk produce and catering services\n🛒 **Marketplace** - Office furniture and building materials\n🏗️ **Project Planning** - Construction and renovation advice\n\nHow can I assist you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [user]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get conversation history for context
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call the new AI chat API
      const chatResponse = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageContent,
          conversation: conversationHistory
        }),
      });

      let response = "I understand you're looking for assistance. Let me help you with that!";
      
      if (chatResponse.ok) {
        const chatData = await chatResponse.json();
        response = chatData.response;
        
        // Add model indicator if available
        if (chatData.model) {
          console.log(`🤖 Response generated using: ${chatData.model}`);
        }
        
        // Add knowledge base indicator
        if (chatData.hasTrainingContext) {
          response += `\n\n💡 *This response incorporates information from our knowledge base.*`;
        } else {
          response += `\n\n🤖 *This response is generated using AI model: ${chatData.model || 'OpenRouter'}*`;
        }
      } else {
        const errorData = await chatResponse.json();
        if (errorData.error.includes('OpenRouter API key not configured')) {
          response = "🔧 **AI Configuration Required**\n\nThe AI assistant needs to be configured by an administrator. Please contact support or check the admin panel to set up the OpenRouter API key and model selection.";
        } else {
          console.error('AI chat API error:', errorData.error);
          // Fallback to keyword matching for demo
          const lowerContent = messageContent.toLowerCase();
          if (lowerContent.includes('property') || lowerContent.includes('apartment') || lowerContent.includes('house') || lowerContent.includes('lekki')) {
            response = sampleResponses.property;
          } else if (lowerContent.includes('food') || lowerContent.includes('tomato') || lowerContent.includes('pepper') || lowerContent.includes('restaurant')) {
            response = sampleResponses.food;
          } else if (lowerContent.includes('office') || lowerContent.includes('furniture') || lowerContent.includes('employee') || lowerContent.includes('desk')) {
            response = sampleResponses.office;
          } else if (lowerContent.includes('renovation') || lowerContent.includes('project') || lowerContent.includes('construction') || lowerContent.includes('bedroom')) {
            response = sampleResponses.project;
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting to the AI service right now. Please try again in a moment, or contact support if the issue persists.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const clearConversation = () => {
    setMessages([]);
    // Re-add welcome message
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello${user ? ` ${user.name}` : ''}! 👋 I'm your BrightonHub AI Assistant. How can I help you today?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const exportConversation = () => {
    const conversation = messages.map(msg => 
      `${msg.role.toUpperCase()}: ${msg.content}\n`
    ).join('\n');
    
    const blob = new Blob([conversation], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brightonhub-conversation.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Show loading while checking authentication
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                AI Assistant
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Get instant help with properties, food supply, marketplace, and project planning
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-accent" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoadingActions ? (
                  <div className="text-center py-4">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading suggestions...</p>
                  </div>
                ) : (
                  quickActions.map((action, index) => {
                    // Map icon names to components
                    const iconMap: Record<string, any> = {
                      'Home': Home,
                      'Utensils': Utensils,
                      'ShoppingCart': ShoppingCart,
                      'Briefcase': Briefcase,
                      'MessageSquare': MessageSquare
                    };
                    const Icon = iconMap[action.icon] || MessageSquare;
                    
                    return (
                      <motion.div
                        key={action.id || `action-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Button
                          variant="outline"
                          className="w-full h-auto p-4 flex flex-col items-start space-y-2 hover:bg-primary hover:text-white"
                          onClick={() => handleQuickAction(action.prompt)}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{action.title}</span>
                          </div>
                          <span className="text-xs text-left opacity-70">
                            {action.description}
                          </span>
                        </Button>
                      </motion.div>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Language & Controls */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-sm">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Language
                  </label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="yo">Yoruba</SelectItem>
                      <SelectItem value="ha">Hausa</SelectItem>
                      <SelectItem value="ig">Igbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearConversation}
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportConversation}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-200 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-brand-gradient rounded-full flex items-center justify-center">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">BrightonHub AI</h3>
                      <p className="text-sm text-gray-600">Always here to help</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Online
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-[80%] ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.role === 'user' 
                              ? 'bg-primary text-white' 
                              : 'bg-secondary text-white'
                          }`}>
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className={`rounded-lg p-4 ${
                            message.role === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </div>
                            <div className={`text-xs mt-2 ${
                              message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                            }`}>
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="pr-12"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2"
                      onClick={() => setIsListening(!isListening)}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4 text-red-500" />
                      ) : (
                        <Mic className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isTyping}
                    className="btn-primary"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
