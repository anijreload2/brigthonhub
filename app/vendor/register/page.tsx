'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/auth-provider';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Store, Home, Utensils, Briefcase } from 'lucide-react';

// Force dynamic rendering to avoid SSR issues
export const dynamic = 'force-dynamic';

const VENDOR_CATEGORIES = [
  {
    id: 'property',
    name: 'Property Agent',
    icon: Home,
    description: 'List and manage property sales, rentals, and real estate services',
    fields: ['Real Estate License', 'Agency Name', 'Service Areas']
  },
  {
    id: 'food',
    name: 'Food Vendor',
    icon: Utensils,
    description: 'Sell fresh produce, food products, and agricultural items',
    fields: ['Farm/Business Name', 'Product Categories', 'Certifications']
  },
  {
    id: 'marketplace',
    name: 'Marketplace Seller',
    icon: Store,
    description: 'Sell general merchandise, products, and retail items',
    fields: ['Business Name', 'Product Categories', 'Business Registration']
  },
  {
    id: 'projects',
    name: 'Service Provider',
    icon: Briefcase,
    description: 'Offer professional services, consulting, and project work',
    fields: ['Company Name', 'Service Categories', 'Professional Certifications']
  }
];

export default function VendorRegisterPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    contactEmail: '',
    contactPhone: '',
    businessAddress: '',
    website: '',
    experience: '',
    certifications: '',
    preferredContactMethods: {
      email: true,
      phone: true,
      whatsapp: false,
      platform_messages: true
    }
  });
    const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Redirect if not logged in
  if (!user) {
    router.push('/auth/login?redirect=/vendor/register');
    return null;
  }

  // Redirect if already a vendor
  if (user.role === UserRole.VENDOR) {
    router.push('/vendor/dashboard');
    return null;
  }
  const toggleCategory = (category_id: string) => {
    setSelectedCategories(prev => 
      prev.includes(category_id) 
        ? prev.filter(id => id !== category_id)
        : [...prev, category_id]
    );
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactPreferenceChange = (method: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      preferredContactMethods: {
        ...prev.preferredContactMethods,
        [method]: enabled
      }
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
        setLoading(true);
    e.preventDefault();
    if (selectedCategories.length === 0) {
      alert('Please select at least one vendor category');
      return;
    }

    setIsSubmitting(true);    try {
      // Get the current authenticated user token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Submit via API route
      const response = await fetch('/api/vendor-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          categories: selectedCategories,
          business_name: formData.businessName,
          business_description: formData.businessDescription,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          business_address: formData.businessAddress,
          website_url: formData.website,
          verification_data: {
            experience: formData.experience,
            certifications: formData.certifications,
            contact_preferences: formData.preferredContactMethods
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit application');
      }setIsSuccess(true);
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          router.push('/profile');
        }
      }, 3000);
    } catch (error) {

      alert('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
            setLoading(false);
    }
  };  if (isSuccess) {

    return (      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
          <p className="text-gray-600 mb-4">
            Your vendor application has been submitted successfully. Our admin team will review it and get back to you within 2-3 business days.
          </p>
          <p className="text-sm text-gray-500">            You will be redirected to your profile page shortly...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Become a BrightonHub Vendor
          </h1>
          <p className="text-gray-600">
            Join our marketplace and start connecting with customers across Nigeria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">          {/* Category Selection */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Select Vendor Categories
            </h2>
            <p className="text-gray-600 mb-6">
              Choose the categories that best describe your business. You can select multiple categories.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {VENDOR_CATEGORIES.map((category) => {
                const Icon = category.icon;
                const isSelected = selectedCategories.includes(category.id);
                
                return (
                  <div
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h3 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm mt-1 ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {category.description}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </div>
                );              })}
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Business Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business/Company Name *
                </label>
                <Input
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  required
                  placeholder="Enter your business name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email *
                </label>
                <Input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  required
                  placeholder="business@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Phone *
                </label>
                <Input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  required
                  placeholder="+234 xxx xxx xxxx"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address *
              </label>
              <Textarea
                value={formData.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                required
                placeholder="Enter your full business address"
                rows={3}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description *
              </label>
              <Textarea
                value={formData.businessDescription}
                onChange={(e) => handleInputChange('businessDescription', e.target.value)}
                required
                placeholder="Describe your business, services, and what makes you unique..."
                rows={4}
              />            </div>
          </div>

          {/* Experience & Certifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Experience & Qualifications
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Tell us about your experience in this field..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications & Licenses
                </label>
                <Textarea
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  placeholder="List any relevant certifications, licenses, or qualifications..."
                  rows={3}
                />
              </div>            </div>
          </div>

          {/* Contact Preferences */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Preferences
            </h2>
            <p className="text-gray-600 mb-4">
              Choose how customers can contact you. You can change these settings later.
            </p>
            <div className="space-y-3">
              {Object.entries(formData.preferredContactMethods).map(([method, enabled]) => (
                <label key={method} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleContactPreferenceChange(method, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 capitalize">                    {method.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">            <Button
              type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Application...' : 'Submit Vendor Application'}
            </Button>
            <p className="text-sm text-gray-500 mt-3 text-center">
              By submitting this application, you agree to our vendor terms and conditions.
              Your application will be reviewed within 2-3 business days.            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
