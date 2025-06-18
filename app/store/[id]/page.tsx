'use client';

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Star,
  Heart,
  Share2,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CURRENCY } from '@/lib/constants';

interface StoreProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  sku: string;
  stock: number;
  images: string[];
  specifications?: any;
  category: string;
  brand?: string;
  tags?: string[];
  weight?: number;
  dimensions?: string;
  averageRating?: number;
  reviewCount?: number;
  isActive: boolean;
  isFeatured: boolean;
  sellerName?: string;
  sellerPhone?: string;
  sellerEmail?: string;
  sellerAddress?: string;
  sellerDescription?: string;
}

interface ProductDetailPageProps {
  params: { id: string };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/store/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const nextImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (product?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? product.images.length - 1 : prev - 1
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

  const calculateDiscount = () => {
    if (product?.discountPrice && product?.price) {
      return Math.round(((product.price - product.discountPrice) / product.price) * 100);
    }
    return 0;
  };
  const incrementQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, product?.stock || 999));
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };

  // Cart functionality temporarily disabled - contact sellers directly
  /*
  const handleAddToCart = () => {
    // Add to cart logic here
    alert(`Added ${quantity} ${product?.name} to cart!`);
  };

  const handleBuyNow = () => {
    // Buy now logic here
    alert(`Proceeding to checkout with ${quantity} ${product?.name}`);
  };
  */

  const handleContactSeller = () => {
    // Contact seller logic here
    alert(`Contact form for ${product?.name} will open here`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
          <Link href="/store">
            <Button>Back to Store</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/store" className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Store</span>
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
          {/* Product Images */}
          <div>
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 md:h-[500px]">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <Image
                        src={product.images[currentImageIndex]}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {product.images.length > 1 && (
                        <>
                          <button
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
                    {product.isFeatured && (
                      <Badge className="bg-yellow-500 text-white">
                        <Award className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {discount > 0 && (
                      <Badge variant="destructive">
                        -{discount}% OFF
                      </Badge>
                    )}
                    {product.stock < 10 && (
                      <Badge variant="destructive">Low Stock</Badge>
                    )}
                  </div>
                </div>
                
                {/* Thumbnail Gallery */}
                {product.images && product.images.length > 1 && (
                  <div className="p-4 border-t">
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={image}
                            alt={`${product.name} ${index + 1}`}
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
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{product.category}</Badge>
                {product.brand && <Badge variant="outline">{product.brand}</Badge>}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Ratings */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < Math.floor(product.averageRating || 0) 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.averageRating || 0}/5 from {product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(product.discountPrice || product.price)}
                </div>
                {product.discountPrice && (
                  <div className="text-xl text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </div>
                )}
                {discount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    Save {discount}%
                  </Badge>
                )}
              </div>

              {/* SKU and Stock */}
              <div className="flex items-center space-x-6 mb-6 text-sm text-gray-600">
                <span>SKU: {product.sku}</span>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{product.stock} in stock</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Variants (if applicable) */}
            <div className="space-y-4">
              {/* Color Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Color</label>
                <div className="flex space-x-2">                  {['Black', 'White', 'Blue', 'Red'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-primary' : 'border-gray-300'
                      } ${
                        color === 'Black' ? 'bg-black' :
                        color === 'White' ? 'bg-white' :
                        color === 'Blue' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`}
                      aria-label={`Select ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Size</label>
                <div className="flex space-x-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        selectedSize === size 
                          ? 'border-primary bg-primary text-white' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Quantity</label>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-medium text-lg w-12 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary">
                  {formatPrice((product.discountPrice || product.price) * quantity)}
                </span>
              </div>
            </div>

            <Separator />            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={handleContactSeller}
                className="w-full"
                size="lg"
              >
                <Package className="w-5 h-5 mr-2" />
                Contact Seller
              </Button>
              <div className="text-center text-sm text-gray-500">
                Contact seller directly for pricing and availability
              </div>
            </div>            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="w-4 h-4 text-green-500" />
                <span>Direct delivery</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-blue-500" />
                <span>Verified seller</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <RotateCcw className="w-4 h-4 text-purple-500" />
                <span>Flexible terms</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>Quality guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-8">
          <CardContent className="p-6">            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
                <TabsTrigger value="seller">Seller Info</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand</span>
                      <span className="font-medium">{product.brand || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    {product.weight && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight</span>
                        <span className="font-medium">{product.weight}kg</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Dimensions</span>
                        <span className="font-medium">{product.dimensions}</span>
                      </div>
                    )}
                  </div>
                </div>              </TabsContent>
              
              <TabsContent value="seller" className="mt-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900">Seller Information</h3>
                  
                  {product.sellerName || product.sellerPhone || product.sellerEmail ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        {product.sellerName && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Seller Name</label>
                            <p className="text-gray-900">{product.sellerName}</p>
                          </div>
                        )}
                        
                        {product.sellerPhone && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="text-gray-900">
                              <a href={`tel:${product.sellerPhone}`} className="text-blue-600 hover:underline">
                                {product.sellerPhone}
                              </a>
                            </p>
                          </div>
                        )}
                        
                        {product.sellerEmail && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="text-gray-900">
                              <a href={`mailto:${product.sellerEmail}`} className="text-blue-600 hover:underline">
                                {product.sellerEmail}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-4">
                        {product.sellerAddress && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">Address</label>
                            <p className="text-gray-900">{product.sellerAddress}</p>
                          </div>
                        )}
                        
                        {product.sellerDescription && (
                          <div>
                            <label className="text-sm font-medium text-gray-600">About Seller</label>
                            <p className="text-gray-700 leading-relaxed">{product.sellerDescription}</p>
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
                      Contact the seller directly for bulk orders, custom requirements, or any questions about this product.
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
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={relatedProduct.images[0] || '/placeholder.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {relatedProduct.discountPrice && (
                        <div className="absolute top-4 left-4">
                          <Badge variant="destructive">
                            -{Math.round(((relatedProduct.price - relatedProduct.discountPrice) / relatedProduct.price) * 100)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProduct.name}</h3>
                      <div className="flex items-center space-x-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-3 h-3 ${
                              i < Math.floor(relatedProduct.averageRating || 0) 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-gray-300'
                            }`} 
                          />
                        ))}
                        <span className="text-xs text-gray-600">({relatedProduct.reviewCount || 0})</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-primary">
                            {formatPrice(relatedProduct.discountPrice || relatedProduct.price)}
                          </span>
                          {relatedProduct.discountPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(relatedProduct.price)}
                            </span>
                          )}
                        </div>
                        <Link href={`/store/${relatedProduct.id}`}>
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
