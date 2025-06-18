'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VendorListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  currency: string;
  location: string;
  contact_info: any;
  images: string[];
  specifications: any;
  status: string;
}

// Base field configuration
interface BaseFieldConfig {
  label: string;
  type: 'text' | 'number' | 'textarea' | 'select' | 'boolean';
  required?: boolean;
}

// Text field configuration
interface TextFieldConfig extends BaseFieldConfig {
  type: 'text' | 'number' | 'textarea';
}

// Select field configuration
interface SelectFieldConfig extends BaseFieldConfig {
  type: 'select';
  options: string[];
}

// Boolean field configuration
interface BooleanFieldConfig extends BaseFieldConfig {
  type: 'boolean';
}

// Union type for all field configurations
type FieldConfig = TextFieldConfig | SelectFieldConfig | BooleanFieldConfig;

// Category configuration interface
interface CategoryConfig {
  name: string;
  fields: Record<string, FieldConfig>;
  priceLabel: string;
  priceRequired: boolean;
}

const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  property: {
    name: 'Property',
    fields: {
      propertyType: { 
        label: 'Property Type', 
        type: 'select', 
        options: ['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE'], 
        required: true 
      } as SelectFieldConfig,
      listingType: { 
        label: 'Listing Type', 
        type: 'select', 
        options: ['SALE', 'RENT'], 
        required: true 
      } as SelectFieldConfig,
      bedrooms: { label: 'Bedrooms', type: 'number' } as TextFieldConfig,
      bathrooms: { label: 'Bathrooms', type: 'number' } as TextFieldConfig,
      area: { label: 'Area (sq ft)', type: 'number' } as TextFieldConfig,
      address: { label: 'Full Address', type: 'text', required: true } as TextFieldConfig,
      features: { label: 'Features (one per line)', type: 'textarea' } as TextFieldConfig,
      furnished: { label: 'Furnished', type: 'boolean' } as BooleanFieldConfig,
      parking_spaces: { label: 'Parking Spaces', type: 'number' } as TextFieldConfig
    },
    priceLabel: 'Price (NGN)',
    priceRequired: true
  },
  food: {
    name: 'Food & Catering',
    fields: {
      unit: { label: 'Unit (e.g., kg, piece, serving)', type: 'text', required: true } as TextFieldConfig,
      minimumOrder: { label: 'Minimum Order Quantity', type: 'number' } as TextFieldConfig,
      stock: { label: 'Stock Available', type: 'number' } as TextFieldConfig,
      origin: { label: 'Origin/Source', type: 'text' } as TextFieldConfig,
      shelf_life: { label: 'Shelf Life', type: 'text' } as TextFieldConfig,
      ingredients: { label: 'Main Ingredients', type: 'textarea' } as TextFieldConfig,
      allergens: { label: 'Allergens (if any)', type: 'textarea' } as TextFieldConfig,
      storage_instructions: { label: 'Storage Instructions', type: 'textarea' } as TextFieldConfig,
      cuisine_type: { label: 'Cuisine Type', type: 'text' } as TextFieldConfig,
      dietary_options: { label: 'Dietary Options (vegan, halal, etc.)', type: 'text' } as TextFieldConfig
    },
    priceLabel: 'Price per unit (NGN)',
    priceRequired: true
  },
  marketplace: {
    name: 'Marketplace',
    fields: {
      stock: { label: 'Stock Available', type: 'number' } as TextFieldConfig,
      brand: { label: 'Brand', type: 'text' } as TextFieldConfig,
      model: { label: 'Model/Version', type: 'text' } as TextFieldConfig,
      condition: { 
        label: 'Condition', 
        type: 'select', 
        options: ['NEW', 'USED', 'REFURBISHED'], 
        required: true 
      } as SelectFieldConfig,      warranty_info: { label: 'Warranty Information', type: 'textarea' } as TextFieldConfig,
      shipping_info: { label: 'Shipping Information', type: 'textarea' } as TextFieldConfig,
      weight: { label: 'Weight (kg)', type: 'number' } as TextFieldConfig,
      dimensions: { label: 'Dimensions (L x W x H)', type: 'text' } as TextFieldConfig,
      shipping_available: { label: 'Shipping Available', type: 'boolean' } as BooleanFieldConfig
    },
    priceLabel: 'Price (NGN)',
    priceRequired: true
  },
  projects: {
    name: 'Services & Projects',
    fields: {
      service_type: { label: 'Service Type', type: 'text', required: true } as TextFieldConfig,
      budget_range: { 
        label: 'Typical Budget Range', 
        type: 'select', 
        options: ['< ₦100,000', '₦100,000 - ₦500,000', '₦500,000 - ₦1,000,000', '₦1,000,000 - ₦5,000,000', '₦5,000,000+'] 
      } as SelectFieldConfig,
      duration: { label: 'Typical Project Duration', type: 'text' } as TextFieldConfig,
      experience_years: { label: 'Years of Experience', type: 'number' } as TextFieldConfig,
      certifications: { label: 'Certifications & Qualifications', type: 'textarea' } as TextFieldConfig,
      portfolio_items: { label: 'Portfolio/Previous Work (describe briefly)', type: 'textarea' } as TextFieldConfig,
      service_area: { label: 'Service Coverage Area', type: 'text' } as TextFieldConfig
    },
    priceLabel: 'Starting price (NGN) - Optional',
    priceRequired: false
  }
};


export default function EditListing() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [listing, setListing] = useState<VendorListing | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'NGN',
    location: '',
    contact_phone: '',
    contact_email: '',
    specifications: {} as Record<string, string>
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/vendor/dashboard');
      return;
    }

    fetchListing();
  }, [user, router, listingId]);

  const fetchListing = async () => {
    if (!user || !listingId) return;

    try {
      const { data, error } = await supabase
        .from('vendor_listings')
        .select('*')
        .eq('id', listingId)
        .eq('vendor_id', user.id)
        .single();

      if (error) throw error;

      if (!data) {
        toast.error('Listing not found or you do not have permission to edit it');
        router.push('/vendor/dashboard');
        return;
      }

      setListing(data);
      setImages(data.images || []);
      setFormData({
        title: data.title || '',
        description: data.description || '',
        price: data.price ? data.price.toString() : '',
        currency: data.currency || 'NGN',
        location: data.location || '',
        contact_phone: data.contact_info?.phone || '',
        contact_email: data.contact_info?.email || user.email || '',
        specifications: data.specifications || {}
      });

    } catch (error) {
      console.error('Error fetching listing:', error);
      toast.error('Failed to load listing');
      router.push('/vendor/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return;
    }

    setUploadingImage(true);

    try {
      // Include vendor ID in the path for security and organization
      const fileName = `${user?.id}/listing-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      
      const { data, error } = await supabase.storage
        .from('vendor-images')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        });

      if (error) {
        console.error('Storage error:', error);
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-images')
        .getPublicUrl(fileName);

      setImages(prev => [...prev, publicUrl]);
      toast.success('Image uploaded successfully');    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('row-level security')) {
        toast.error('Image upload not configured properly. Please contact support.');
      } else if (errorMessage.includes('Unauthorized')) {
        toast.error('You are not authorized to upload images. Please try logging in again.');
      } else {
        toast.error('Failed to upload image. Please try again.');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSpecificationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing) return;

    const categoryConfig = CATEGORY_CONFIG[listing.category as keyof typeof CATEGORY_CONFIG];
    
    if (categoryConfig.priceRequired && !formData.price) {
      toast.error('Price is required for this category');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('vendor_listings')
        .update({
          title: formData.title,
          description: formData.description,
          price: formData.price ? parseFloat(formData.price) : null,
          currency: formData.currency,
          location: formData.location,
          contact_info: {
            phone: formData.contact_phone,
            email: formData.contact_email || user.email
          },
          images,
          specifications: formData.specifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', listingId);

      if (error) throw error;

      toast.success('Listing updated successfully!');
      router.push('/vendor/dashboard?tab=listings');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast.error('Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Listing Not Found</CardTitle>
            <CardDescription>
              The listing you're trying to edit could not be found.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/vendor/dashboard')} className="w-full">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const categoryConfig = CATEGORY_CONFIG[listing.category as keyof typeof CATEGORY_CONFIG];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/vendor/dashboard?tab=listings')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Listings
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
            <p className="text-gray-600">Update your {categoryConfig?.name.toLowerCase()} listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the main details of your listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter a descriptive title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Provide a detailed description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">
                    {categoryConfig?.priceLabel || 'Price (NGN)'}
                    {categoryConfig?.priceRequired ? ' *' : ''}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0.00"
                    required={categoryConfig?.priceRequired}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Enter location"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How customers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_phone">Phone Number</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="contact_email">Email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                    placeholder={user?.email || "Enter email"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category-specific fields */}
          {categoryConfig && (
            <Card>
              <CardHeader>
                <CardTitle>{categoryConfig.name} Details</CardTitle>
                <CardDescription>Specific information for this category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                  {Object.entries(categoryConfig.fields).map(([fieldKey, fieldConfig]) => (
                    <div key={fieldKey} className={fieldConfig.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <Label htmlFor={fieldKey}>
                        {fieldConfig.label}
                        {fieldConfig.required ? ' *' : ''}
                      </Label>
                      
                      {/* Text Input */}
                      {fieldConfig.type === 'text' && (
                        <Input
                          id={fieldKey}
                          value={formData.specifications[fieldKey] || ''}
                          onChange={(e) => handleSpecificationChange(fieldKey, e.target.value)}
                          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          required={fieldConfig.required}
                        />
                      )}
                      
                      {/* Number Input */}
                      {fieldConfig.type === 'number' && (
                        <Input
                          id={fieldKey}
                          type="number"
                          value={formData.specifications[fieldKey] || ''}
                          onChange={(e) => handleSpecificationChange(fieldKey, e.target.value)}
                          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          required={fieldConfig.required}
                        />
                      )}
                      
                      {/* Textarea */}
                      {fieldConfig.type === 'textarea' && (
                        <Textarea
                          id={fieldKey}
                          value={formData.specifications[fieldKey] || ''}
                          onChange={(e) => handleSpecificationChange(fieldKey, e.target.value)}
                          placeholder={`Enter ${fieldConfig.label.toLowerCase()}`}
                          rows={3}
                          required={fieldConfig.required}
                        />
                      )}
                      
                      {/* Select Dropdown */}
                      {fieldConfig.type === 'select' && (
                        <Select 
                          value={formData.specifications[fieldKey] || ''} 
                          onValueChange={(value) => handleSpecificationChange(fieldKey, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${fieldConfig.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {(fieldConfig as SelectFieldConfig).options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      
                      {/* Boolean/Checkbox */}
                      {fieldConfig.type === 'boolean' && (
                        <div className="flex items-center space-x-2">
                          <input
                            id={fieldKey}
                            type="checkbox"
                            checked={formData.specifications[fieldKey] === 'true'}
                            onChange={(e) => handleSpecificationChange(fieldKey, e.target.checked.toString())}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            aria-label={fieldConfig.label}
                          />
                          <Label htmlFor={fieldKey} className="text-sm font-normal">
                            {fieldConfig.label}
                          </Label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>Update photos to showcase your listing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Listing image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => removeImage(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <label className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors h-24">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {uploadingImage && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Uploading image...
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/vendor/dashboard?tab=listings')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Update Listing
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
