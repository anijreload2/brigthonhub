
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

// Sample food categories
const sampleCategories: FoodCategory[] = [
  {
    id: '1',
    name: 'Vegetables',
    description: 'Fresh vegetables from local farms',
    image: '{https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhKvrUdMlfT1C4CLT3f7qsb9QjXKiNTjBxMJk6c8nOCn55lHWn-UAxraEyInesPa816i8S3wtErIHRSI53EnFFH4lztIZxbiX1ull3GLDoLc8KXuDCimxsfdMIDaKFTCZR82uhTbt8Fdj7Z/s1600/6+Deluxe+Combo.jpg}',
    isActive: true
  },
  {
    id: '2',
    name: 'Fruits',
    description: 'Seasonal fruits and tropical produce',
    image: '{https://i.pinimg.com/736x/bd/a9/b5/bda9b5a7d23a4dc3d4fb2df77244b02e.jpg}',
    isActive: true
  },
  {
    id: '3',
    name: 'Grains & Cereals',
    description: 'Rice, beans, and other staple grains',
    image: '{https://c8.alamy.com/comp/E7A4D0/bags-of-grains-for-sale-in-an-outdoor-market-in-rural-china-E7A4D0.jpg}',
    isActive: true
  },
  {
    id: '4',
    name: 'Spices & Seasonings',
    description: 'Local spices and cooking ingredients',
    image: '{https://i.pinimg.com/originals/2a/37/11/2a3711fef406f9c1cb761e8d478cf8b5.jpg}',
    isActive: true
  }
];

// Sample food items
const sampleFoodItems: FoodItem[] = [
  {
    id: '1',
    name: 'Fresh Tomatoes',
    description: 'Premium quality tomatoes from Jos Plateau farms. Perfect for cooking and salads.',
    categoryId: '1',
    price: 2500,
    unit: 'basket',
    minimumOrder: 5,
    stock: 100,
    images: [
      '{https://thumbs.dreamstime.com/z/fresh-tasty-red-tomatoes-wicker-basket-isolated-299989293.jpg}',
      '{https://i.pinimg.com/736x/05/ed/b1/05edb1267be36bfcf056539e0db51acc--vine-tomatoes.jpg}'
    ],
    nutritionalInfo: {
      calories: 18,
      vitamin_c: '28mg',
      lycopene: 'High'
    },
    origin: 'Jos, Plateau State',
    isActive: true,
    vendorId: 'vendor1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Sweet Plantains',
    description: 'Ripe plantains perfect for frying or boiling. Sweet and nutritious.',
    categoryId: '2',
    price: 1800,
    unit: 'bunch',
    minimumOrder: 10,
    stock: 50,
    images: [
      '{https://thumbs.dreamstime.com/z/bunches-ripe-yellow-plantain-babana-bunches-ripe-yellow-plantain-babana-most-popular-fruit-state-kerala-kerala-274897593.jpg}',
      '{https://c8.alamy.com/comp/MHP8JH/green-bunch-of-plantain-bananas-on-the-tree-plantain-banana-is-a-delicacy-fruit-common-in-the-latin-american-diet-MHP8JH.jpg}'
    ],
    nutritionalInfo: {
      calories: 122,
      potassium: '358mg',
      fiber: '2.3g'
    },
    origin: 'Ogun State',
    isActive: true,
    vendorId: 'vendor1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Local Rice (Ofada)',
    description: 'Premium quality local rice with unique aroma and taste. Unpolished and nutritious.',
    categoryId: '3',
    price: 8500,
    unit: '50kg bag',
    minimumOrder: 2,
    stock: 25,
    images: [
      '{https://mile12market.com/wp-content/uploads/2014/12/mile12_market_online_mama-gold-rice.png}',
      '{https://img.freepik.com/free-photo/rice-grains-wood-bowl-isolated_253984-362.jpg?size=626&ext=jpg}'
    ],
    nutritionalInfo: {
      protein: '7g per 100g',
      carbs: '77g per 100g',
      fiber: '1.4g per 100g'
    },
    origin: 'Ogun State',
    isActive: true,
    vendorId: 'vendor2',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Scotch Bonnet Peppers',
    description: 'Hot and flavorful peppers essential for Nigerian cuisine. Fresh and spicy.',
    categoryId: '4',
    price: 3200,
    unit: 'kg',
    minimumOrder: 2,
    stock: 30,
    images: [
      '{https://c8.alamy.com/comp/2B1DXAT/yellow-and-red-scotch-bonnet-chili-peppers-in-wooden-bowl-over-green-background-copy-space-2B1DXAT.jpg}',
      '{https://i.pinimg.com/originals/03/23/e2/0323e29ea26fe8cc2666b19b3195a48f.jpg}'
    ],
    nutritionalInfo: {
      vitamin_c: 'Very High',
      capsaicin: 'High',
      antioxidants: 'Rich'
    },
    origin: 'Kaduna State',
    isActive: true,
    vendorId: 'vendor2',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function FoodPage() {
  const [categories] = useState<FoodCategory[]>(sampleCategories);
  const [foodItems, setFoodItems] = useState<FoodItem[]>(sampleFoodItems);
  const [filteredItems, setFilteredItems] = useState<FoodItem[]>(sampleFoodItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  useEffect(() => {
    let filtered = foodItems;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.origin?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    setFilteredItems(filtered);
  }, [foodItems, searchTerm, selectedCategory, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const addToCart = (itemId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + quantity
    }));
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-brand-gradient text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Fresh Food Supply
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Premium quality bulk produce from trusted Nigerian farms delivered fresh to your doorstep
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for fresh produce, grains, spices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 border-0 rounded-lg shadow-lg"
                />
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: Leaf, title: 'Farm Fresh', description: 'Direct from local farms' },
              { icon: Truck, title: 'Fast Delivery', description: 'Same day delivery available' },
              { icon: Shield, title: 'Quality Assured', description: 'Rigorous quality checks' },
              { icon: Clock, title: 'Bulk Orders', description: 'Competitive wholesale pricing' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                  <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <span className="font-medium">All Categories</span>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <span className="font-medium">{category.name}</span>
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="text-sm text-gray-600">
                {filteredItems.length} items found
              </div>
            </div>

            {getTotalItems() > 0 && (
              <Button className="btn-secondary">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({getTotalItems()})
              </Button>
            )}
          </div>

          {/* Food Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover border-0 shadow-md overflow-hidden h-full">
                  <div className="relative h-48">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-secondary text-white">
                        Fresh
                      </Badge>
                    </div>
                    {item.stock < 10 && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="destructive">
                          Low Stock
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="text-xl font-bold text-primary">
                          {formatPrice(item.price)}
                        </div>
                        <div className="text-sm text-gray-600">
                          per {item.unit}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Origin:</span>
                          <span className="font-medium">{item.origin}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Min Order:</span>
                          <span className="font-medium">{item.minimumOrder} {item.unit}s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-medium">{item.stock} available</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      {cart[item.id] ? (
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium">{cart[item.id]} {item.unit}s</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full btn-primary"
                          onClick={() => addToCart(item.id, item.minimumOrder)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search or category filter</p>
              <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
