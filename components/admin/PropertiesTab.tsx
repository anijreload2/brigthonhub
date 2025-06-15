'use client';

import React, { useState, useEffect } from 'react';
import { Home, Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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

  const fetchProperties = async () => {
    try {
      setLoading(true);      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('createdAt', { ascending: false });      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        console.log('Fetched properties:', data); // Debug log
        setProperties(data || []);
      }
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
              <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                {/* Property Image */}
                <div className="h-48 bg-gray-200 overflow-hidden">
                  {property.imageUrl ? (
                    <img 
                      src={property.imageUrl} 
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
                      <h4 className="font-semibold text-text-primary mb-1 line-clamp-2">{property.title}</h4>
                      <p className="text-sm text-text-light mb-2">{property.location}</p>
                      <p className="text-lg font-bold text-primary">₦{property.price?.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button 
                        onClick={() => onView(property)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
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
                    <span>{property.type} • {property.status}</span>
                    <span>{property.bedrooms}BR • {property.bathrooms}BA</span>
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
