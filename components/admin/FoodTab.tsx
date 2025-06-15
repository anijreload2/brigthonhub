'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, Plus, Eye, Edit, Trash2, Package } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FoodTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const FoodTab: React.FC<FoodTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [foodCategories, setFoodCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('food_items')
        .select(`
          *,
          food_categories (
            id,
            name
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching food items:', error);
      } else {
        setFoodItems(data || []);
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('food_categories')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) {
        console.error('Error fetching food categories:', error);
      } else {
        setFoodCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching food categories:', error);
    }
  };

  useEffect(() => {
    fetchFoodItems();
    fetchFoodCategories();
  }, []);

  const filteredFoodItems = foodItems.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Food Services Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Food Item
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
            placeholder="Search food items..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none"
          title="Filter by category"
        >
          <option value="all">All Categories</option>
          {foodCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading food items...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoodItems.length > 0 ? filteredFoodItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onView(item)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onEdit(item)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onDelete(item)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {item.images && item.images.length > 0 && (
                  <div className="mb-3">
                    <img 
                      src={item.images[0]} 
                      alt={item.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-food.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-semibold text-text-primary mb-1">{item.name}</h4>
                <p className="text-sm text-text-light mb-2 line-clamp-2">{item.description}</p>
                <p className="text-lg font-bold text-primary mb-1">{formatPrice(item.price)}</p>
                <div className="text-xs text-text-light space-y-1">
                  <p>Unit: {item.unit}</p>
                  <p>Stock: {item.stock}</p>
                  <p>Category: {item.food_categories?.name || 'N/A'}</p>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.isActive 
                        ? 'bg-success bg-opacity-10 text-success'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-text-light">
                {searchTerm || filterCategory !== 'all' ? 'No food items found matching your criteria' : 'No food items found'}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-text-light">
            Showing {filteredFoodItems.length} of {foodItems.length} food items
          </div>
        </>
      )}
    </div>
  );
};

export default FoodTab;
