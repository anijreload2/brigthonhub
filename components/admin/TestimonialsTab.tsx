'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Eye, Edit, Trash2, Star, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TestimonialsTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const TestimonialsTab: React.FC<TestimonialsTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('created_at');

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order(sortBy, { ascending: sortBy === 'created_at' ? false : true });

      if (error) {
        console.error('Error fetching testimonials:', error);
      } else {
        console.log('Fetched testimonials:', data);
        setTestimonials(data || []);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [sortBy]);  const filteredTestimonials = testimonials.filter(testimonial => {
    const searchText = `${testimonial.name || testimonial.client_name || ''} ${testimonial.company || testimonial.client_company || ''} ${testimonial.role || testimonial.client_title || ''} ${testimonial.content || testimonial.testimonial_text || ''}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTestimonials(prev => prev.map(testimonial => 
        testimonial.id === id ? { ...testimonial, is_active: !currentStatus } : testimonial
      ));
      
    } catch (error: any) {
      console.error('Error updating testimonial status:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      setTestimonials(prev => prev.map(testimonial => 
        testimonial.id === id ? { ...testimonial, is_featured: !currentStatus } : testimonial
      ));
      
    } catch (error: any) {
      console.error('Error updating testimonial featured status:', error);
      alert(`Error: ${error.message}`);
    }
  };
  // Note: Reordering disabled since display_order column doesn't exist in database
  const handleMoveOrder = async (id: string, direction: 'up' | 'down') => {
    console.warn('Reordering disabled: display_order column not available');
    // const testimonial = testimonials.find(t => t.id === id);
    // if (!testimonial) return;

    // const currentOrder = testimonial.display_order;
    // const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    // try {
    //   const { error } = await supabase
    //     .from('testimonials')
    //     .update({ display_order: newOrder })
    //     .eq('id', id);

    //   if (error) throw error;
      
    //   // Update the other testimonial's order
    //   const otherTestimonial = testimonials.find(t => t.display_order === newOrder);
    //   if (otherTestimonial) {
    //     await supabase
    //       .from('testimonials')
    //       .update({ display_order: currentOrder })
    //       .eq('id', otherTestimonial.id);
    //   }
      
    //   fetchTestimonials(); // Refresh to get updated order
      
    // } catch (error: any) {
    //   console.error('Error updating testimonial order:', error);
    //   alert(`Error: ${error.message}`);
    // }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Testimonials Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Testimonial
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search testimonials..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
            />
          </div>
        </div>        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Sort testimonials by"
        >
          <option value="created_at">Sort by Date</option>
          <option value="created_at">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading testimonials...</p>
        </div>
      ) : (
        <>
          {/* Testimonials Grid */}
          <div className="grid gap-4">
            {filteredTestimonials.length > 0 ? (
              filteredTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">                      <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                        {testimonial.avatar_url ? (
                          <img 
                            src={testimonial.avatar_url} 
                            alt={testimonial.name || testimonial.client_name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />                        ) : (
                          <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            {(testimonial.name || testimonial.client_name || 'N/A').charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-text-primary truncate">{testimonial.name || testimonial.client_name}</h3>
                          <div className="flex items-center gap-1">
                            {renderStars(testimonial.rating)}
                          </div>
                        </div>                        <p className="text-sm text-text-light">
                          {testimonial.role || testimonial.client_title}{(testimonial.company || testimonial.client_company) && ` at ${testimonial.company || testimonial.client_company}`}
                        </p>
                        <p className="text-sm text-text-primary mt-2 line-clamp-2">
                          "{testimonial.content || testimonial.testimonial_text}"
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-2">                      {/* Order controls - Disabled since display_order column doesn't exist */}
                      <div className="flex flex-col opacity-50">
                        <button 
                          onClick={() => handleMoveOrder(testimonial.id, 'up')}
                          className="p-1 hover:bg-gray-100 rounded cursor-not-allowed"
                          title="Move up (disabled - display_order not available)"
                          disabled={true}
                        >
                          <ChevronUp className="w-4 h-4 text-text-light" />
                        </button>
                        <button 
                          onClick={() => handleMoveOrder(testimonial.id, 'down')}
                          className="p-1 hover:bg-gray-100 rounded cursor-not-allowed"
                          title="Move down (disabled - display_order not available)"
                          disabled={true}
                        >
                          <ChevronDown className="w-4 h-4 text-text-light" />
                        </button>
                      </div>
                      
                      {/* Status toggles */}
                      <button 
                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.is_featured)}
                        className={`p-1 hover:bg-gray-100 rounded ${testimonial.is_featured ? 'text-yellow-500' : 'text-gray-400'}`}
                        title={testimonial.is_featured ? 'Remove from featured' : 'Add to featured'}
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleToggleActive(testimonial.id, testimonial.is_active)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title={testimonial.is_active ? 'Hide testimonial' : 'Show testimonial'}
                      >
                        {testimonial.is_active ? (
                          <ToggleRight className="w-5 h-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      
                      {/* Action buttons */}
                      <button 
                        onClick={() => onView(testimonial)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onEdit(testimonial)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onDelete(testimonial)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Status indicators */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs px-2 py-1 rounded ${
                      testimonial.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {testimonial.is_active ? 'Active' : 'Hidden'}
                    </span>
                    {testimonial.is_featured && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}                    <span className="text-xs text-text-light">
                      ID: {testimonial.id.slice(0, 8)}...
                    </span>
                    <span className="text-xs text-text-light ml-auto">
                      {new Date(testimonial.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-light">
                {searchTerm ? 'No testimonials found matching your search' : 'No testimonials found'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-text-light">
            Showing {filteredTestimonials.length} of {testimonials.length} testimonials
            {testimonials.filter(t => t.is_active).length > 0 && (
              <span className="ml-2">
                ({testimonials.filter(t => t.is_active).length} active, {testimonials.filter(t => t.is_featured).length} featured)
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TestimonialsTab;
