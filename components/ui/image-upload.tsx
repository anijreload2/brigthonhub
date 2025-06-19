'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  Trash2,
  Eye,
  Star,
  StarOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface UploadedImage {
  id: string;
  filename: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  file_url: string;
  uploadPurpose: string;
  contentType?: string;
  contentId?: string;
  altText?: string;
  isPrimary: boolean;
  created_at: string;
}

interface ImageUploadProps {
  uploadPurpose: 'product' | 'profile' | 'content' | 'general';
  contentType?: 'property' | 'food' | 'store' | 'project' | 'blog' | 'user_profile' | 'vendor_profile';
  contentId?: string;
  maxImages?: number;
  allowMultiple?: boolean;
  showPreview?: boolean;
  onUploadSuccess?: (image: UploadedImage) => void;
  onUploadError?: (error: string) => void;
  onDeleteSuccess?: (imageId: string) => void;
  className?: string;
}

export default function ImageUpload({
  uploadPurpose,
  contentType,
  contentId,
  maxImages = 10,
  allowMultiple = true,
  showPreview = true,
  onUploadSuccess,
  onUploadError,
  onDeleteSuccess,
  className = ""
}: ImageUploadProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing images on mount
  React.useEffect(() => {
    if (contentType && contentId) {
      loadExistingImages();
    }
  }, [contentType, contentId]);

  const loadExistingImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        uploadPurpose,
        ...(contentType && { contentType }),
        ...(contentId && { contentId }),
        limit: maxImages.toString()
      });

      const response = await fetch(`/api/upload-image?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUploadedImages(data.images || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file size (1MB = 1,048,576 bytes)
    if (file.size > 1048576) {
      return 'File size must be less than 1MB';
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return 'Only JPEG, PNG, WebP, and GIF images are allowed';
    }

    // Check max images limit
    if (!allowMultiple && uploadedImages.length >= 1) {
      return 'Only one image is allowed';
    }

    if (uploadedImages.length >= maxImages) {
      return `Maximum ${maxImages} images allowed`;
    }

    return null;
  };

  const uploadFile = async (file: File, isPrimary: boolean = false) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      if (onUploadError) onUploadError(validationError);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadPurpose', uploadPurpose);
      if (contentType) formData.append('contentType', contentType);
      if (contentId) formData.append('contentId', contentId);
      formData.append('isPrimary', isPrimary.toString());
      formData.append('altText', `${uploadPurpose} image - ${file.name}`);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      const newImage = data.image;
      setUploadedImages(prev => [newImage, ...prev]);
      
      if (onUploadSuccess) onUploadSuccess(newImage);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      if (onUploadError) onUploadError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      const response = await fetch(`/api/upload-image?id=${imageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setUploadedImages(prev => prev.filter(img => img.id !== imageId));
      if (onDeleteSuccess) onDeleteSuccess(imageId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Delete failed';
      setError(errorMessage);
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    setUploadedImages(prev => 
      prev.map(img => ({ 
        ...img, 
        isPrimary: img.id === imageId 
      }))
    );
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      if (allowMultiple) {
        files.forEach(file => uploadFile(file));
      } else {
        uploadFile(files[0]);
      }
    }
  }, [allowMultiple]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      if (allowMultiple) {
        files.forEach(file => uploadFile(file));
      } else {
        uploadFile(files[0]);
      }
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >            <input
              ref={fileInputRef}
              type="file"
              multiple={allowMultiple}
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploading}
              aria-label="Upload images"
              title="Upload images"
            />
            
            <div className="space-y-4">
              {uploading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : (
                <Upload className="w-8 h-8 mx-auto text-gray-400" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {uploading ? 'Uploading...' : 'Drop images here or click to upload'}
                </p>
                <p className="text-sm text-gray-500">
                  JPEG, PNG, WebP, GIF up to 1MB each
                  {allowMultiple && ` (max ${maxImages} images)`}
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Choose Files
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError('')}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Success Message */}
      {uploadedImages.length > 0 && !error && (        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
            <span className="text-green-700">
              {uploadedImages.length} image{uploadedImages.length > 1 ? 's' : ''} uploaded successfully
            </span>
          </div>
        </motion.div>
      )}

      {/* Image Gallery */}
      {showPreview && uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Uploaded Images</h3>
              <span className="text-sm text-gray-500">
                {uploadedImages.length} of {maxImages} images
              </span>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((image) => (                  <motion.div
                    key={image.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="relative group bg-gray-50 rounded-lg overflow-hidden aspect-square">
                    <img
                      src={image.file_url}
                      alt={image.altText || image.originalFilename}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Primary Image Badge */}
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Primary
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(image.file_url, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        
                        {contentType && contentId && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setPrimaryImage(image.id)}
                          >
                            {image.isPrimary ? (
                              <StarOff className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteImage(image.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                      {/* Image Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                      <p className="text-xs truncate">{image.originalFilename}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(image.fileSize)}</p>
                    </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
