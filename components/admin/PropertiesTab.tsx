'use client';

import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, Eye, Edit, Trash2, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PropertiesTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const PropertiesTab: React.FC<PropertiesTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const fetchProperties = async () => {
    try {
      setLoading(true);
      
      // Fetch ALL properties including those from vendor listings
      const [propertiesResult, vendorListingsResult] = await Promise.all([
        supabase
          .from('properties')
          .select('*')
          .order('createdAt', { ascending: false }),
        supabase
          .from('vendor_listings')
          .select('*')
          .eq('category', 'property')
          .order('created_at', { ascending: false })
      ]);

      const allProperties: any[] = [];

      // Add admin properties
      if (propertiesResult.data) {
        propertiesResult.data.forEach(property => {
          allProperties.push({
            ...property,
            source: 'admin',
            listing_type: 'admin'
          });
        });
      }

      // Add vendor properties
      if (vendorListingsResult.data) {
        vendorListingsResult.data.forEach(listing => {
          allProperties.push({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            price: listing.price,
            location: listing.location,
            images: listing.images,
            isActive: listing.is_active,
            agentId: listing.vendor_id,
            createdAt: listing.created_at,
            updatedAt: listing.updated_at,
            source: 'vendor',
            listing_type: 'vendor',
            vendor_data: listing
          });
        });
      }

      if (propertiesResult.error) {
        console.error('Error fetching admin properties:', propertiesResult.error);
      }
      if (vendorListingsResult.error) {
        console.error('Error fetching vendor properties:', vendorListingsResult.error);
      }

      console.log('Fetched all properties:', allProperties.length);
      setProperties(allProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(property => 
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleVisibility = async (property: any) => {
    try {
      const newActiveState = !property.isActive;
      
      if (property.source === 'admin') {
        // Update admin property
        const { error } = await supabase
          .from('properties')
          .update({ isActive: newActiveState })
          .eq('id', property.id);
          
        if (error) throw error;
      } else if (property.source === 'vendor') {
        // Update vendor listing
        const { error } = await supabase
          .from('vendor_listings')
          .update({ is_active: newActiveState })
          .eq('id', property.id);
          
        if (error) throw error;
      }

      toast({
        title: 'Success',
        description: `Property ${newActiveState ? 'shown' : 'hidden'} successfully`,
      });

      // Refresh the list
      fetchProperties();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property visibility',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Properties Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search properties..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading properties...</p>
        </div>
      ) : (
        <>          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProperties.length > 0 ? filteredProperties.map((property) => (
              <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">                {/* Property Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {(property.images && property.images.length > 0) ? (
                    <img 
                      src={Array.isArray(property.images) ? property.images[0] : property.images} 
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-property.jpg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                  {/* Property Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-text-primary line-clamp-1">{property.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          property.source === 'admin' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {property.source === 'admin' ? 'Admin' : 'Vendor'}
                        </span>
                      </div>
                      <p className="text-sm text-text-light mb-2">{property.location}</p>
                      <p className="text-lg font-bold text-primary">₦{property.price?.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        property.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {property.isActive ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => toggleVisibility(property)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={property.isActive ? 'Hide' : 'Show'}
                      >
                        {property.isActive ? (
                          <EyeOff className="w-4 h-4 text-orange-500" />
                        ) : (
                          <Eye className="w-4 h-4 text-green-500" />
                        )}
                      </button>
                      <button 
                        onClick={() => onView(property)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onEdit(property)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onDelete(property)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-text-light">
                    <span>{property.propertyType || 'Property'}</span>
                    <span>{property.bedrooms || 0}BR • {property.bathrooms || 0}BA</span>
                  </div>
                  
                  {property.description && (
                    <p className="text-sm text-text-light mt-2 line-clamp-2">{property.description}</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-text-light">
                {searchTerm ? 'No properties found matching your search' : 'No properties found'}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-text-light">
            Showing {filteredProperties.length} of {properties.length} properties
          </div>
        </>
      )}
    </div>
  );
};

export default PropertiesTab;
