'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Star,
  ExternalLink,
  Tag,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Package,
  Users,
  Award,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DetailsTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const DetailsTab: React.FC<DetailsTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [contentType, setContentType] = useState<'properties' | 'food_items' | 'projects' | 'blog_posts' | 'store_products'>('properties');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    withDetails: 0,
    needsAttention: 0,
    published: 0
  });

  const contentTypes = [
    { id: 'properties', label: 'Properties', icon: MapPin, table: 'properties' },
    { id: 'food_items', label: 'Food Items', icon: Package, table: 'food_items' },
    { id: 'projects', label: 'Projects', icon: Award, table: 'projects' },
    { id: 'blog_posts', label: 'Blog Posts', icon: FileText, table: 'blog_posts' },
    { id: 'store_products', label: 'Store Products', icon: Package, table: 'store_products' }
  ];

  const fetchItems = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from(contentType)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching ${contentType}:`, error);
        setItems([]);
      } else {
        setItems(data || []);
        
        // Calculate stats
        const total = data?.length || 0;
        let withDetails = 0;
        let needsAttention = 0;
        let published = 0;

        data?.forEach((item: any) => {
          // Check if item has detail-ready content
          if (contentType === 'properties') {
            if (item.images?.length > 0 && item.description && item.amenities?.length > 0) {
              withDetails++;
            }
            if (!item.contact_email || !item.contact_phone) {
              needsAttention++;
            }
            if (item.is_active) published++;
          } else if (contentType === 'food_items') {
            if (item.images?.length > 0 && item.description && item.nutritional_info) {
              withDetails++;
            }
            if (!item.supplier_info || item.stock < item.minimum_order) {
              needsAttention++;
            }
            if (item.is_active) published++;
          } else if (contentType === 'projects') {
            if (item.before_images?.length > 0 && item.after_images?.length > 0 && item.description) {
              withDetails++;
            }
            if (!item.client_name || !item.testimonial) {
              needsAttention++;
            }
            if (item.is_active) published++;
          } else if (contentType === 'blog_posts') {
            if (item.content && item.featuredImage && item.excerpt) {
              withDetails++;
            }
            if (!item.meta_title || !item.meta_description) {
              needsAttention++;
            }
            if (item.isPublished && item.is_active) published++;
          } else if (contentType === 'store_products') {
            if (item.images?.length > 0 && item.description && item.specifications) {
              withDetails++;
            }
            if (!item.sku || item.stock <= 0) {
              needsAttention++;
            }
            if (item.is_active) published++;
          }
        });

        setStats({ total, withDetails, needsAttention, published });
      }
    } catch (error) {
      console.error(`Error fetching ${contentType}:`, error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [contentType]);

  const filteredItems = items.filter(item => {
    const searchFields = contentType === 'properties' ? [item.title, item.location] :
                        contentType === 'food_items' ? [item.name, item.origin] :
                        contentType === 'projects' ? [item.title, item.location] :
                        contentType === 'blog_posts' ? [item.title, item.excerpt] :
                        [item.name, item.brand];
    
    return searchFields.some(field => 
      field?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getDetailCompleteness = (item: any) => {
    let score = 0;
    let maxScore = 10;

    if (contentType === 'properties') {
      if (item.images?.length > 0) score += 2;
      if (item.description?.length > 100) score += 2;
      if (item.amenities?.length > 0) score += 1;
      if (item.contact_email) score += 1;
      if (item.contact_phone) score += 1;
      if (item.virtual_tour_url) score += 1;
      if (item.neighborhood_info) score += 1;
      if (item.coordinates) score += 1;
    } else if (contentType === 'food_items') {
      if (item.images?.length > 0) score += 2;
      if (item.description?.length > 100) score += 2;
      if (item.nutritional_info) score += 2;
      if (item.supplier_info) score += 1;
      if (item.ingredients?.length > 0) score += 1;
      if (item.certifications?.length > 0) score += 1;
      if (item.origin) score += 1;
    } else if (contentType === 'projects') {
      if (item.before_images?.length > 0) score += 2;
      if (item.after_images?.length > 0) score += 2;
      if (item.description?.length > 100) score += 2;
      if (item.client_name) score += 1;
      if (item.testimonial) score += 1;
      if (item.timeline_phases) score += 1;
      if (item.team_members) score += 1;
    } else if (contentType === 'blog_posts') {
      if (item.content?.length > 500) score += 3;
      if (item.featuredImage) score += 2;
      if (item.excerpt?.length > 50) score += 1;
      if (item.meta_title) score += 1;
      if (item.meta_description) score += 1;
      if (item.author_name) score += 1;
      if (item.tags?.length > 0) score += 1;
    } else if (contentType === 'store_products') {
      if (item.images?.length > 0) score += 2;
      if (item.description?.length > 100) score += 2;
      if (item.specifications) score += 2;
      if (item.sku) score += 1;
      if (item.brand) score += 1;
      if (item.warranty_info) score += 1;
      if (item.shipping_info) score += 1;
    }

    return Math.round((score / maxScore) * 100);
  };

  const getStatusColor = (item: any) => {
    const completeness = getDetailCompleteness(item);
    if (completeness >= 80) return 'bg-green-100 text-green-800';
    if (completeness >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (item: any) => {
    const completeness = getDetailCompleteness(item);
    if (completeness >= 80) return 'Detail Ready';
    if (completeness >= 60) return 'Needs Work';
    return 'Missing Details';
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary">Detail Pages Management</h2>
          <p className="text-sm text-text-light">Manage rich content for detail pages</p>
        </div>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Content
        </button>
      </div>

      {/* Content Type Selector */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        {contentTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => setContentType(type.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                contentType === type.id
                  ? 'bg-primary text-white'
                  : 'bg-white text-text-light hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Items</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Detail Ready</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.withDetails}</div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Needs Attention</span>
          </div>
          <div className="text-2xl font-bold text-yellow-900">{stats.needsAttention}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Published</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{stats.published}</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Search ${contentType.replace('_', ' ')}...`}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading content...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.length > 0 ? filteredItems.map((item) => {
            const completeness = getDetailCompleteness(item);
            const statusColor = getStatusColor(item);
            const statusText = getStatusText(item);
            
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {(item.images?.[0] || item.featuredImage) ? (
                          <img 
                            src={item.images?.[0] || item.featuredImage} 
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-text-primary">
                            {item.title || item.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                            {statusText}
                          </span>
                        </div>
                        
                        <p className="text-sm text-text-light mb-2 line-clamp-2">
                          {item.description || item.content || item.excerpt || 'No description'}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-text-light">
                          {contentType === 'properties' && (
                            <>
                              <span>{item.location}</span>
                              <span>₦{item.price?.toLocaleString()}</span>
                              <span>{item.images?.length || 0} images</span>
                            </>
                          )}
                          {contentType === 'food_items' && (
                            <>
                              <span>{item.origin}</span>
                              <span>₦{item.price?.toLocaleString()}/{item.unit}</span>
                              <span>Stock: {item.stock}</span>
                            </>
                          )}
                          {contentType === 'projects' && (
                            <>
                              <span>{item.status}</span>
                              <span>{item.location}</span>
                              <span>{(item.before_images?.length || 0) + (item.after_images?.length || 0)} images</span>
                            </>
                          )}
                          {contentType === 'blog_posts' && (
                            <>
                              <span>{new Date(item.created_at).toLocaleDateString()}</span>
                              <span>{item.readingTime} min read</span>
                              <span>{item.views || 0} views</span>
                            </>
                          )}
                          {contentType === 'store_products' && (
                            <>
                              <span>{item.brand}</span>
                              <span>₦{item.price?.toLocaleString()}</span>
                              <span>Stock: {item.stock}</span>
                            </>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-text-light">Detail Completeness</span>
                            <span className="font-medium">{completeness}%</span>
                          </div>                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                completeness >= 80 ? 'bg-green-500' :
                                completeness >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              data-width={completeness}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <button 
                      onClick={() => onView(item)}
                      className="p-2 text-text-light hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-2 text-text-light hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                      title="Edit Content"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-2 text-text-light hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {(item.is_active || item.isPublished) && (
                      <a 
                        href={`/${contentType.replace('_items', '').replace('_posts', '').replace('_products', '')}/${contentType === 'blog_posts' ? item.slug : item.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-text-light hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Live Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No {contentType.replace('_', ' ')} found</h3>
              <p className="text-text-light">Start by adding some content to populate detail pages.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DetailsTab;
