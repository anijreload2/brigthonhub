'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Store, Home, Utensils, Briefcase, 
  PlusCircle, Edit, Eye, Clock, 
  CheckCircle, XCircle, ArrowLeft,
  MessageSquare, BarChart3, Settings,
  Image as ImageIcon, Mail, Phone
} from 'lucide-react';
import VendorImageManager from '@/components/vendor/VendorImageManager';

interface VendorApplication {
  id: string;
  categories: string[];
  business_name: string;
  business_description: string;
  contact_email: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;
}

interface VendorListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  currency: string;
  location: string;
  status: 'active' | 'inactive' | 'sold' | 'expired';
  images: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
}

interface VendorStats {
  total_listings: number;
  active_listings: number;
  total_contacts: number;
  pending_messages: number;
}

interface VendorMessage {
  id: string;
  sender_name: string;
  sender_email: string;
  sender_phone?: string;
  subject: string;
  message: string;
  content_type: string;
  content_id?: string;
  status: string;
  created_at: string;
}

const VENDOR_CATEGORIES = {
  property: { name: 'Property Agent', icon: Home, color: 'blue' },
  food: { name: 'Food Vendor', icon: Utensils, color: 'green' },
  marketplace: { name: 'Marketplace Seller', icon: Store, color: 'purple' },
  projects: { name: 'Service Provider', icon: Briefcase, color: 'orange' }
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const router = useRouter();  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [messages, setMessages] = useState<VendorMessage[]>([]);
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Redirect if not logged in or not a vendor
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/vendor/dashboard');
      return;
    }
    
    if (user.role !== UserRole.VENDOR && user.role !== UserRole.ADMIN) {
      router.push('/vendor/register');
      return;
    }

    fetchVendorData();
  }, [user, router]);

  const fetchVendorData = async () => {
    if (!user) return;

    try {
      // Fetch vendor applications
      const { data: applicationsData, error: appsError } = await supabase
        .from('vendor_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (appsError) throw appsError;
      setApplications(applicationsData || []);      // Fetch vendor listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('vendor_listings')
        .select('*')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

      if (listingsError) {
        console.error('Error fetching listings:', listingsError);
      } else {
        setListings(listingsData || []);
      }      // Fetch vendor messages directly from Supabase
      try {
        console.log('🔍 Fetching messages for vendor ID:', user.id);
        
        const { data: messagesData, error: messagesError } = await supabase
          .from('contact_messages')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });        if (messagesError) {
          console.error('❌ Error fetching messages:', messagesError);
          console.error('Error details:', messagesError.message, messagesError.code, messagesError.hint);
          setMessages([]);        } else {
          console.log('✅ Successfully fetched messages count:', messagesData?.length || 0);
          console.log('📋 Messages data:', messagesData);
          setMessages(messagesData || []);
          
          // Calculate stats with the fetched messages
          const totalListings = listingsData?.length || 0;
          const activeListings = listingsData?.filter(l => l.status === 'active').length || 0;
          const unreadMessages = messagesData?.filter((m: VendorMessage) => m.status === 'unread').length || 0;
          const totalMessages = messagesData?.length || 0;

          console.log('📊 Stats calculation:');
          console.log('  Total listings:', totalListings);
          console.log('  Active listings:', activeListings);
          console.log('  Total messages:', totalMessages);
          console.log('  Unread messages:', unreadMessages);

          setStats({
            total_listings: totalListings,
            active_listings: activeListings,
            total_contacts: totalMessages,
            pending_messages: unreadMessages
          });        }
      } catch (error) {
        console.error('❌ Unexpected error fetching messages:', error);
        setMessages([]);
        
        // Set basic stats even if messages failed to load
        const totalListings = listingsData?.length || 0;
        const activeListings = listingsData?.filter(l => l.status === 'active').length || 0;
        
        setStats({
          total_listings: totalListings,
          active_listings: activeListings,
          total_contacts: 0,
          pending_messages: 0
        });
      }

    } catch (error) {
      console.error('Error fetching vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };  const markAsRead = async (messageId: string) => {
    try {
      console.log('📧 Marking message as read:', messageId);
      
      if (!user) {
        console.error('❌ No user found');
        alert('Please log in to mark messages as read.');
        return;
      }
      
      // Update message status directly via Supabase
      const { data, error } = await supabase
        .from('contact_messages')
        .update({ status: 'read' })
        .eq('id', messageId)
        .eq('recipient_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Database error:', error);
        alert('Failed to mark message as read. Please try again.');
        return;
      }
      
      if (!data) {
        console.error('❌ Message not found or unauthorized');
        alert('Message not found or you are not authorized to mark it as read.');
        return;
      }
      
      console.log('✅ Message marked as read successfully');
      
      // Update local state
      const updatedMessages = messages.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'read' }
          : msg
      );
      
      setMessages(updatedMessages);
      
      // Update pending messages count based on updated messages
      const unreadCount = updatedMessages.filter(m => m.status === 'unread').length;
      setStats(prev => prev ? { ...prev, pending_messages: unreadCount } : null);
      
      console.log('✅ Message marked as read, new unread count:', unreadCount);
      
    } catch (error) {
      console.error('❌ Error marking message as read:', error);
      alert('Error marking message as read. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your vendor dashboard...</p>
        </div>
      </div>
    );
  }

  const approvedCategories = applications
    .filter(app => app.status === 'approved')
    .flatMap(app => app.categories);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/profile')}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
                <p className="text-gray-600">
                  Welcome back, {user?.name || user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/vendor/register')}
                className="hidden sm:flex"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Apply for New Category
              </Button>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'overview' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 inline mr-3" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    activeTab === 'applications' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Clock className="w-4 h-4 inline mr-3" />
                  Applications
                </button>                {approvedCategories.length > 0 && (
                  <>
                    <button
                      onClick={() => setActiveTab('listings')}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeTab === 'listings' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Store className="w-4 h-4 inline mr-3" />
                      My Listings
                    </button>
                    <button
                      onClick={() => setActiveTab('images')}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeTab === 'images' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <ImageIcon className="w-4 h-4 inline mr-3" />
                      Image Management
                    </button>
                    <button
                      onClick={() => setActiveTab('messages')}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        activeTab === 'messages' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4 inline mr-3" />
                      Messages
                      {stats?.pending_messages && stats.pending_messages > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {stats.pending_messages}
                        </span>
                      )}
                    </button>
                  </>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Store className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Total Listings</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.total_listings}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Active Listings</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.active_listings}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <MessageSquare className="w-8 h-8 text-purple-600" />
                        </div>                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Total Messages</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.total_contacts}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <Eye className="w-8 h-8 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-600">Pending Messages</p>
                          <p className="text-2xl font-semibold text-gray-900">
                            {stats.pending_messages}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Approved Categories */}
                {approvedCategories.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Your Active Vendor Categories
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {approvedCategories.map((categoryId, index) => {
                        const category = VENDOR_CATEGORIES[categoryId as keyof typeof VENDOR_CATEGORIES];
                        if (!category) return null;
                        
                        const Icon = category.icon;
                        return (
                          <div key={`${categoryId}-${index}`} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3">
                              <Icon className={`w-8 h-8 text-${category.color}-600`} />
                              <div>
                                <h3 className="font-medium text-gray-900">{category.name}</h3>
                                <p className="text-sm text-gray-600">Status: Active</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={() => router.push('/vendor/register')}
                    >
                      <PlusCircle className="w-6 h-6" />
                      <span>Apply for New Category</span>
                    </Button>                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      disabled={approvedCategories.length === 0}
                      onClick={() => router.push('/vendor/listings/create')}
                    >
                      <Edit className="w-6 h-6" />
                      <span>Create New Listing</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      disabled
                    >
                      <MessageSquare className="w-6 h-6" />
                      <span>Check Messages</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'applications' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Vendor Applications</h2>
                  <p className="text-gray-600 mt-1">Track the status of your vendor category applications</p>
                </div>
                <div className="p-6">
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                      <p className="text-gray-600 mb-4">
                        You haven't submitted any vendor applications yet.
                      </p>
                      <Button onClick={() => router.push('/vendor/register')}>
                        Apply to Become a Vendor
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {getStatusIcon(application.status)}
                                <h3 className="text-lg font-medium text-gray-900">
                                  {application.business_name}
                                </h3>
                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(application.status)}`}>
                                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-gray-600 mb-3">{application.business_description}</p>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {application.categories.map((categoryId) => {
                                  const category = VENDOR_CATEGORIES[categoryId as keyof typeof VENDOR_CATEGORIES];
                                  if (!category) return null;
                                  
                                  return (
                                    <span key={categoryId} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                      {category.name}
                                    </span>
                                  );
                                })}
                              </div>
                              <div className="text-sm text-gray-500">
                                <p>Submitted: {new Date(application.submitted_at).toLocaleDateString()}</p>
                                {application.reviewed_at && (
                                  <p>Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</p>
                                )}
                              </div>
                              {application.admin_notes && (
                                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                                  <p className="text-sm font-medium text-gray-900">Admin Notes:</p>
                                  <p className="text-sm text-gray-700">{application.admin_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}            {activeTab === 'listings' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
                      <p className="text-gray-600 mt-1">Manage your product and service listings</p>
                    </div>
                    <Button 
                      onClick={() => router.push('/vendor/listings/create')}
                      disabled={approvedCategories.length === 0}
                    >
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Create Listing
                    </Button>
                  </div>
                </div>

                <div className="p-6">
                  {listings.length === 0 ? (
                    <div className="text-center py-12">
                      <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Listings Yet</h3>
                      <p className="text-gray-600 mb-4">
                        Create your first listing to start showcasing your products or services.
                      </p>
                      <Button 
                        onClick={() => router.push('/vendor/listings/create')}
                        disabled={approvedCategories.length === 0}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Your First Listing
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {listings.map((listing) => {
                        const categoryInfo = VENDOR_CATEGORIES[listing.category as keyof typeof VENDOR_CATEGORIES];
                        const IconComponent = categoryInfo?.icon || Store;
                        
                        return (
                          <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {/* Listing Image */}
                            <div className="h-48 bg-gray-200 overflow-hidden">
                              {listing.images && listing.images.length > 0 ? (
                                <img 
                                  src={listing.images[0]} 
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-image.jpg';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  <IconComponent className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                            
                            {/* Listing Info */}
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{listing.title}</h4>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${categoryInfo?.color || 'gray'}-100 text-${categoryInfo?.color || 'gray'}-800`}>
                                      <IconComponent className="w-3 h-3 mr-1" />
                                      {categoryInfo?.name || listing.category}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      listing.status === 'active' ? 'bg-green-100 text-green-800' :
                                      listing.status === 'sold' ? 'bg-purple-100 text-purple-800' :
                                      listing.status === 'expired' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {listing.status}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {listing.price && (
                                <p className="text-lg font-bold text-green-600 mb-2">
                                  {new Intl.NumberFormat('en-NG', {
                                    style: 'currency',
                                    currency: listing.currency || 'NGN',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(listing.price)}
                                </p>
                              )}
                              
                              {listing.location && (
                                <p className="text-sm text-gray-600 mb-2">{listing.location}</p>
                              )}
                              
                              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                              
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span className="flex items-center">
                                  <Eye className="w-4 h-4 mr-1" />
                                  {listing.view_count || 0} views
                                </span>
                                <span>
                                  {new Date(listing.created_at).toLocaleDateString()}
                                </span>
                              </div>
                                {/* Action Buttons */}
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => router.push(`/vendor/listings/edit/${listing.id}`)}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => router.push(`/properties/vendor_${listing.id}`)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}{activeTab === 'images' && (
              <VendorImageManager 
                vendorId={user?.id || ''} 
                vendorCategories={approvedCategories}
              />
            )}            {activeTab === 'messages' && (
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
                      <p className="text-gray-600 mt-1">Customer inquiries about your listings</p>
                    </div>
                    {stats?.pending_messages && stats.pending_messages > 0 && (
                      <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded-full">
                        {stats.pending_messages} unread
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Messages Yet</h3>
                      <p className="text-gray-600">
                        When customers send you messages about your listings, they'll appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                            message.status === 'unread' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-1">
                                <h4 className="font-semibold text-gray-900">{message.subject}</h4>
                                {message.status === 'unread' && (
                                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>From: {message.sender_name}</span>
                                <span>•</span>
                                <span>{message.sender_email}</span>
                                {message.sender_phone && (
                                  <>
                                    <span>•</span>
                                    <span>{message.sender_phone}</span>
                                  </>
                                )}
                              </div>                              <div className="text-sm text-gray-500 mt-1">
                                {new Date(message.created_at).toLocaleDateString()} at {new Date(message.created_at).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          
                          <div className="mb-3">
                            <p className="text-gray-700 leading-relaxed">{message.message}</p>
                          </div>
                          
                          {message.content_type && message.content_type !== 'general' && (
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <span className="capitalize">{message.content_type}</span>
                              {message.content_id && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>Inquiry about listing</span>
                                </>
                              )}
                            </div>
                          )}
                          
                          <div className="flex space-x-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.location.href = `mailto:${message.sender_email}?subject=Re: ${message.subject}`}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Reply by Email
                            </Button>
                            {message.sender_phone && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.location.href = `tel:${message.sender_phone}`}
                              >
                                <Phone className="w-4 h-4 mr-1" />
                                Call
                              </Button>
                            )}
                            {message.status === 'unread' && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => markAsRead(message.id)}
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
