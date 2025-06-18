'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Home, 
  ShoppingCart, 
  Package, 
  FileText, 
  Settings, 
  Eye,
  Download,
  Image,
  Brain,
  Layers
} from 'lucide-react';
import { useAuth } from '../auth/auth-provider';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import OverviewTab from './OverviewTab';
import UsersTab from './UsersTab';
import PropertiesTab from './PropertiesTab';
import FoodTab from './FoodTab';
import MarketplaceTab from './MarketplaceTab';
import ProjectsTab from './ProjectsTab';
import BlogTab from './BlogTab';
import SettingsTab from './SettingsTab';
import TestimonialsTab from './TestimonialsTab';
import VendorApplicationsTab from './VendorApplicationsTab';
import HeroTab from './HeroTab';
import AITrainingTab from './AITrainingTab';
import DetailsTab from './DetailsTab';
import AnalyticsTab from './AnalyticsTab';
import ImageManagementTab from './ImageManagementTab';
import AdminModal from './AdminModal';

const AdminDashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view'>('add');
  const [modalData, setModalData] = useState<any>(null);
  const [modalTable, setModalTable] = useState<string>('');

  // Refresh data callback
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Modal handlers
  const handleAdd = (table: string) => {
    setModalTable(table);
    setModalType('add');
    setModalData(null);
    setShowModal(true);
  };

  const handleEdit = (table: string, data: any) => {
    setModalTable(table);
    setModalType('edit');
    setModalData(data);
    setShowModal(true);
  };

  const handleView = (table: string, data: any) => {
    setModalTable(table);
    setModalType('view');
    setModalData(data);
    setShowModal(true);
  };  const handleDelete = async (table: string, id: string, refreshCallback?: () => void) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        console.log(`🗑️ Attempting to delete from ${table} with ID: ${id}`);
        
        if (table === 'users') {
          // For users, we need to delete both user and user_profile (handled by CASCADE)
          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('❌ Error deleting user:', error);
            alert(`Error deleting user: ${error.message}`);
          } else {
            console.log('✅ User deleted successfully');
            alert('User deleted successfully!');
            refreshData();
          }        } else {
          // Regular deletion for other tables
          console.log(`🔍 Before delete - checking ${table} with ID: ${id}`);
          
          // First, verify the record exists
          const { data: beforeDelete, error: checkError } = await supabase
            .from(table)
            .select('*')
            .eq('id', id);
          
          if (checkError) {
            console.error(`❌ Error checking record before delete:`, checkError);
          } else {
            console.log(`📋 Record before delete:`, beforeDelete);
          }

          // Now attempt deletion
          const { data, error } = await supabase
            .from(table)
            .delete()
            .eq('id', id)
            .select(); // Add select to see what was deleted

          if (error) {
            console.error(`❌ Error deleting from ${table}:`, error);
            alert(`Error deleting item: ${error.message}`);
          } else {
            console.log(`✅ Successfully deleted from ${table}:`, data);
            
            // Verify the record is actually gone
            const { data: afterDelete, error: verifyError } = await supabase
              .from(table)
              .select('*')
              .eq('id', id);
            
            if (verifyError) {
              console.error(`❌ Error verifying deletion:`, verifyError);
            } else {
              console.log(`🔍 Records with same ID after delete:`, afterDelete);
              if (afterDelete && afterDelete.length > 0) {
                console.error(`🚨 PROBLEM: Record still exists after deletion!`);
              } else {
                console.log(`✅ Confirmed: Record successfully deleted`);
              }
            }
            
            alert('Item deleted successfully');
            refreshData();
          }
        }
      } catch (error) {
        console.error(`💥 Exception while deleting from ${table}:`, error);
        alert('Error deleting item');
      }
    }
  };

  // Create wrapper functions for tab components
  const createDeleteHandler = (table: string) => (data: any) => {
    console.log('Delete handler called with table:', table);
    console.log('Delete handler called with data:', data);
    
    // Handle both cases: data object with id property, or just the id string
    const id = typeof data === 'string' ? data : data?.id;
    console.log('Extracted ID:', id);
    
    if (!id) {
      console.error('No ID found in data:', data);
      alert('Error: No ID found for deletion');
      return;
    }
    
    handleDelete(table, id);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
    setModalTable('');
  };

  // Admin dashboard data
  const [adminData, setAdminData] = useState({
    stats: {
      totalUsers: 0,
      totalProperties: 0,
      totalOrders: 0,
      totalRevenue: 0,
      pendingInquiries: 0,
      activeProjects: 0
    },
    recentActivity: [] as any[],
    analytics: {
      userGrowth: [] as number[],
      orderTrends: [] as number[],
      popularServices: [] as any[]
    }
  });

  useEffect(() => {
    // Don't redirect while authentication is still loading
    if (authLoading) {
      return;
    }

    // Check if user is authenticated
    if (!user) {
      router.push('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        setLoading(true);
        
        // Fetch real data from Supabase tables
        const [
          usersResult,
          propertiesResult,
          foodOrdersResult,
          storeOrdersResult,
          projectsResult,
          blogPostsResult
        ] = await Promise.all([
          supabase.from('user_profiles').select('*'),
          supabase.from('properties').select('*'),
          supabase.from('food_orders').select('*'),
          supabase.from('store_orders').select('*'),
          supabase.from('projects').select('*'),
          supabase.from('blog_posts').select('*')
        ]);

        // Calculate stats from real data
        const totalUsers = usersResult.data?.length || 0;
        const totalProperties = propertiesResult.data?.length || 0;
        const totalFoodOrders = foodOrdersResult.data?.length || 0;
        const totalStoreOrders = storeOrdersResult.data?.length || 0;
        const totalOrders = totalFoodOrders + totalStoreOrders;
        const totalBlogPosts = blogPostsResult.data?.length || 0;
          // Calculate total revenue from orders
        const foodRevenue = foodOrdersResult.data?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;
        const storeRevenue = storeOrdersResult.data?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;
        const totalRevenue = foodRevenue + storeRevenue;

        // Get recent activity from multiple sources
        const recentActivity = [
          ...(usersResult.data?.slice(-3).map((user: any) => ({
            id: `user-${user.id}`,
            type: 'new_user',
            title: 'New user registration',
            description: `${user.email} registered`,
            timestamp: user.created_at
          })) || []),
          ...(foodOrdersResult.data?.slice(-2).map((order: any) => ({
            id: `food-${order.id}`,
            type: 'new_order',
            title: 'New food order',
            description: `Order #${order.orderNumber} - ₦${order.totalAmount?.toLocaleString()}`,
            timestamp: order.created_at
          })) || [])
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

        setAdminData({
          stats: {
            totalUsers,
            totalProperties,
            totalOrders,
            totalRevenue,
            pendingInquiries: 0,
            activeProjects: projectsResult.data?.filter((p: any) => p.status === 'active').length || 0
          },
          recentActivity,
          analytics: {
            userGrowth: [120, 135, 148, 162, 178, 195, totalUsers],
            orderTrends: [45, 52, 48, 61, 55, 67, totalOrders],
            popularServices: [
              { name: 'Real Estate', value: Math.round((totalProperties / (totalProperties + totalOrders + totalBlogPosts + 1)) * 100) },
              { name: 'Food Services', value: Math.round((totalFoodOrders / (totalProperties + totalOrders + totalBlogPosts + 1)) * 100) },
              { name: 'Marketplace', value: Math.round((totalStoreOrders / (totalProperties + totalOrders + totalBlogPosts + 1)) * 100) },
              { name: 'Blog Posts', value: Math.round((totalBlogPosts / (totalProperties + totalOrders + totalBlogPosts + 1)) * 100) }
            ]
          }
        });
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Fallback to mock data if there's an error
        setAdminData({
          stats: {
            totalUsers: 0,
            totalProperties: 0,
            totalOrders: 0,
            totalRevenue: 0,
            pendingInquiries: 0,
            activeProjects: 0
          },
          recentActivity: [],
          analytics: {
            userGrowth: [0],
            orderTrends: [0],
            popularServices: []
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [user, router, authLoading]);  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'images', label: 'Image Management', icon: Image },
    { id: 'hero', label: 'Hero Sections', icon: Image },    { id: 'details', label: 'Detail Pages', icon: Layers },    { id: 'users', label: 'User Management', icon: Users },
    { id: 'vendor-applications', label: 'Vendor Applications', icon: Users },
    { id: 'properties', label: 'Properties', icon: Home },
    { id: 'food', label: 'Food Services', icon: ShoppingCart },
    { id: 'marketplace', label: 'Marketplace', icon: Package },
    { id: 'projects', label: 'Projects', icon: Package },
    { id: 'blog', label: 'Blog & Content', icon: FileText },
    { id: 'testimonials', label: 'Testimonials', icon: Users },
    { id: 'ai-training', label: 'AI Training', icon: Brain },
    { id: 'settings', label: 'Site Settings', icon: Settings }
  ];

  // Show loading while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Admin Dashboard</h1>
              <p className="text-text-light">Brighton-Hedge Platform Management</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn btn-outline">
                <Download className="w-4 h-4" />
                Export Data
              </button>
              <a href="/" className="btn btn-primary">
                <Eye className="w-4 h-4" />
                View Site
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 sticky top-24">
              <nav className="space-y-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-white'
                        : 'text-text-light hover:bg-gray-100 hover:text-text-primary'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>          {/* Main Content */}
          <div className="lg:col-span-3">            {activeTab === 'overview' && <OverviewTab data={adminData} />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'images' && <ImageManagementTab />}
            {activeTab === 'hero' && <HeroTab onAdd={() => handleAdd('content_blocks')} onEdit={(data: any) => handleEdit('content_blocks', data)} onView={(data: any) => handleView('content_blocks', data)} onDelete={createDeleteHandler('content_blocks')} />}
            {activeTab === 'details' && <DetailsTab onAdd={() => handleAdd('details')} onEdit={(data: any) => handleEdit('details', data)} onView={(data: any) => handleView('details', data)} onDelete={createDeleteHandler('details')} />}            {activeTab === 'users' && <UsersTab key={refreshTrigger} onAdd={() => handleAdd('users')} onEdit={(data: any) => handleEdit('users', data)} onView={(data: any) => handleView('users', data)} onDelete={createDeleteHandler('users')} />}
            {activeTab === 'vendor-applications' && <VendorApplicationsTab key={refreshTrigger} />}
            {activeTab === 'properties' && <PropertiesTab key={refreshTrigger} onAdd={() => handleAdd('properties')} onEdit={(data: any) => handleEdit('properties', data)} onView={(data: any) => handleView('properties', data)} onDelete={createDeleteHandler('properties')} />}
            {activeTab === 'food' && <FoodTab key={refreshTrigger} onAdd={() => handleAdd('food_items')} onEdit={(data: any) => handleEdit('food_items', data)} onView={(data: any) => handleView('food_items', data)} onDelete={createDeleteHandler('food_items')} />}
            {activeTab === 'marketplace' && <MarketplaceTab key={refreshTrigger} onAdd={() => handleAdd('store_products')} onEdit={(data: any) => handleEdit('store_products', data)} onView={(data: any) => handleView('store_products', data)} onDelete={createDeleteHandler('store_products')} />}
            {activeTab === 'projects' && <ProjectsTab key={refreshTrigger} onAdd={() => handleAdd('projects')} onEdit={(data: any) => handleEdit('projects', data)} onView={(data: any) => handleView('projects', data)} onDelete={createDeleteHandler('projects')} />}
            {activeTab === 'blog' && <BlogTab key={refreshTrigger} onAdd={() => handleAdd('blog_posts')} onEdit={(data: any) => handleEdit('blog_posts', data)} onView={(data: any) => handleView('blog_posts', data)} onDelete={createDeleteHandler('blog_posts')} />}
            {activeTab === 'testimonials' && <TestimonialsTab key={refreshTrigger} onAdd={() => handleAdd('testimonials')} onEdit={(data: any) => handleEdit('testimonials', data)} onView={(data: any) => handleView('testimonials', data)} onDelete={createDeleteHandler('testimonials')} />}
            {activeTab === 'ai-training' && <AITrainingTab key={refreshTrigger} onAdd={() => handleAdd('ai_training_data')} onEdit={(data: any) => handleEdit('ai_training_data', data)} onView={(data: any) => handleView('ai_training_data', data)} onDelete={createDeleteHandler('ai_training_data')} />}
            {activeTab === 'settings' && <SettingsTab key={refreshTrigger} onAdd={() => handleAdd('site_settings')} onEdit={(data: any) => handleEdit('site_settings', data)} onView={(data: any) => handleView('site_settings', data)} onDelete={createDeleteHandler('site_settings')} />}
          </div>
        </div>
      </div>      {/* Modal */}
      {showModal && (
        <AdminModal
          isOpen={showModal}
          onClose={closeModal}
          type={modalType}
          table={modalTable}
          data={modalData}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
