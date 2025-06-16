'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ImageUpload from '@/components/ui/image-upload';
import { 
  Image as ImageIcon, 
  Search, 
  Filter, 
  Download,
  Trash2,
  Eye,
  User,
  Calendar,
  HardDrive,
  BarChart3
} from 'lucide-react';

interface ImageData {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  file_url: string;
  uploaded_by: string;
  upload_purpose: string;
  content_type?: string;
  content_id?: string;
  alt_text?: string;
  is_primary: boolean;
  status: string;
  created_at: string;
  updated_at: string;
  // Joined user data
  user?: {
    name?: string;
    email: string;
  };
}

interface ImageStats {
  totalImages: number;
  totalSizeMB: number;
  imagesByPurpose: Record<string, number>;
  imagesByType: Record<string, number>;
  recentUploads: number;
}

export default function ImageManagementTab() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPurpose, setFilterPurpose] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    fetchImages();
    fetchStats();
  }, []);

  const fetchImages = async () => {
    setLoading(true);
    try {      const { data, error } = await supabase
        .from('image_uploads')
        .select(`
          *,
          users:uploaded_by (
            name, 
            email
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get overall stats
      const { data: allImages, error } = await supabase
        .from('image_uploads')
        .select('file_size, upload_purpose, content_type, created_at')
        .eq('status', 'active');

      if (error) throw error;

      const totalImages = allImages?.length || 0;
      const totalSizeMB = (allImages?.reduce((sum, img) => sum + img.file_size, 0) || 0) / (1024 * 1024);
      
      const imagesByPurpose = (allImages || []).reduce((acc: Record<string, number>, img) => {
        acc[img.upload_purpose] = (acc[img.upload_purpose] || 0) + 1;
        return acc;
      }, {});

      const imagesByType = (allImages || []).reduce((acc: Record<string, number>, img) => {
        if (img.content_type) {
          acc[img.content_type] = (acc[img.content_type] || 0) + 1;
        }
        return acc;
      }, {});

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentUploads = (allImages || []).filter(
        img => new Date(img.created_at) >= thirtyDaysAgo
      ).length;

      setStats({
        totalImages,
        totalSizeMB: Math.round(totalSizeMB * 100) / 100,
        imagesByPurpose,
        imagesByType,
        recentUploads
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
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

      setImages(prev => prev.filter(img => img.id !== imageId));
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.original_filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPurpose = filterPurpose === 'all' || image.upload_purpose === filterPurpose;
    const matchesType = filterType === 'all' || image.content_type === filterType;
    
    return matchesSearch && matchesPurpose && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ImageIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Images</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalImages}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HardDrive className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Storage Used</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSizeMB} MB</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.recentUploads}</p>
                  <p className="text-xs text-gray-500">Last 30 days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.totalImages > 0 ? Math.round((stats.totalSizeMB / stats.totalImages) * 1000) / 1000 : 0} MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Image Management</span>
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="btn-primary"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              {showUpload ? 'Hide Upload' : 'Upload Images'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Upload Section */}
          {showUpload && (
            <div className="mb-6">              <ImageUpload
                uploadPurpose="content"
                contentType="blog"
                allowMultiple={true}
                maxImages={10}
                onUploadSuccess={() => {
                  fetchImages();
                  fetchStats();
                }}
              />
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search images, users, filenames..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="border rounded-md px-3 py-2"
              aria-label="Filter by purpose"
              title="Filter by purpose"
            >
              <option value="all">All Purposes</option>
              <option value="product">Product Images</option>
              <option value="profile">Profile Images</option>
              <option value="content">Content Images</option>
              <option value="general">General Images</option>
            </select>            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-md px-3 py-2"
              aria-label="Filter by content type"
              title="Filter by content type"
            >
              <option value="all">All Types</option>
              <option value="property">Property</option>
              <option value="food">Food</option>
              <option value="store">Store</option>
              <option value="project">Project</option>
              <option value="blog">Blog</option>
            </select>

            <Button variant="outline" onClick={fetchImages}>
              <Filter className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Grid */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Images ({filteredImages.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No images found matching your criteria
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredImages.map((image) => (
                <Card key={image.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={image.file_url}
                      alt={image.alt_text || image.original_filename}
                      className="w-full h-full object-cover"
                    />
                    {image.is_primary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Primary
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.file_url, '_blank')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteImage(image.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate">{image.original_filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(image.file_size)}</p>
                      <p className="text-xs text-gray-500">{image.upload_purpose}</p>
                      {image.content_type && (
                        <p className="text-xs text-blue-600">{image.content_type}</p>
                      )}
                      <div className="flex items-center text-xs text-gray-500">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{image.user?.name || image.user?.email}</span>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(image.created_at)}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
