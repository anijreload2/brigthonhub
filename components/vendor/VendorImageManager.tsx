'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageUpload from '@/components/ui/image-upload';
import { 
  Image as ImageIcon, 
  Upload, 
  Package, 
  Home, 
  Utensils, 
  Briefcase,
  User
} from 'lucide-react';

interface VendorImageManagerProps {
  vendorId: string;
  vendorCategories: string[];
}

export default function VendorImageManager({ vendorId, vendorCategories }: VendorImageManagerProps) {
  const [activeTab, setActiveTab] = useState('profile');

  const categoryConfig = {
    property: {
      icon: Home,
      label: 'Property Images',
      contentType: 'property' as const,
      description: 'Upload images for your property listings'
    },
    food: {
      icon: Utensils,
      label: 'Food Product Images',
      contentType: 'food' as const,
      description: 'Upload images for your food products'
    },
    marketplace: {
      icon: Package,
      label: 'Product Images',
      contentType: 'store' as const,
      description: 'Upload images for your marketplace products'
    },
    projects: {
      icon: Briefcase,
      label: 'Project Images',
      contentType: 'project' as const,
      description: 'Upload images for your project portfolio'
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2" />
            Image Management
          </CardTitle>
          <p className="text-sm text-gray-600">
            Upload and manage images for your vendor listings. Maximum 1MB per image.
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              {vendorCategories.map((category) => {
                const config = categoryConfig[category as keyof typeof categoryConfig];
                if (!config) return null;
                
                const Icon = config.icon;
                return (
                  <TabsTrigger key={category} value={category}>
                    <Icon className="w-4 h-4 mr-2" />
                    {config.label.split(' ')[0]}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* Profile Images Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Profile Images
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Upload images for your vendor profile, logos, and business photos.
                  </p>
                </CardHeader>
                <CardContent>
                  <ImageUpload
                    uploadPurpose="profile"
                    contentType="vendor_profile"
                    contentId={vendorId}
                    maxImages={5}
                    allowMultiple={true}
                    showPreview={true}
                    onUploadSuccess={(image) => {
                      console.log('Profile image uploaded:', image);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Category-specific tabs */}
            {vendorCategories.map((category) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              if (!config) return null;
              
              const Icon = config.icon;
              
              return (
                <TabsContent key={category} value={category}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Icon className="w-5 h-5 mr-2" />
                        {config.label}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        {config.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* General category images */}
                        <div>
                          <h3 className="text-lg font-medium mb-4">General {config.label}</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Upload general images for this category that can be used across multiple listings.
                          </p>
                          <ImageUpload
                            uploadPurpose="product"
                            contentType={config.contentType}
                            maxImages={20}
                            allowMultiple={true}
                            showPreview={true}
                            onUploadSuccess={(image) => {
                              console.log(`${category} image uploaded:`, image);
                            }}
                          />
                        </div>

                        {/* Tips */}
                        <Card className="bg-blue-50 border-blue-200">
                          <CardContent className="p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Image Upload Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Use high-quality images (1MB max per image)</li>
                              <li>• Supported formats: JPEG, PNG, WebP, GIF</li>
                              <li>• Mark one image as "Primary" for each listing</li>
                              <li>• Add descriptive alt text for better accessibility</li>
                              <li>• You can upload multiple images and organize them later</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Usage Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Image Usage Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">✅ Best Practices</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use clear, well-lit photos</li>
                <li>• Show products from multiple angles</li>
                <li>• Include lifestyle or context shots</li>
                <li>• Maintain consistent image quality</li>
                <li>• Use professional photography when possible</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-2">❌ Avoid</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Blurry or low-quality images</li>
                <li>• Images with watermarks or logos</li>
                <li>• Copyrighted images you don't own</li>
                <li>• Images larger than 1MB</li>
                <li>• Inappropriate or offensive content</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> All uploaded images are subject to review. Images that violate our guidelines 
              may be removed without notice. For specific product listings, upload images directly when creating 
              or editing individual products.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
