'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  MessageCircle, Users, Store, TrendingUp, 
  Mail, Calendar, Activity, Award 
} from 'lucide-react';

interface AnalyticsData {
  totalMessages: number;
  totalVendorApplications: number;
  pendingApplications: number;
  approvedVendors: number;
  messagesByType: Array<{ type: string; count: number; color: string }>;
  messagesOverTime: Array<{ date: string; messages: number }>;
  applicationsByCategory: Array<{ category: string; count: number }>;
  responseRates: {
    averageResponseTime: string;
    responseRate: number;
  };
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeframe]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      startDate.setDate(endDate.getDate() - days);

      // Fetch total messages
      const { count: totalMessages } = await supabase
        .from('contact_messages')
        .select('*', { count: 'exact', head: true });

      // Fetch vendor applications data
      const { data: applications } = await supabase
        .from('vendor_applications')
        .select('status, categories, created_at');

      const totalVendorApplications = applications?.length || 0;
      const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0;
      const approvedVendors = applications?.filter(app => app.status === 'approved').length || 0;

      // Messages by type
      const { data: messageTypes } = await supabase
        .from('contact_messages')
        .select('item_type')
        .gte('created_at', startDate.toISOString());

      const typeCount = (messageTypes || []).reduce((acc: Record<string, number>, msg) => {
        acc[msg.item_type] = (acc[msg.item_type] || 0) + 1;
        return acc;
      }, {});

      const messagesByType = Object.entries(typeCount).map(([type, count], index) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number,
        color: COLORS[index % COLORS.length]
      }));

      // Messages over time (daily for the selected period)
      const { data: messagesOverTime } = await supabase
        .from('contact_messages')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at');

      const dailyMessages = (messagesOverTime || []).reduce((acc: Record<string, number>, msg) => {
        const date = new Date(msg.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});

      const messagesTimeData = Object.entries(dailyMessages)
        .map(([date, messages]) => ({ 
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), 
          messages: messages as number 
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Applications by category
      const categoryCount = (applications || []).reduce((acc: Record<string, number>, app) => {
        (app.categories || []).forEach((category: string) => {
          acc[category] = (acc[category] || 0) + 1;
        });
        return acc;
      }, {});

      const applicationsByCategory = Object.entries(categoryCount).map(([category, count]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        count: count as number
      }));

      setData({
        totalMessages: totalMessages || 0,
        totalVendorApplications,
        pendingApplications,
        approvedVendors,
        messagesByType,
        messagesOverTime: messagesTimeData,
        applicationsByCategory,
        responseRates: {
          averageResponseTime: '2.4 hours', // Mock data - would calculate from actual response times
          responseRate: 87 // Mock data - would calculate from actual response data
        }
      });
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-gray-500 py-8">No analytics data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalMessages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendor Applications</p>
                <p className="text-2xl font-bold text-gray-900">{data.totalVendorApplications}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Store className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Vendors</p>
                <p className="text-2xl font-bold text-gray-900">{data.approvedVendors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold text-gray-900">{data.responseRates.responseRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages by Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Messages by Content Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.messagesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.type}: ${entry.count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.messagesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Applications by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="mr-2 h-5 w-5" />
              Vendor Applications by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.applicationsByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Messages Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              Message Activity Over Time
            </div>            <select 
              value={timeframe} 
              onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
              className="border rounded px-3 py-1 text-sm"
              aria-label="Select time frame for analytics"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.messagesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="messages" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
