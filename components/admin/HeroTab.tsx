'use client';

import React, { useState, useEffect } from 'react';
import { Image, Search, Plus, Eye, Edit, Trash2, Layout, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface HeroTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const HeroTab: React.FC<HeroTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPage, setFilterPage] = useState('all');
  const [contentBlocks, setContentBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContentBlocks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('content_blocks')        .select('*')
        .order('page_location', { ascending: true })
        .order('sort_order', { ascending: true });

      if (!error) {
        setContentBlocks(data || []);
      }
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContentBlocks();
  }, []);

  const filteredBlocks = contentBlocks.filter(block => {
    const searchText = `${block.block_title || ''} ${block.block_type}`.toLowerCase();
    const matchesSearch = searchText.includes(searchTerm.toLowerCase());
    const matchesPage = filterPage === 'all' || block.page_location === filterPage;
    return matchesSearch && matchesPage;
  });

  // Get unique page locations for filter
  const pageLocations = Array.from(new Set(contentBlocks.map(block => block.page_location)));

  const updateSortOrder = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentBlock = contentBlocks.find(block => block.id === id);
      if (!currentBlock) return;

      const samePageBlocks = contentBlocks
        .filter(block => block.page_location === currentBlock.page_location)
        .sort((a, b) => a.sort_order - b.sort_order);

      const currentIndex = samePageBlocks.findIndex(block => block.id === id);
      if (currentIndex === -1) return;

      let targetIndex;
      if (direction === 'up' && currentIndex > 0) {
        targetIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < samePageBlocks.length - 1) {
        targetIndex = currentIndex + 1;
      } else {
        return; // Can't move further
      }

      const targetBlock = samePageBlocks[targetIndex];

      // Swap sort orders
      const { error: error1 } = await supabase
        .from('content_blocks')
        .update({ sort_order: targetBlock.sort_order, updated_at: new Date().toISOString() })
        .eq('id', currentBlock.id);

      const { error: error2 } = await supabase
        .from('content_blocks')
        .update({ sort_order: currentBlock.sort_order, updated_at: new Date().toISOString() })
        .eq('id', targetBlock.id);

      if (error1 || error2) throw error1 || error2;

      // Refresh data
      fetchContentBlocks();      alert('Block order updated successfully');
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };
  const toggleActive = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('content_blocks')
        .update({ is_active: !is_active, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setContentBlocks(prev => prev.map(block => 
        block.id === id ? { ...block, is_active: !is_active } : block
      ));
      
      alert(`Content block ${!is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {      alert(`Error: ${error.message}`);
    }
  };

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'hero': return 'bg-blue-100 text-blue-800';
      case 'features': return 'bg-green-100 text-green-800';
      case 'testimonials': return 'bg-purple-100 text-purple-800';
      case 'cta': return 'bg-orange-100 text-orange-800';
      case 'gallery': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Content Blocks & Hero Sections</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Content Block
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-light" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search content blocks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filterPage}
          onChange={(e) => setFilterPage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by page location"
        >
          <option value="all">All Pages</option>
          {pageLocations.map(page => (
            <option key={page} value={page}>{page.charAt(0).toUpperCase() + page.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading content blocks...</p>
        </div>
      ) : (
        <>
          {/* Content Blocks Grid */}
          <div className="grid gap-4">
            {filteredBlocks.length > 0 ? (
              filteredBlocks.map((block) => (
                <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                        <Layout className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${getBlockTypeColor(block.block_type)}`}>
                            {block.block_type}
                          </span>
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                            {block.page_location}
                          </span>
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
                            Order: {block.sort_order}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            block.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {block.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="font-medium text-text-primary mb-2">
                          {block.block_title || `${block.block_type} Block`}
                        </h3>
                        {block.block_content && (
                          <div className="text-sm text-text-light bg-gray-50 p-2 rounded mb-2">
                            <pre className="whitespace-pre-wrap text-xs overflow-hidden">
                              {typeof block.block_content === 'string' 
                                ? block.block_content.substring(0, 200) + '...'
                                : JSON.stringify(block.block_content, null, 2).substring(0, 200) + '...'}
                            </pre>
                          </div>
                        )}
                        <div className="text-xs text-text-light">
                          Updated: {new Date(block.updated_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSortOrder(block.id, 'up')}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4 text-text-light" />
                      </button>
                      <button
                        onClick={() => updateSortOrder(block.id, 'down')}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4 text-text-light" />
                      </button>
                      <button
                        onClick={() => toggleActive(block.id, block.is_active)}
                        className={`p-1 rounded ${block.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                        title={block.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {block.is_active ? '❌' : '✅'}
                      </button>
                      <button 
                        onClick={() => onView(block)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onEdit(block)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4 text-text-light" />
                      </button>
                      <button 
                        onClick={() => onDelete(block)}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-text-light">
                {searchTerm || filterPage !== 'all' 
                  ? 'No content blocks found matching your criteria' 
                  : 'No content blocks found'}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-text-light flex justify-between">
            <span>Showing {filteredBlocks.length} of {contentBlocks.length} content blocks</span>
            <span>
              Active: {contentBlocks.filter(block => block.is_active).length} | 
              Inactive: {contentBlocks.filter(block => !block.is_active).length}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default HeroTab;
