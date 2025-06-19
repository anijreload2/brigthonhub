
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Edit3,
  Save,
  X,
  Heart,
  ShoppingCart,
  MessageSquare,
  Calendar,
  Settings,
  Bell,
  Shield,
  Camera
} from 'lucide-react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/lib/types';

export default function ProfilePage() {

  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [messageStats, setMessageStats] = useState({
    unreadCount: 0,
    totalCount: 0,
    recentMessages: []
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    first_name: user?.profile?.first_name || '',
    last_name: user?.profile?.last_name || '',
    bio: user?.profile?.bio || '',
    location: user?.profile?.location || '',
    business_name: user?.profile?.business_name || '',
    business_address: user?.profile?.business_address || '',
    business_phone: user?.profile?.business_phone || ''
  });

  useEffect(() => {
    if (user) {
      fetchMessageStats();
    }
  }, [user]);

  const fetchMessageStats = async () => {
    try {
      const response = await fetch('/api/contact-messages?limit=5');
      if (response.ok) {
        const data = await response.json();
        const messages = data.messages || [];
        
        setMessageStats({
          unreadCount: messages.filter((msg: any) => msg.status === 'unread' && msg.recipient_id === user?.id).length,
          totalCount: messages.length,
          recentMessages: messages.slice(0, 3)
        });
      }
    } catch (error) {

    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      // In a real app, you would make an API call here
      updateUser({
        name: formData.name,
        phone: formData.phone,
        profile: {
          id: user?.profile?.id || '',
          user_id: user?.profile?.user_id || user?.id || '',
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          location: formData.location,
          business_name: formData.business_name,
          business_address: formData.business_address,
          business_phone: formData.business_phone,
          avatar: user?.profile?.avatar || '',
          preferences: user?.profile?.preferences || {},
          notifications: user?.profile?.notifications || {},
          created_at: user?.profile?.created_at || new Date(),
          updated_at: new Date()
        } as any
      });

      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      toast({
        title: 'Update failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      first_name: user?.profile?.first_name || '',
      last_name: user?.profile?.last_name || '',
      bio: user?.profile?.bio || '',
      location: user?.profile?.location || '',
      business_name: user?.profile?.business_name || '',
      business_address: user?.profile?.business_address || '',
      business_phone: user?.profile?.business_phone || ''
    });
    setIsEditing(false);
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case UserRole.AGENT:
        return 'bg-blue-100 text-blue-800';
      case UserRole.VENDOR:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-brand-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={user.profile?.avatar} alt={user.name || ''} />
                <AvatarFallback className="bg-white/20 text-white text-2xl">
                  {user.name?.charAt(0)?.toUpperCase() || user.email.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-white text-primary hover:bg-gray-100"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-heading font-bold mb-2">
                {user.name || 'User Profile'}
              </h1>
              <p className="text-white/90 mb-4">{user.email}</p>
              <div className="flex items-center space-x-3">
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </div>

            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-white text-primary hover:bg-gray-100"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-primary" />
                      <span>Personal Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange('first_name', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => handleInputChange('last_name', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleInputChange('location', value)}
                        disabled={!isEditing}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select your location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lagos">Lagos</SelectItem>
                          <SelectItem value="abuja">Abuja</SelectItem>
                          <SelectItem value="kano">Kano</SelectItem>
                          <SelectItem value="ibadan">Ibadan</SelectItem>
                          <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        disabled={!isEditing}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Business Information */}
                {(user.role === UserRole.VENDOR || user.role === UserRole.AGENT) && (
                  <Card className="border-0 shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Building className="w-5 h-5 text-primary" />
                        <span>Business Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="businessName">Business Name</Label>
                        <Input
                          id="businessName"
                          value={formData.business_name}
                          onChange={(e) => handleInputChange('businessName', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessAddress">Business Address</Label>
                        <Input
                          id="businessAddress"
                          value={formData.business_address}
                          onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="businessPhone">Business Phone</Label>
                        <Input
                          id="businessPhone"
                          value={formData.business_phone}
                          onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                          disabled={!isEditing}
                          className="mt-1"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Heart, title: 'Favorites', count: '12', color: 'text-red-500' },
                  { icon: ShoppingCart, title: 'Orders', count: '8', color: 'text-blue-500' },
                  { 
                    icon: MessageSquare, 
                    title: 'Messages', 
                    count: messageStats.totalCount.toString(), 
                    unread: messageStats.unreadCount,
                    color: 'text-green-500',
                    link: '/messages'
                  },
                  { icon: Calendar, title: 'Appointments', count: '3', color: 'text-purple-500' }
                ].map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className={`border-0 shadow-md ${stat.link ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
                            onClick={stat.link ? () => window.location.href = stat.link : undefined}>
                        <CardContent className="p-6 text-center">
                          <div className="relative">
                            <Icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                            {stat.unread && stat.unread > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {stat.unread}
                              </span>
                            )}
                          </div>
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {stat.count}
                          </div>
                          <div className="text-gray-600">{stat.title}</div>
                          {stat.unread && stat.unread > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                              {stat.unread} unread
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: 'Viewed property', item: 'Luxury Villa in Lekki', time: '2 hours ago' },
                        { action: 'Added to favorites', item: 'Executive Office Desk', time: '1 day ago' },
                        { action: 'Placed order', item: 'Fresh Tomatoes (10 baskets)', time: '3 days ago' },
                        { action: 'Sent inquiry', item: 'Restaurant Interior Design', time: '1 week ago' }
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.item}</p>
                          </div>
                          <span className="text-sm text-gray-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Messages</CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.location.href = '/messages'}
                    >
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {messageStats.recentMessages.length > 0 ? (
                        messageStats.recentMessages.map((message: any, index: number) => (
                          <div key={index} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {message.subject}
                                </p>
                                {message.status === 'unread' && (
                                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600">
                                From: {message.sender_name || message.sender_email || 'Unknown'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {message.message}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(message.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p>No recent messages</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5 text-primary" />
                    <span>Preferences</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium">Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger className="mt-2">
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

                  <div>
                    <Label className="text-base font-medium">Currency</Label>
                    <Select defaultValue="ngn">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ngn">Nigerian Naira (₦)</SelectItem>
                        <SelectItem value="usd">US Dollar ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Time Zone</Label>
                    <Select defaultValue="wat">
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wat">West Africa Time (WAT)</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-primary" />
                    <span>Notifications</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'Email notifications', description: 'Receive updates via email' },
                    { label: 'SMS notifications', description: 'Receive updates via SMS' },
                    { label: 'Property alerts', description: 'Get notified about new properties' },
                    { label: 'Order updates', description: 'Get notified about order status' },
                    { label: 'Marketing emails', description: 'Receive promotional content' }
                  ].map((notification, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{notification.label}</p>
                        <p className="text-sm text-gray-600">{notification.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={index < 3}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        title={`Toggle ${notification.label}`}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <span>Security Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                      <Button className="btn-primary">Update Password</Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                    <p className="text-gray-600 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-medium text-gray-900 mb-2">Login Sessions</h3>
                    <p className="text-gray-600 mb-4">
                      Manage your active login sessions
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Current Session</p>
                          <p className="text-sm text-gray-600">Lagos, Nigeria • Chrome</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
