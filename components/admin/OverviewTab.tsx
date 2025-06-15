'use client';

import React from 'react';
import { 
  Users, 
  Home, 
  ShoppingCart, 
  Package, 
  Bell,
  DollarSign
} from 'lucide-react';

interface OverviewTabProps {
  data: {
    stats: {
      totalUsers: number;
      totalProperties: number;
      totalOrders: number;
      totalRevenue: number;
      pendingInquiries: number;
      activeProjects: number;
    };
    recentActivity: any[];
    analytics: {
      userGrowth: number[];
      orderTrends: number[];
      popularServices: any[];
    };
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{data.stats.totalUsers}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Total Users</h3>
          <p className="text-sm text-success">+12% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{data.stats.totalProperties}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Properties Listed</h3>
          <p className="text-sm text-success">+8% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-accent" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{data.stats.totalOrders}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Total Orders</h3>
          <p className="text-sm text-success">+15% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-link bg-opacity-10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-link" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{formatCurrency(data.stats.totalRevenue)}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Total Revenue</h3>
          <p className="text-sm text-success">+22% from last month</p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning bg-opacity-10 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-warning" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{data.stats.pendingInquiries}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Pending Inquiries</h3>
          <p className="text-sm text-warning">Requires attention</p>
        </div>

        <div className="bg-white rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-success" />
            </div>
            <span className="text-2xl font-bold text-text-primary">{data.stats.activeProjects}</span>
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Active Projects</h3>
          <p className="text-sm text-success">On track</p>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.analytics.userGrowth.map((value: number, index: number) => (
              <div key={index} className="flex-1 bg-primary bg-opacity-20 rounded-t flex items-end">
                <div 
                  className="w-full bg-primary rounded-t transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${Math.max((value / Math.max(...data.analytics.userGrowth)) * 100, 5)}%`,
                    animationDelay: `${index * 100}ms`
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-light">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Order Trends</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.analytics.orderTrends.map((value: number, index: number) => (
              <div key={index} className="flex-1 bg-secondary bg-opacity-20 rounded-t flex items-end">
                <div 
                  className="w-full bg-secondary rounded-t transition-all duration-1000 ease-out"
                  style={{ 
                    height: `${Math.max((value / Math.max(...data.analytics.orderTrends)) * 100, 5)}%`,
                    animationDelay: `${index * 150}ms`
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-text-light">
            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, index) => (
              <span key={index}>{month}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity & Popular Services */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {data.recentActivity.length > 0 ? data.recentActivity.map((activity, index) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {activity.type === 'new_user' && <Users className="w-4 h-4 text-primary" />}
                  {activity.type === 'new_order' && <ShoppingCart className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-text-primary text-sm">{activity.title}</p>
                  <p className="text-text-light text-xs">{activity.description}</p>
                  <p className="text-text-light text-xs mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-text-light text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Popular Services</h3>
          <div className="space-y-4">
            {data.analytics.popularServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-text-primary">{service.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${service.value}%`,
                        animationDelay: `${index * 200}ms`
                      }}
                    />
                  </div>
                  <span className="text-sm text-text-light w-8 text-right">{service.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
