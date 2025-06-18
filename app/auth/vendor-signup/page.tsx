'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, Store, Home, Utensils, Briefcase, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

const VENDOR_CATEGORIES = [
  {
    id: 'property',
    name: 'Property Agent',
    icon: Home,
    description: 'List and manage property sales, rentals, and real estate services',
    color: 'border-blue-500 bg-blue-50 text-blue-700'
  },
  {
    id: 'food',
    name: 'Food Vendor',
    icon: Utensils,
    description: 'Sell fresh produce, food products, and agricultural items',
    color: 'border-green-500 bg-green-50 text-green-700'
  },
  {
    id: 'marketplace',
    name: 'Marketplace Seller',
    icon: Store,
    description: 'Sell general merchandise, products, and retail items',
    color: 'border-purple-500 bg-purple-50 text-purple-700'
  },
  {
    id: 'projects',
    name: 'Service Provider',
    icon: Briefcase,
    description: 'Offer professional services, consulting, and project work',
    color: 'border-orange-500 bg-orange-50 text-orange-700'
  }
];

export default function VendorSignupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    // Account info
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    
    // Business info
    business_name: '',
    business_description: '',
    contact_email: '',
    contact_phone: '',
    business_address: '',
    website_url: '',
    experience: '',
    certifications: '',
    
    // Contact preferences
    contact_preferences: {
      email: true,
      phone: true,
      whatsapp: false,
      platform_messages: true
    }
  });
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

  const handlePreferenceChange = (preference: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      contact_preferences: {
        ...prev.contact_preferences,
        [preference]: value
      }
    }));
  };

  const validateStep1 = () => {
    const { email, password, confirmPassword, name } = formData;
    
    if (!email || !password || !confirmPassword || !name) {
      alert('Please fill in all required fields');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return false;
    }
    
    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const validateStep2 = () => {
    if (selectedCategories.length === 0) {
      alert('Please select at least one vendor category');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const { business_name, business_description, contact_email } = formData;
    
    if (!business_name || !business_description || !contact_email) {
      alert('Please fill in all required business information');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact_email)) {
      alert('Please enter a valid contact email address');
      return false;
    }
    
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    
    setIsSubmitting(true);
    
    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || undefined,
        categories: selectedCategories,
        business_name: formData.business_name,
        business_description: formData.business_description,
        contact_email: formData.contact_email,
        contact_phone: formData.contact_phone || undefined,
        business_address: formData.business_address || undefined,
        website_url: formData.website_url || undefined,
        verification_data: {
          experience: formData.experience || undefined,
          certifications: formData.certifications || undefined,
          contact_preferences: formData.contact_preferences
        }
      };

      const response = await fetch('/api/auth/vendor-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create vendor account');
      }

      // Success - go to step 4 (confirmation)
      setCurrentStep(4);
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/auth/login?message=Vendor account created successfully. Please login to continue.');
      }, 3000);    } catch (error: any) {
      console.error('Vendor signup error:', error);
      alert(error?.message || 'Failed to create vendor account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Link href="/auth/register">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Regular Signup
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join as a Vendor</h1>
          <p className="text-gray-600">Start selling your products and services on BrightonHub</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>Account</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>Categories</span>
            <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : ''}>Business Info</span>
            <span className={currentStep >= 4 ? 'text-blue-600 font-medium' : ''}>Complete</span>
          </div>          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-blue-600 h-2 rounded-full transition-all duration-300 ${
                currentStep === 1 ? 'w-1/4' : 
                currentStep === 2 ? 'w-2/4' : 
                currentStep === 3 ? 'w-3/4' : 'w-full'
              }`}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Create Your Account</h2>
                <p className="text-gray-600">Let's start with your basic account information</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="e.g., +234-800-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <Input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button onClick={handleNextStep} className="px-8">
                  Next: Select Categories
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Category Selection */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Categories</h2>
                <p className="text-gray-600">Select the types of products or services you'll offer</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {VENDOR_CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  const isSelected = selectedCategories.includes(category.id);
                  
                  return (
                    <div
                      key={category.id}
                      onClick={() => toggleCategory(category.id)}
                      className={`
                        relative p-6 rounded-lg border-2 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? `${category.color} border-opacity-100` 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-100'}`}>
                          <Icon className={`w-6 h-6 ${isSelected ? 'text-current' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className={`font-semibold mb-2 ${isSelected ? 'text-current' : 'text-gray-900'}`}>
                            {category.name}
                          </h3>
                          <p className={`text-sm ${isSelected ? 'text-current opacity-90' : 'text-gray-600'}`}>
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
                <Button onClick={handleNextStep} disabled={selectedCategories.length === 0}>
                  Next: Business Information
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Business Information */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Business Information</h2>
                <p className="text-gray-600">Tell us about your business</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <Input
                    type="text"
                    value={formData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Enter your business name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => handleInputChange('contact_email', e.target.value)}
                    placeholder="Business contact email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Phone
                  </label>
                  <Input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                    placeholder="Business phone number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address
                  </label>
                  <Input
                    type="text"
                    value={formData.business_address}
                    onChange={(e) => handleInputChange('business_address', e.target.value)}
                    placeholder="Business address"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <Textarea
                    value={formData.business_description}
                    onChange={(e) => handleInputChange('business_description', e.target.value)}
                    placeholder="Describe your business, products, or services..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <Input
                    type="text"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years in real estate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certifications
                  </label>
                  <Input
                    type="text"
                    value={formData.certifications}
                    onChange={(e) => handleInputChange('certifications', e.target.value)}
                    placeholder="Professional certifications"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={handlePrevStep}>
                  Previous
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="px-8"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Vendor Account'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {currentStep === 4 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Created Successfully!</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your vendor account has been created and your application is under review. 
                You'll receive an email notification once your application is approved.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Redirecting to login page...
              </p>
              <Button onClick={() => router.push('/auth/login')}>
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
