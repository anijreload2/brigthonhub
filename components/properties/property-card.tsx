
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Eye,
  Share2,
  Phone,
  Mail
} from 'lucide-react';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CURRENCY } from '@/lib/constants';
import { BookmarkButton } from '@/components/ui/bookmark-button';

interface PropertyCardProps {
  property: Property;
  viewMode?: 'grid' | 'list';
}

export function PropertyCard({ property, viewMode = 'grid' }: PropertyCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index if it's out of bounds
  useEffect(() => {
    if (property.images && property.images.length > 0 && currentImageIndex >= property.images.length) {
      setCurrentImageIndex(0);
    }
  }, [property.images, currentImageIndex]);

  // Ensure currentImageIndex is valid for the available images
  const safeImageIndex = property.images && property.images.length > 0 
    ? Math.min(currentImageIndex, property.images.length - 1) 
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: `/properties/${property.id}`,
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="card-hover border-0 shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="relative md:w-80 h-64 md:h-auto">
            <Image
              src={property.images && property.images.length > 0 ? property.images[safeImageIndex] : '/placeholder-property.jpg'}
              alt={property.title}
              fill
              className="object-cover"
            />
            <div className="absolute top-3 left-3">
              <Badge className={`${
                property.listing_type === 'SALE' ? 'bg-green-500' : 'bg-blue-500'
              } text-white`}>
                For {property.listing_type === 'SALE' ? 'Sale' : 'Rent'}
              </Badge>
            </div>
            <div className="absolute top-3 right-3 flex space-x-2">
              <BookmarkButton
                itemId={property.id}
                itemType="property"
                title={property.title}
                variant="ghost"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
              />
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 text-gray-600" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  <Link href={`/properties/${property.id}`} className="hover:text-primary">
                    {property.title}
                  </Link>
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(property.price)}
                </div>
                {property.listing_type === 'RENT' && (
                  <div className="text-sm text-gray-600">per year</div>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">
              {property.description}
            </p>

            <div className="flex items-center space-x-6 mb-4">
              {property.bedrooms && property.bedrooms > 0 && (
                <div className="flex items-center text-gray-600">
                  <Bed className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.bedrooms} beds</span>
                </div>
              )}
              {property.bathrooms && property.bathrooms > 0 && (
                <div className="flex items-center text-gray-600">
                  <Bath className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.bathrooms} baths</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center text-gray-600">
                  <Square className="w-4 h-4 mr-1" />
                  <span className="text-sm">{property.area} sqm</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex flex-wrap gap-2">
                {property.features.slice(0, 3).map((feature) => (
                  <Badge key={feature} variant="secondary" className="text-xs">
                    {feature}
                  </Badge>
                ))}
                {property.features.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{property.features.length - 3} more
                  </Badge>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="w-4 h-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" className="btn-primary">
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="card-hover border-0 shadow-md overflow-hidden">
      <div className="relative h-64">
        <Image
          src={property.images && property.images.length > 0 ? property.images[safeImageIndex] : '/placeholder-property.jpg'}
          alt={property.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${
            property.listing_type === 'SALE' ? 'bg-green-500' : 'bg-blue-500'
          } text-white`}>
            For {property.listing_type === 'SALE' ? 'Sale' : 'Rent'}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex space-x-2">
          <BookmarkButton
            itemId={property.id}
            itemType="property"
            title={property.title}
            variant="ghost"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
          />
          <Button
            size="sm"
            variant="secondary"
            className="w-8 h-8 p-0 bg-white/90 hover:bg-white"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </Button>
        </div>
        
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1">
            {property.images && property.images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full ${
                  index === safeImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
                aria-label={`View image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="text-xl font-bold text-primary">
            {formatPrice(property.price)}
          </div>
          {property.listing_type === 'RENT' && (
            <div className="text-sm text-gray-600">per year</div>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
          <Link href={`/properties/${property.id}`} className="hover:text-primary">
            {property.title}
          </Link>
        </h3>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 mb-4">
          {property.bedrooms && property.bedrooms > 0 && (
            <div className="flex items-center text-gray-600">
              <Bed className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms && property.bathrooms > 0 && (
            <div className="flex items-center text-gray-600">
              <Bath className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.bathrooms}</span>
            </div>
          )}
          {property.area && (
            <div className="flex items-center text-gray-600">
              <Square className="w-4 h-4 mr-1" />
              <span className="text-sm">{property.area}m²</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {property.features && property.features.slice(0, 2).map((feature) => (
            <Badge key={feature} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
          {property.features && property.features.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{property.features.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button size="sm" className="flex-1 btn-primary" asChild>
            <Link href={`/properties/${property.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
