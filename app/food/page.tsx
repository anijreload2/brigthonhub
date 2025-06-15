'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
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
import { Button } from '@/comp                        {(item as any).minimumOrder && (
                          <div className="text-sm text-gray-600 mb-2">
                            Minimum order: {(item as any).minimumOrder} {item.unit}
                          </div>
                        )}s/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodItem, FoodCategory } from '@/lib/types';
import { CURRENCY } from '@/lib/constants';
import { supabase } from '@/lib/supabase';

export default function FoodPage() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [cart, setCart] = useState<{[key: string]: number}>({});

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
        const { data: foodItemsData, error: foodItemsError } = await supabase
          .from('food_items')
          .select(`
            *,
            food_categories (
              id,
              name
            )
          `)
          .eq('isActive', true)
          .order('name');

        if (foodItemsError) {
          console.error('Error fetching food items:', foodItemsError);
        } else {
          setFoodItems(foodItemsData || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and sort food items
  const filteredAndSortedItems = foodItems
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

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

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
              Fresh Food Supply
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Premium quality bulk produce and fresh ingredients delivered to your doorstep. 
              Supporting Nigerian farmers and feeding communities.
            </p>
            <div className="flex justify-center gap-4 mb-8">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Farm Fresh
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                Fast Delivery
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Quality Assured
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
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Cart ({getTotalItems()})
              </Button>
            </div>
          </div>

          {/* Categories Section */}
          {categories.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse Categories</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <motion.div
                    key={category.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Card 
                      className="h-full hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <CardContent className="p-4 text-center">
                        {category.image && (
                          <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden">
                            <Image
                              src={category.image}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Food Items Grid */}
          <div className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Available Products</h2>
              <p className="text-gray-600">{filteredAndSortedItems.length} items found</p>
            </div>
            
            {filteredAndSortedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No food items found matching your criteria.</p>
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
                              className="object-cover"
                            />
                            {item.origin && (
                              <Badge className="absolute top-2 left-2 bg-green-600">
                                {item.origin}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-green-600">
                              {CURRENCY.symbol}{item.price?.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm">/{item.unit}</span>
                          </div>
                          <Badge variant="outline">
                            Stock: {item.stock}
                          </Badge>
                        </div>

                        {item.minimum_order && (
                          <p className="text-sm text-gray-500 mb-4">
                            Minimum order: {item.minimum_order} {item.unit}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {cart[item.id] ? (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium px-2">
                                  {cart[item.id]}
                                </span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => addToCart(item.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => addToCart(item.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </Button>
                            )}
                          </div>
                        </div>

                        {item.nutritional_info && (
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-500 font-medium mb-1">Nutritional Info:</p>
                            <div className="flex flex-wrap gap-1">
                              {typeof item.nutritional_info === 'object' && 
                                Object.entries(item.nutritional_info).map(([key, value]) => (
                                  <Badge key={key} variant="secondary" className="text-xs">
                                    {key}: {value}
                                  </Badge>
                                ))
                              }
                            </div>
                          </div>
                        )}
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Food Supply?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We connect you directly with Nigerian farmers and suppliers for the freshest, 
                highest quality produce at competitive prices.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6 px-6">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Farm Fresh</h3>
                <p className="text-gray-600 text-sm">
                  Direct from local farms ensuring maximum freshness and nutrition
                </p>
              </div>
              <div className="text-center">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Same-day delivery in Lagos and next-day delivery to other major cities
                </p>
              </div>
              <div className="text-center">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality Assured</h3>
                <p className="text-gray-600 text-sm">
                  Rigorous quality checks and standards ensure you get the best products
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Round-the-clock customer support for all your food supply needs
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}