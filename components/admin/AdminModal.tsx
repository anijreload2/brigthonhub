'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'add' | 'edit' | 'view';
  table: string;
  data?: any;
  onSuccess?: () => void;
}

// Define the field configurations for each table
const tableConfigs: Record<string, any> = {
  users: {
    title: 'User',
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'name', label: 'Full Name', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'tel' },
      { name: 'role', label: 'Role', type: 'select', options: ['GUEST', 'REGISTERED', 'VENDOR', 'AGENT', 'ADMIN'], required: true },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  user_profiles: {
    title: 'User Profile',
    fields: [
      { name: 'first_name', label: 'First Name', type: 'text' },
      { name: 'last_name', label: 'Last Name', type: 'text' },
      { name: 'avatar', label: 'Avatar URL', type: 'url' },
      { name: 'bio', label: 'Bio', type: 'textarea' },
      { name: 'businessName', label: 'Business Name', type: 'text' },
      { name: 'businessAddress', label: 'Business Address', type: 'textarea' },
      { name: 'businessPhone', label: 'Business Phone', type: 'tel' },
      { name: 'location', label: 'Location', type: 'text' }
    ]
  },
  properties: {
    title: 'Property',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'property_type', label: 'Property Type', type: 'select', options: ['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'MIXED_USE'], required: true },
      { name: 'listing_type', label: 'Listing Type', type: 'select', options: ['SALE', 'RENT'], required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'location', label: 'Location', type: 'text', required: true },
      { name: 'address', label: 'Address', type: 'text', required: true },
      { name: 'bedrooms', label: 'Bedrooms', type: 'number' },
      { name: 'bathrooms', label: 'Bathrooms', type: 'number' },
      { name: 'area', label: 'Area (sq ft)', type: 'number' },
      { name: 'images', label: 'Image URLs (comma-separated)', type: 'textarea' },
      { name: 'features', label: 'Features (comma-separated)', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  food_items: {
    title: 'Food Item',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'category_id', label: 'Category ID', type: 'text', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'unit', label: 'Unit', type: 'text', required: true },
      { name: 'minimumOrder', label: 'Minimum Order', type: 'number' },
      { name: 'stock', label: 'Stock', type: 'number' },
      { name: 'images', label: 'Image URLs (comma-separated)', type: 'textarea' },
      { name: 'origin', label: 'Origin', type: 'text' },
      { name: 'sellerName', label: 'Seller Name', type: 'text' },
      { name: 'sellerPhone', label: 'Seller Phone', type: 'tel' },
      { name: 'sellerEmail', label: 'Seller Email', type: 'email' },
      { name: 'sellerAddress', label: 'Seller Address', type: 'textarea' },
      { name: 'sellerDescription', label: 'Seller Description', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  store_products: {
    title: 'Store Product',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'category_id', label: 'Category ID', type: 'text', required: true },
      { name: 'price', label: 'Price', type: 'number', required: true },
      { name: 'stock', label: 'Stock', type: 'number' },
      { name: 'images', label: 'Image URLs (comma-separated)', type: 'textarea' },
      { name: 'specifications', label: 'Specifications (JSON)', type: 'textarea' },
      { name: 'sellerName', label: 'Seller Name', type: 'text' },
      { name: 'sellerPhone', label: 'Seller Phone', type: 'tel' },
      { name: 'sellerEmail', label: 'Seller Email', type: 'email' },
      { name: 'sellerAddress', label: 'Seller Address', type: 'textarea' },
      { name: 'sellerDescription', label: 'Seller Description', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  projects: {
    title: 'Project',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'category_id', label: 'Category ID', type: 'text', required: true },
      { name: 'status', label: 'Status', type: 'select', options: ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'], required: true },
      { name: 'budget', label: 'Budget', type: 'number' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'images', label: 'Image URLs (comma-separated)', type: 'textarea' },
      { name: 'contactName', label: 'Contact Name', type: 'text' },
      { name: 'contactPhone', label: 'Contact Phone', type: 'tel' },
      { name: 'contactEmail', label: 'Contact Email', type: 'email' },
      { name: 'contactAddress', label: 'Contact Address', type: 'textarea' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  blog_posts: {
    title: 'Blog Post',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'excerpt', label: 'Excerpt', type: 'textarea' },
      { name: 'content', label: 'Content', type: 'textarea', required: true },
      { name: 'category_id', label: 'Category ID', type: 'text', required: true },
      { name: 'featuredImage', label: 'Featured Image URL', type: 'url' },
      { name: 'tags', label: 'Tags (comma-separated)', type: 'text' },
      { name: 'authorName', label: 'Author Name', type: 'text' },
      { name: 'authorEmail', label: 'Author Email', type: 'email' },
      { name: 'authorPhone', label: 'Author Phone', type: 'tel' },
      { name: 'authorBio', label: 'Author Bio', type: 'textarea' },
      { name: 'isPublished', label: 'Published', type: 'boolean' }
    ]
  },
  testimonials: {
    title: 'Testimonial',
    fields: [
      { name: 'name', label: 'Client Name', type: 'text', required: true },
      { name: 'role', label: 'Role/Position', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'content', label: 'Testimonial Content', type: 'textarea', required: true },
      { name: 'avatar_url', label: 'Avatar URL', type: 'url' },
      { name: 'rating', label: 'Rating (1-5)', type: 'number', min: 1, max: 5 },
      { name: 'is_featured', label: 'Featured', type: 'boolean' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  site_settings: {
    title: 'Site Setting',
    fields: [
      { name: 'key', label: 'Setting Key', type: 'text', required: true },
      { name: 'value', label: 'Setting Value', type: 'textarea', required: true },
      { name: 'type', label: 'Data Type', type: 'select', options: ['string', 'number', 'boolean', 'json'], required: true }
    ]
  },
  ai_training_data: {
    title: 'AI Training Data',
    fields: [
      { name: 'category', label: 'Category', type: 'text', required: true },
      { name: 'question', label: 'Question', type: 'textarea', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      { name: 'language', label: 'Language', type: 'select', options: ['en', 'fr', 'es', 'de', 'zh', 'ar'], required: true },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  content_blocks: {
    title: 'Content Block',
    fields: [
      { name: 'block_type', label: 'Block Type', type: 'select', options: ['hero', 'features', 'testimonials', 'cta', 'gallery'], required: true },
      { name: 'block_title', label: 'Block Title', type: 'text' },
      { name: 'block_content', label: 'Block Content (JSON)', type: 'textarea' },
      { name: 'page_location', label: 'Page Location', type: 'select', options: ['home', 'about', 'services', 'contact'], required: true },
      { name: 'sort_order', label: 'Sort Order', type: 'number' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  },
  media_gallery: {
    title: 'Media File',
    fields: [
      { name: 'file_name', label: 'File Name', type: 'text', required: true },
      { name: 'file_url', label: 'File URL', type: 'url', required: true },
      { name: 'thumbnail_url', label: 'Thumbnail URL', type: 'url' },
      { name: 'file_type', label: 'File Type', type: 'select', options: ['image', 'video', 'document', 'audio'], required: true },
      { name: 'file_size', label: 'File Size (bytes)', type: 'number' },
      { name: 'alt_text', label: 'Alt Text', type: 'text' },
      { name: 'is_active', label: 'Active', type: 'boolean' }
    ]
  }
};

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, type, table, data, onSuccess }) => {
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Record<string, any[]>>({});

  const config = tableConfigs[table];

  useEffect(() => {
    if (data && (type === 'edit' || type === 'view')) {
      // Handle array fields (images, features, tags)
      const processedData = { ...data };
      
      // Convert arrays to comma-separated strings for editing
      if (processedData.images && Array.isArray(processedData.images)) {
        processedData.images = processedData.images.join(', ');
      }
      if (processedData.features && Array.isArray(processedData.features)) {
        processedData.features = processedData.features.join(', ');
      }
      if (processedData.tags && Array.isArray(processedData.tags)) {
        processedData.tags = processedData.tags.join(', ');
      }
      
      setFormData(processedData);
    } else {
      const defaultData: any = {};
      config?.fields?.forEach((field: any) => {
        if (field.type === 'boolean') {
          defaultData[field.name] = true;
        }
      });
      setFormData(defaultData);
    }
  }, [data, type, config]);

  const handleDelete = async () => {
    if (!data?.id) {
      alert('Error: No ID found for deletion');
      return;
    }

    if (confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('id', data.id);

        if (error) throw error;
        alert('Item deleted successfully');
        onSuccess?.();
        onClose();
      } catch (error: any) {
        console.error('Error deleting item:', error);
        alert(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'view') return;

    setLoading(true);
    try {
      // Process form data before submission
      const processedData = { ...formData };
      
      // Convert comma-separated strings back to arrays
      if (processedData.images && typeof processedData.images === 'string') {
        processedData.images = processedData.images.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      if (processedData.features && typeof processedData.features === 'string') {
        processedData.features = processedData.features.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      if (processedData.tags && typeof processedData.tags === 'string') {
        processedData.tags = processedData.tags.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }

      // Convert number fields
      config?.fields?.forEach((field: any) => {
        if (field.type === 'number' && processedData[field.name]) {
          processedData[field.name] = parseFloat(processedData[field.name]);
        }
      });

      if (type === 'add') {
        const { error } = await supabase.from(table).insert(processedData);
        if (error) throw error;
        alert('Item added successfully');
      } else if (type === 'edit') {
        const { error } = await supabase
          .from(table)
          .update(processedData)
          .eq('id', data.id);
        if (error) throw error;
        alert('Item updated successfully');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    const { name, label, type, required, options } = field;
    const value = formData[name] || '';
    const disabled = type === 'view';

    // For date inputs, extract just the date part (YYYY-MM-DD) from ISO datetime
    const getDateValue = (val: string) => {
      if (!val) return '';
      if (val.includes('T')) {
        return val.split('T')[0]; // Extract date part from ISO datetime
      }
      return val;
    };

    const commonProps = {
      value: type === 'date' ? getDateValue(value) : value,
      disabled,
      className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none",
      placeholder: label,
      title: label
    };

    switch (type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            rows={3}
            required={required}
          />
        );
      
      case 'select':
        return (
          <select
            {...commonProps}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
            title={label}
          >
            <option value="">Select {label}</option>
            {options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => setFormData({ ...formData, [name]: e.target.checked })}
              disabled={disabled}
              className="mr-2"
              title={label}
            />
            <span className="text-sm text-gray-600">Yes</span>
          </div>
        );
      
      case 'date':
        return (
          <input
            {...commonProps}
            type="date"
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          />
        );
      
      case 'number':
        return (
          <input
            {...commonProps}
            type="number"
            step="0.01"
            min={field.min}
            max={field.max}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          />
        );
      
      default:
        return (
          <input
            {...commonProps}
            type={type}
            onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
            required={required}
          />
        );
    }
  };

  if (!isOpen || !config) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-text-primary">
            {type === 'add' ? 'Add' : type === 'edit' ? 'Edit' : 'View'} {config.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {config.fields.map((field: any) => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>

          {type !== 'view' ? (
            <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {type === 'add' ? 'Add' : 'Update'} {config.title}
              </button>
            </div>
          ) : (
            <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminModal;