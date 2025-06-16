'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { 
  Clock, CheckCircle, XCircle, Eye, 
  Store, Home, Utensils, Briefcase,
  Search, Filter, Calendar
} from 'lucide-react';

interface VendorApplication {
  id: string;
  user_id: string;
  categories: string[];
  business_name: string;
  business_description: string;
  contact_email: string;
  contact_phone: string;
  business_address: string;
  website?: string;
  experience?: string;
  certifications?: string;
  contact_preferences: Record<string, boolean>;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: string;
  reviewed_at?: string;
  admin_notes?: string;  // User data from join
  users?: {
    name?: string;
    email: string;
  };
}

const VENDOR_CATEGORIES = {
  property: { name: 'Property Agent', icon: Home, color: 'text-blue-600' },
  food: { name: 'Food Vendor', icon: Utensils, color: 'text-green-600' },
  marketplace: { name: 'Marketplace Seller', icon: Store, color: 'text-purple-600' },
  projects: { name: 'Service Provider', icon: Briefcase, color: 'text-orange-600' }
};

const STATUS_FILTERS = [
  { value: 'all', label: 'All Applications' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
];

export default function VendorApplicationsTab() {
  const [applications, setApplications] = useState<VendorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState<VendorApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);
  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('vendor_applications')
        .select(`
          *,
          users:user_id (
            name, 
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewApplication = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setIsReviewing(true);
    try {
      const { error: updateError } = await supabase
        .from('vendor_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: reviewNotes || null
        })
        .eq('id', applicationId);

      if (updateError) throw updateError;

      // If approved, update user role to VENDOR
      if (newStatus === 'approved') {
        const application = applications.find(app => app.id === applicationId);
        if (application) {
          const { error: userError } = await supabase
            .from('users')
            .update({ role: 'VENDOR' })
            .eq('id', application.user_id);

          if (userError) throw userError;
        }
      }

      // Refresh applications list
      await fetchApplications();
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error reviewing application:', error);
    } finally {
      setIsReviewing(false);
    }
  };
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.users?.name && app.users.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

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
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Applications</h2>
        <p className="text-gray-600">Review and manage vendor registration applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {STATUS_FILTERS.slice(1).map((filter) => {
          const count = applications.filter(app => app.status === filter.value).length;
          return (
            <div key={filter.value} className="bg-white rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{filter.label}</p>
                  <p className="text-2xl font-semibold text-gray-900">{count}</p>
                </div>
                {getStatusIcon(filter.value)}
              </div>
            </div>
          );
        })}
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-2xl font-semibold text-gray-900">{applications.length}</p>
            </div>
            <Store className="w-5 h-5 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by business name, email, or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Filter applications by status"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredApplications.length === 0 ? (
          <div className="p-12 text-center">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' ? 'No vendor applications have been submitted yet.' : `No ${statusFilter} applications found.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredApplications.map((application) => (
              <div key={application.id} className="p-6 hover:bg-gray-50">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">                      <div>
                        <p className="text-sm text-gray-600">Applicant</p>
                        <p className="font-medium">{application.users?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{application.contact_email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Categories</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.categories.map((categoryId) => {
                            const category = VENDOR_CATEGORIES[categoryId as keyof typeof VENDOR_CATEGORIES];
                            if (!category) return null;
                            
                            const Icon = category.icon;
                            return (
                              <span key={categoryId} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                <Icon className={`w-3 h-3 mr-1 ${category.color}`} />
                                {category.name}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">{application.business_description}</p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Submitted: {new Date(application.submitted_at).toLocaleDateString()}
                      </div>
                      {application.reviewed_at && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {application.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-900">Admin Notes:</p>
                        <p className="text-sm text-gray-700">{application.admin_notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Review Application: {selectedApplication.business_name}
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.contact_phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Website</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.website || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_address}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Business Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedApplication.business_description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Categories</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedApplication.categories.map((categoryId) => {
                    const category = VENDOR_CATEGORIES[categoryId as keyof typeof VENDOR_CATEGORIES];
                    if (!category) return null;
                    
                    const Icon = category.icon;
                    return (
                      <span key={categoryId} className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        <Icon className={`w-4 h-4 mr-2 ${category.color}`} />
                        {category.name}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              {selectedApplication.experience && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Experience</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.experience}</p>
                </div>
              )}
              
              {selectedApplication.certifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Certifications</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedApplication.certifications}</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes (Optional)</label>
                <Textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about this review decision..."
                  rows={3}
                />
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedApplication(null);
                  setReviewNotes('');
                }}
              >
                Cancel
              </Button>
              {selectedApplication.status === 'pending' && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => reviewApplication(selectedApplication.id, 'rejected')}
                    disabled={isReviewing}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => reviewApplication(selectedApplication.id, 'approved')}
                    disabled={isReviewing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
