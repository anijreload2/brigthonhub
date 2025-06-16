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
  Clock,
  Leaf
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodItem, FoodCategory } from '@/lib/types';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function FoodPage() {  const [items, setItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  // Cart functionality temporarily disabled - contact sellers directly for orders
  // const [cart, setCart] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('food_categories')
          .select('*')
          .eq('isActive', true)
          .order('name');

        if (categoriesError) {
          console.error('Error fetching food categories:', categoriesError);
        } else {
          setCategories(categoriesData || []);
        }

        // Fetch food items
        const { data: itemsData, error: itemsError } = await supabase
          .from('food_items')
          .select(`
            *,
            food_categories (
              id,
              name
            )
          `)
          .eq('isActive', true)
          .order('createdAt', { ascending: false });

        if (itemsError) {
          console.error('Error fetching food items:', itemsError);
        } else {
          setItems(itemsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.categoryId === selectedCategory;
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
  const addToCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => ({
      ...prev,
      [itemId]: Math.max((prev[itemId] || 0) - 1, 0)
    }));
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [itemId, quantity]) => {
      const item = items.find(i => i.id === itemId);
      return total + (item?.price || 0) * quantity;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Fresh Food Market
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover the freshest produce from local Nigerian farms. 
              Quality food items delivered directly to your doorstep.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Fresh & Organic
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fast Delivery
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Quality Guaranteed
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search food items..."
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
            </div>
          </div>          {/* Food Items Grid */}
          <div className="mb-12">            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Items</h2>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">{filteredAndSortedItems.length} items found</p>
                {/* Cart UI temporarily disabled - contact sellers directly for orders
                {getTotalItems() > 0 && (
                  <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">
                      {getTotalItems()} items - {CURRENCY.symbol}{getCartTotal().toLocaleString()}
                    </span>
                  </div>
                )}
                */}
              </div>
            </div>
            
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
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
                {filteredAndSortedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow">
                      <CardHeader className="p-0">
                        {item.images && item.images.length > 0 && (
                          <div className="relative w-full h-48 rounded-t-lg overflow-hidden">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                              priority={false}
                            />
                            <Badge className="absolute top-2 left-2 bg-green-600 text-white">
                              Fresh
                            </Badge>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-3">{item.description}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-green-600">
                              {CURRENCY.symbol}{item.price?.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-500">per {item.unit}</span>
                          </div>
                          {(item as any).minimumOrder && (
                            <div className="text-sm text-gray-600 mb-2">
                              Minimum order: {(item as any).minimumOrder} {item.unit}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Stock: {item.stock} {item.unit}</span>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span>4.8</span>
                            </div>
                          </div>
                        </div>                        <div className="space-y-3">
                          {/* Cart functionality temporarily disabled - contact sellers directly 
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeFromCart(item.id)}
                                disabled={!cart[item.id]}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{cart[item.id] || 0}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addToCart(item.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => addToCart(item.id)}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                          */}
                          <Link href={`/food/${item.id}`} className="block">
                            <Button className="w-full bg-green-600 hover:bg-green-700">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Food Market?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We connect you directly with local Nigerian farmers and suppliers, 
                ensuring fresh, quality produce at competitive prices.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 px-6">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fresh & Organic</h3>
                <p className="text-gray-600 text-sm">
                  Sourced directly from local farms with no artificial preservatives
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Same-day delivery within Lagos and next-day delivery nationwide
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
                <p className="text-gray-600 text-sm">
                  100% satisfaction guarantee or your money back
                </p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Always Fresh</h3>
                <p className="text-gray-600 text-sm">
                  Harvest-to-table within 24 hours for maximum freshness
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
