'use client';

import React, { useState, useEffect } from 'react';
import { Package, Search, Plus, Eye, Edit, Trash2, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface MarketplaceTabProps {
  onAdd: () => void;
  onEdit: (data: any) => void;
  onView: (data: any) => void;
  onDelete: (data: any) => void;
}

const MarketplaceTab: React.FC<MarketplaceTabProps> = ({ onAdd, onEdit, onView, onDelete }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase        .from('store_products')
        .select(`
          *,
          store_categories:categoryId (
            id,
            name
          )
        `)
        .order('createdAt', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('*')
        .eq('isActive', true)
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setCategories(data || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.categoryId === filterCategory;
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
        <h2 className="text-xl font-bold text-text-primary">Marketplace Management</h2>
        <button onClick={onAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" />
          Add Product
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
            placeholder="Search products..."
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
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-text-light">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 bg-link bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Store className="w-4 h-4 text-link" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => onView(product)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="View"
                    >
                      <Eye className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onEdit(product)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4 text-text-light" />
                    </button>
                    <button 
                      onClick={() => onDelete(product)}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
                
                {product.images && product.images.length > 0 && (
                  <div className="mb-3">
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                )}
                
                <h4 className="font-semibold text-text-primary mb-1">{product.name}</h4>
                <p className="text-sm text-text-light mb-2 line-clamp-2">{product.description}</p>
                <p className="text-lg font-bold text-primary mb-1">{formatPrice(product.price)}</p>
                <div className="text-xs text-text-light space-y-1">
                  {product.brand && <p>Brand: {product.brand}</p>}
                  {product.model && <p>Model: {product.model}</p>}
                  <p>Stock: {product.stock}</p>
                  <p>Category: {product.store_categories?.name || 'N/A'}</p>
                  <div className="flex items-center gap-2">
                    <Package className="w-3 h-3" />
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      product.isActive 
                        ? 'bg-success bg-opacity-10 text-success'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-8 text-text-light">
                {searchTerm || filterCategory !== 'all' ? 'No products found matching your criteria' : 'No products found'}
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-text-light">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </>
      )}
    </div>
  );
};

export default MarketplaceTab;
