
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

// Sample store categories
const sampleCategories: StoreCategory[] = [
  {
    id: '1',
    name: 'Office Furniture',
    description: 'Desks, chairs, cabinets and office equipment',
    image: '{https://i.pinimg.com/originals/cc/ab/e5/ccabe593a089b34ba60f17723f023724.jpg}',
    isActive: true
  },
  {
    id: '2',
    name: 'Building Materials',
    description: 'Cement, steel, tiles and construction supplies',
    image: '{https://i.pinimg.com/originals/5f/ab/ea/5fabea9a75a05942fbfc986b319efa10.jpg}',
    isActive: true
  },
  {
    id: '3',
    name: 'Equipment Supply',
    description: 'Tools, machinery and industrial equipment',
    image: '{https://i.pinimg.com/736x/e9/ae/52/e9ae526f42d8af3960c268d043368886.jpg}',
    isActive: true
  },
  {
    id: '4',
    name: 'Electronics',
    description: 'Office electronics and technology solutions',
    image: '{https://www.tds-office.com/wp-content/uploads/2018/10/office-electronics-printers-copiers.jpg}',
    isActive: true
  }
];

// Sample store products
const sampleProducts: StoreProduct[] = [
  {
    id: '1',
    name: 'Executive Office Desk',
    description: 'Premium wooden executive desk with drawers and cable management. Perfect for modern offices.',
    categoryId: '1',
    price: 185000,
    stock: 15,
    images: [
      '{https://i.pinimg.com/originals/57/07/a5/5707a598588e86e9fd900c5cb7b730c1.jpg}',
      '{https://i.pinimg.com/originals/74/8a/24/748a2495c8d9d30a75ba2c4f8e2d64c4.png}'
    ],
    features: ['Solid Wood', 'Cable Management', 'Drawers', 'Scratch Resistant'],
    brand: 'OfficePro',
    model: 'EP-2024',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Ergonomic Office Chair',
    description: 'High-back ergonomic chair with lumbar support and adjustable height. Comfortable for long work hours.',
    categoryId: '1',
    price: 95000,
    stock: 25,
    images: [
      '{https://jncodeals.com/wp-content/uploads/2020/10/81MvFPynoUL._AC_SL1500_-1.jpg}',
      '{https://i.pinimg.com/originals/a5/64/7f/a5647f1f24dcd19a381d9975b4083f1c.jpg}'
    ],
    features: ['Lumbar Support', 'Adjustable Height', 'Mesh Back', 'Armrests'],
    brand: 'ComfortSeating',
    model: 'CS-Pro',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Portland Cement (50kg)',
    description: 'High-grade Portland cement suitable for all construction projects. Meets international standards.',
    categoryId: '2',
    price: 4200,
    stock: 500,
    images: [
      '{https://c8.alamy.com/comp/2F142DY/cement-bags-stacked-in-warehouse-2F142DY.jpg}',
      '{https://i.pinimg.com/originals/16/4f/95/164f95b30108063a7fdd5541072c5efe.jpg}'
    ],
    features: ['Grade 42.5', 'Fast Setting', 'High Strength', 'Weather Resistant'],
    brand: 'Dangote',
    model: '3X',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    name: 'Ceramic Floor Tiles',
    description: 'Premium ceramic tiles with anti-slip surface. Available in various colors and patterns.',
    categoryId: '2',
    price: 3500,
    stock: 200,
    images: [
      '{https://i.pinimg.com/originals/d0/be/9e/d0be9e70aea389258c59d74b6d7182bb.jpg}',
      '{https://i.pinimg.com/originals/a6/83/25/a683259cfb919452ed62fc55684f49ac.jpg}'
    ],
    features: ['Anti-Slip', 'Water Resistant', 'Easy Clean', 'Durable'],
    brand: 'TileMax',
    model: 'TM-600',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '5',
    name: 'Power Drill Set',
    description: 'Professional cordless drill with multiple bits and carrying case. Perfect for construction work.',
    categoryId: '3',
    price: 45000,
    stock: 30,
    images: [
      '{https://m.media-amazon.com/images/I/71GhQ-RE6PL.jpg}',
      '{https://i.ytimg.com/vi/1R4xYKL6nNM/maxresdefault.jpg}'
    ],
    features: ['Cordless', 'Multiple Bits', 'LED Light', 'Carrying Case'],
    brand: 'PowerTools',
    model: 'PT-18V',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '6',
    name: 'Desktop Computer',
    description: 'Complete desktop computer system with monitor, keyboard and mouse. Ready for office use.',
    categoryId: '4',
    price: 320000,
    stock: 12,
    images: [
      '{https://i.ytimg.com/vi/GeP31f9jtpk/maxresdefault.jpg}',
      '{https://i.pinimg.com/originals/11/2c/e1/112ce1857d1438227b7d5696329b3c63.jpg}'
    ],
    features: ['Intel i5', '8GB RAM', '256GB SSD', '21" Monitor'],
    brand: 'TechPro',
    model: 'TP-Office',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function StorePage() {
  const [categories] = useState<StoreCategory[]>(sampleCategories);
  const [products, setProducts] = useState<StoreProduct[]>(sampleProducts);
  const [filteredProducts, setFilteredProducts] = useState<StoreProduct[]>(sampleProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
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

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId] -= 1;
      } else {
        delete newCart[productId];
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
              Business Marketplace
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Office furniture, building materials, and equipment supply for all your business needs
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for office furniture, building materials, equipment..."
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
              { icon: Package, title: 'Bulk Orders', description: 'Wholesale pricing available' },
              { icon: Truck, title: 'Fast Delivery', description: 'Quick delivery nationwide' },
              { icon: Shield, title: 'Quality Assured', description: 'Genuine products only' },
              { icon: Award, title: 'Trusted Brands', description: 'Top quality brands' }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="text-center">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-accent" />
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
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="h-auto p-4 flex flex-col items-center space-y-2"
            >
              <span className="font-medium">All Products</span>
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category.id)}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <span className="font-medium text-center">{category.name}</span>
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
                {filteredProducts.length} products found
              </div>
            </div>

            {getTotalItems() > 0 && (
              <Button className="btn-accent">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart ({getTotalItems()})
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="card-hover border-0 shadow-md overflow-hidden h-full">
                  <div className="relative h-48">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-accent text-white">
                        {product.brand}
                      </Badge>
                    </div>
                    {product.stock < 10 && (
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
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="text-2xl font-bold text-primary mb-3">
                        {formatPrice(product.price)}
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Brand:</span>
                          <span className="font-medium">{product.brand}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Model:</span>
                          <span className="font-medium">{product.model}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Stock:</span>
                          <span className="font-medium">{product.stock} available</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {product.features.slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {product.features.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{product.features.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      {cart[product.id] ? (
                        <div className="flex items-center justify-between">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-medium">{cart[product.id]} items</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(product.id)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="w-full btn-accent"
                          onClick={() => addToCart(product.id)}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
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
