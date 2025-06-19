'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus,
  Minus,
  Star,
  Truck,
  Shield,
  Award,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StoreProduct, StoreCategory } from '@/lib/types';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function StorePage() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  // Cart functionality temporarily disabled - contact sellers directly for orders
  // const [cart, setCart] = useState<{[key: string]: number}>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('store_categories')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (categoriesError) {

        } else {
          setCategories(categoriesData || []);
        }

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('store_products')
          .select(`
            *,
            store_categories (
              id,
              name
            )
          `)
          .eq('is_active', true)
          .order('name');

        if (productsError) {

        } else {
          setProducts(productsData || []);
        }
      } catch (error) {

      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'name':
        default:
          return (a.name || '').localeCompare(b.name || '');
      }
    });

  // Cart functionality temporarily disabled - contact sellers directly for orders
  /*
  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 0) - 1, 0)
    }));
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Business Marketplace
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Complete business solutions from office furniture to building materials. 
              Everything you need to equip and grow your business.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Quality Products
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fast Delivery
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Trusted Brands
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              {/* Cart button temporarily disabled - contact sellers directly
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({getTotalItems()})
              </Button>
              */}
            </div>
          </div>

          {/* Products Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
              <p className="text-gray-600">{filteredAndSortedProducts.length} products found</p>
            </div>
            
            {filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <Button 
                  onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}
                  className="mt-4"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow">
                      <CardHeader className="p-0">
                        {product.images && product.images.length > 0 && (
                          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            {product.brand && (
                              <Badge className="absolute top-2 left-2 bg-blue-600">
                                {product.brand}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{product.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-blue-600">
                              {CURRENCY.symbol}{product.price?.toLocaleString()}
                            </span>
                          </div>
                          <Badge variant="outline">
                            Stock: {product.stock}
                          </Badge>
                        </div>

                        {product.model && (
                          <p className="text-sm text-gray-500 mb-4">
                            Model: {product.model}
                          </p>
                        )}

                        {product.features && product.features.length > 0 && (
                          <div className="mb-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">Features:</p>
                            <div className="flex flex-wrap gap-1">
                              {product.features.slice(0, 3).map((feature, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                              {product.features.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{product.features.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-3">
                          {/* Cart functionality temporarily disabled - contact sellers directly
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {cart[product.id] ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(product.id)}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <span className="text-sm font-medium px-2">
                                    {cart[product.id]}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToCart(product.id)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  onClick={() => addToCart(product.id)}
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Add to Cart
                                </Button>
                              )}
                            </div>
                          </div>
                          */}
                          <Link href={`/store/${product.id}`} className="block">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                              View Details & Contact Seller
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Features Section */}
          <section className="py-12 bg-white rounded-xl shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Marketplace?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Your one-stop destination for all business needs. From office setup to construction materials, 
                we have everything to help your business succeed.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 px-6">
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Products</h3>
                <p className="text-gray-600 text-sm">
                  Carefully curated products from trusted manufacturers and suppliers
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Quick delivery across Nigeria with tracking and insurance options
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trusted Brands</h3>
                <p className="text-gray-600 text-sm">
                  Partner with leading brands and certified suppliers for genuine products
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Warranty Support</h3>
                <p className="text-gray-600 text-sm">
                  Comprehensive warranty and after-sales support for all products
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}