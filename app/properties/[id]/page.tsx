'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Heart,
  Share2,
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
  Eye,
  Car
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ContactForm from '@/components/ui/contact-form';
// import { PropertyCard } from '@/components/properties/property-card';

interface Property {
  id: string;
  title: string;
  description: string;
  specifications?: string;
  price: number;
  location: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  parking?: number;
  images: string[];
  propertyType: string;
  listingType: string;
  agent?: {
    name: string;
    phone?: string;
    email?: string;
    image?: string;
    showPhone: boolean;
    showEmail: boolean;
    bio?: string;
  };
  reviews?: {
    id: string;
    rating: number;
    comment: string;
    author: string;
    date: string;
  }[];
  isActive: boolean;
  createdAt: string;
}

interface PropertyDetailPageProps {
  params: { id: string };
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const [property, setProperty] = useState<Property | null>(null);
  const [relatedProperties, setRelatedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'agent' | 'reviews'>('description');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        const data = await response.json();
        setProperty(data.property);
        setRelatedProperties(data.relatedProperties || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const nextImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleBookmark = async () => {
    // TODO: Check if user is logged in and implement bookmark functionality
    setIsBookmarked(!isBookmarked);
    // Show feedback
    alert(isBookmarked ? 'Property removed from bookmarks!' : 'Property bookmarked!');
  };

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
        // Fallback to copying URL
        navigator.clipboard.writeText(window.location.href);
        alert('Property link copied to clipboard!');
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Property link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/properties" className="flex items-center text-gray-600 hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-96 bg-gray-200">
                {property.images && property.images.length > 0 ? (
                  <>
                    <Image
                      src={property.images[currentImageIndex]}
                      alt={property.title}
                      fill
                      className="object-cover"
                    />
                    {property.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {property.images.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                              }`}
                              aria-label={`View image ${index + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Eye className="w-8 h-8 mr-2" />
                    No images available
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {property.images && property.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <Image
                        src={image}
                        alt={`View ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Property Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl mb-2">{property.title}</CardTitle>
                    <div className="flex items-center text-gray-600 mb-4">
                      <MapPin className="w-4 h-4 mr-1" />
                      {property.location}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleBookmark}
                      className={isBookmarked ? 'text-red-500' : ''}
                    >
                      <Heart className={`w-4 h-4 ${isBookmarked ? 'fill-red-500' : ''}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm mb-6">
                  <Badge variant="secondary">{property.propertyType}</Badge>
                  <Badge variant="outline">{property.listingType}</Badge>
                  {property.bedrooms && (
                    <div className="flex items-center">
                      <Bed className="w-4 h-4 mr-1" />
                      {property.bedrooms} beds
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center">
                      <Bath className="w-4 h-4 mr-1" />
                      {property.bathrooms} baths
                    </div>
                  )}
                  {property.area && (
                    <div className="flex items-center">
                      <Square className="w-4 h-4 mr-1" />
                      {property.area} sqm
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center">
                      <Car className="w-4 h-4 mr-1" />
                      {property.parking} parking
                    </div>
                  )}
                </div>

                {/* Four-Tab Navigation */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={activeTab === 'description' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('description')}
                    className="flex-1 min-w-[120px]"
                  >
                    Description
                  </Button>
                  <Button
                    variant={activeTab === 'specifications' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('specifications')}
                    className="flex-1 min-w-[120px]"
                  >
                    Specifications
                  </Button>
                  <Button
                    variant={activeTab === 'agent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('agent')}
                    className="flex-1 min-w-[120px]"
                  >
                    Agent Info
                  </Button>
                  <Button
                    variant={activeTab === 'reviews' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('reviews')}
                    className="flex-1 min-w-[120px]"
                  >
                    Reviews
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent>
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {property.description}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="prose max-w-none">
                    {property.specifications ? (
                      <p className="text-gray-700 leading-relaxed">{property.specifications}</p>
                    ) : (
                      <p className="text-gray-500 italic">No detailed specifications available for this property.</p>
                    )}
                  </div>
                )}

                {activeTab === 'agent' && (
                  <div>
                    {property.agent ? (
                      <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            {property.agent.image ? (
                              <Image
                                src={property.agent.image}
                                alt={property.agent.name}
                                width={64}
                                height={64}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="text-primary font-semibold text-xl">
                                {property.agent.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-lg">{property.agent.name}</h4>
                            <p className="text-gray-600 text-sm">Real Estate Agent</p>
                            {property.agent.bio && (
                              <p className="text-gray-700 mt-2 text-sm">{property.agent.bio}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                          {property.agent.showPhone && property.agent.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <a 
                                href={`tel:${property.agent.phone}`} 
                                className="text-blue-600 hover:underline"
                              >
                                {property.agent.phone}
                              </a>
                            </div>
                          )}
                          {property.agent.showEmail && property.agent.email && (
                            <div className="flex items-center space-x-2">
                              <Mail className="w-4 h-4 text-gray-500" />
                              <a 
                                href={`mailto:${property.agent.email}`} 
                                className="text-blue-600 hover:underline"
                              >
                                {property.agent.email}
                              </a>
                            </div>
                          )}
                        </div>

                        <Button 
                          className="w-full mt-4" 
                          onClick={() => setShowContactForm(true)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact {property.agent.name}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500 italic mb-4">No agent information available for this property.</p>
                        <Button 
                          onClick={() => setShowContactForm(true)}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contact Us
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {property.reviews && property.reviews.length > 0 ? (
                      property.reviews.map((review) => (
                        <div key={review.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">{review.author}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic text-center py-8">No reviews available for this property.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price and Contact */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(property.price)}
                </div>
                
                <div className="space-y-3 mb-6">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowContactForm(true)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {property.agent ? `Contact ${property.agent.name}` : 'Contact Agent'}
                  </Button>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Property ID: {property.id.slice(0, 8)}</p>
                  <p>Listed: {new Date(property.createdAt).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Form */}
            {showContactForm && property && (
              <ContactForm
                contentType="property"
                contentId={property.id}
                recipientId={(property as any).vendor?.id || undefined}
                recipientName={(property as any).vendor?.name || property.agent?.name || 'Property Owner'}
                title={`Contact ${(property as any).vendor?.name || property.agent?.name || 'Property Owner'}`}
                description={`Inquire about "${property.title}"`}
                onSuccess={() => setShowContactForm(false)}
                onCancel={() => setShowContactForm(false)}
              />
            )}
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Similar Properties</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProperties.map((relatedProperty) => (
                <Card key={relatedProperty.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <Image
                        src={relatedProperty.images[0] || '/placeholder.jpg'}
                        alt={relatedProperty.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary">{relatedProperty.propertyType}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-2">{relatedProperty.title}</h3>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{relatedProperty.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-primary text-sm">
                          {formatPrice(relatedProperty.price)}
                        </span>
                        <Link href={`/properties/${relatedProperty.id}`}>
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