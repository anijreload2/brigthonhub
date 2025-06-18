'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  Plus,
  Minus,
  Star,
  Package,
  Truck,
  Shield,
  Heart,
  Share2,
  Leaf,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENCY } from '@/lib/constants';

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  minimumOrder: number;
  stock: number;
  images: string[];
  nutritionalInfo?: any;
  origin?: string;
  is_active: boolean;
  created_at: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerAddress?: string;
  sellerDescription?: string;
}

interface FoodDetailPageProps {
  params: { id: string };
}

export default function FoodDetailPage({ params }: FoodDetailPageProps) {
  const [foodItem, setFoodItem] = useState<FoodItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchFoodItem = async () => {
      try {
        const response = await fetch(`/api/food/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch food item');
        }
        const data = await response.json();
        setFoodItem(data.foodItem);
        setRelatedItems(data.relatedItems || []);
        setQuantity(data.foodItem.minimum_order || 1);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodItem();
  }, [params.id]);

  const nextImage = () => {
    if (foodItem?.images) {
      setCurrentImageIndex((prev) => 
        prev === foodItem.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (foodItem?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? foodItem.images.length - 1 : prev - 1
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, foodItem?.stock || 999));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, foodItem?.minimumOrder || 1));
  };

  // Cart functionality temporarily disabled - contact sellers directly
  /*
  const handleAddToCart = () => {
    // Add to cart logic here
    alert(`Added ${quantity} ${foodItem?.unit} of ${foodItem?.name} to cart!`);
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading food item...</p>
        </div>
      </div>
    );
  }

  if (error || !foodItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Food Item Not Found</h1>
          <p className="text-gray-600 mb-8">The food item you're looking for doesn't exist.</p>
          <Link href="/food">
            <Button>Back to Food Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/food" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Food Marketplace</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setIsLiked(!isLiked)}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Image Gallery */}
          <div>
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 md:h-[500px]">
                  {foodItem.images && foodItem.images.length > 0 ? (
                    <>
                      <Image
                        src={foodItem.images[currentImageIndex]}
                        alt={foodItem.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {foodItem.images.length > 1 && (
                        <>                          <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                            aria-label="Next image"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    <Badge className="bg-green-500 text-white">
                      <Leaf className="w-3 h-3 mr-1" />
                      Fresh
                    </Badge>
                    {foodItem.stock < 10 && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {foodItem.images && foodItem.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2 overflow-x-auto">
                      {foodItem.images.map((image, index) => (                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${foodItem.name} ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{foodItem.name}</h1>
              {foodItem.origin && (
                <div className="flex items-center space-x-2 text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>Origin: {foodItem.origin}</span>
                </div>
              )}
              <div className="flex items-center space-x-4 mb-4">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(foodItem.price)}
                </div>
                <span className="text-gray-600">per {foodItem.unit}</span>
              </div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8/5 from 24 reviews)</span>
              </div>
            </div>

            <Separator />

            {/* Stock and Quantity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Stock Available:</span>
                <span className="font-medium">{foodItem.stock} {foodItem.unit}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Minimum Order:</span>
                <span className="font-medium">{foodItem.minimumOrder} {foodItem.unit}s</span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= (foodItem.minimumOrder || 1)}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= foodItem.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-gray-600">{foodItem.unit}s</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">{formatPrice(foodItem.price * quantity)}</span>
              </div>
            </div>            <Separator />            {/* Contact Seller - Cart functionality disabled */}
            <div className="space-y-3">
              <Button 
                onClick={() => alert('Contact form for ' + foodItem.name + ' will open here')}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                <Package className="w-5 h-5 mr-2" />
                Contact Seller
              </Button>
              <div className="text-center text-sm text-gray-500">
                Contact seller directly for pricing and availability
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Truck className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <div className="text-sm font-medium">Fast Delivery</div>
                <div className="text-xs text-gray-600">Same day</div>
              </div>
              <div className="text-center">
                <Shield className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                <div className="text-sm font-medium">Quality Assured</div>
                <div className="text-xs text-gray-600">Fresh guarantee</div>
              </div>
              <div className="text-center">
                <Clock className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                <div className="text-sm font-medium">24/7 Support</div>
                <div className="text-xs text-gray-600">Customer care</div>
              </div>
            </div>
          </div>
        </div>        {/* Product Details Tabs */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="seller">Seller Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{foodItem.description}</p>
                  
                  {foodItem.origin && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3 text-gray-900">Origin & Source</h3>
                      <div className="flex items-center space-x-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-green-500" />
                        <span>{foodItem.origin}</span>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit</span>
                        <span className="font-medium">{foodItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Minimum Order</span>
                        <span className="font-medium">{foodItem.minimumOrder} {foodItem.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Stock Available</span>
                        <span className="font-medium">{foodItem.stock} {foodItem.unit}</span>
                      </div>
                      {foodItem.origin && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Origin</span>
                          <span className="font-medium">{foodItem.origin}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {foodItem.nutritionalInfo && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Nutritional Information</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">120</div>
                          <div className="text-sm text-gray-600">Calories</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">5g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">25g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-primary">2g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="seller" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                  
                  {foodItem.sellerName || foodItem.sellerPhone || foodItem.sellerEmail ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {foodItem.sellerName && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Seller Name</label>
                            <p className="text-gray-900">{foodItem.sellerName}</p>
                          </div>
                        )}
                        
                        {foodItem.sellerPhone && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900">
                              <a href={`tel:${foodItem.sellerPhone}`} className="text-green-600 hover:underline">
                                {foodItem.sellerPhone}
                              </a>
                            </p>
                          </div>
                        )}
                        
                        {foodItem.sellerEmail && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900">
                              <a href={`mailto:${foodItem.sellerEmail}`} className="text-green-600 hover:underline">
                                {foodItem.sellerEmail}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {foodItem.sellerAddress && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <p className="text-gray-900">{foodItem.sellerAddress}</p>
                          </div>
                        )}
                        
                        {foodItem.sellerDescription && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">About Seller</label>
                            <p className="text-gray-700 leading-relaxed">{foodItem.sellerDescription}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">Seller information not available</p>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Contact the seller directly for bulk orders, fresh availability, or any questions about this product.
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-gray-600">Reviews coming soon...</p>
                  <Button variant="outline" className="mt-4">
                    Be the first to review
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedItems.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedItems.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={item.images[0] || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{item.name}</h3>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold text-primary">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-sm text-gray-600 ml-1">/{item.unit}</span>
                        </div>
                        <Link href={`/food/${item.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
