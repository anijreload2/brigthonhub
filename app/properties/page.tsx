
'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart,
  Eye,
  Grid,
  List,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PropertyCard } from '@/components/properties/property-card';
import { PropertyFilters } from '@/components/properties/property-filters';
import { Property, PropertyType, ListingType } from '@/lib/types';
import { CURRENCY } from '@/lib/constants';

// Sample properties data
const sampleProperties: Property[] = [
  {
    id: '1',
    title: 'Luxury 4-Bedroom Duplex in Lekki',
    description: 'Modern duplex with contemporary finishes, swimming pool, and 24/7 security in a gated estate.',
    propertyType: PropertyType.RESIDENTIAL,
    listingType: ListingType.SALE,
    price: 85000000,
    location: 'Lekki, Lagos',
    address: 'Lekki Phase 1, Lagos State',
    bedrooms: 4,
    bathrooms: 5,
    area: 350,
    images: [
      '{https://i.pinimg.com/originals/1e/79/09/1e7909e88614463bcd23c5ce7a0894b1.png}',
      '{https://i.pinimg.com/originals/53/05/df/5305df49c044bd1bc58fd3e76a2ef64d.jpg}',
      '{https://i.pinimg.com/originals/a6/98/03/a698032885ec57de1edfb680492f6353.jpg}'
    ],
    features: ['Swimming Pool', 'Generator', 'Security', 'Parking', 'Garden'],
    coordinates: { lat: 6.4474, lng: 3.4106 },
    isActive: true,
    agentId: 'agent1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    title: 'Commercial Office Space in Victoria Island',
    description: 'Prime commercial space perfect for corporate headquarters with modern amenities.',
    propertyType: PropertyType.COMMERCIAL,
    listingType: ListingType.RENT,
    price: 2500000,
    location: 'Victoria Island, Lagos',
    address: 'Victoria Island, Lagos State',
    bedrooms: 0,
    bathrooms: 4,
    area: 500,
    images: [
      '{https://thumbs.dreamstime.com/z/modern-office-building-exterior-glass-facade-clear-sky-background-transparent-wall-reflection-clouds-element-european-254731238.jpg}',
      '{https://i.pinimg.com/originals/a8/49/f2/a849f2354a5f1ce4f89e12d8dda43221.jpg}',
      '{https://thumbs.dreamstime.com/z/modern-conference-room-large-windows-modern-conference-room-large-windows-high-quality-photo-322264468.jpg}'
    ],
    features: ['Air Conditioning', 'Elevator', 'Parking', 'Security', 'Generator'],
    coordinates: { lat: 6.4281, lng: 3.4219 },
    isActive: true,
    agentId: 'agent1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    title: '3-Bedroom Apartment in Ikeja GRA',
    description: 'Well-maintained apartment in a serene environment with excellent facilities.',
    propertyType: PropertyType.RESIDENTIAL,
    listingType: ListingType.RENT,
    price: 1800000,
    location: 'Ikeja, Lagos',
    address: 'Ikeja GRA, Lagos State',
    bedrooms: 3,
    bathrooms: 3,
    area: 180,
    images: [
      '{https://i.pinimg.com/originals/9a/c5/72/9ac5727029fcb9d65f5f27ca4848ee33.jpg}',
      '{https://i.pinimg.com/originals/53/4d/eb/534deb1ab335e4c51b070ce7b4bbedc7.jpg}',
      '{https://i.ytimg.com/vi/mEyN8Ab8syg/maxresdefault.jpg}'
    ],
    features: ['Balcony', 'Fitted Kitchen', 'Parking', 'Security'],
    coordinates: { lat: 6.5964, lng: 3.3378 },
    isActive: true,
    agentId: 'agent1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '4',
    title: 'Land for Sale in Abuja',
    description: 'Prime residential land in a developing area with good access roads and infrastructure.',
    propertyType: PropertyType.LAND,
    listingType: ListingType.SALE,
    price: 25000000,
    location: 'Gwarinpa, Abuja',
    address: 'Gwarinpa Estate, FCT Abuja',
    bedrooms: 0,
    bathrooms: 0,
    area: 1000,
    images: [
      '{https://i.pinimg.com/originals/44/c8/8f/44c88f5c79e0730a5b5442956e0aca9d.jpg}',
      '{https://thumbs.dreamstime.com/z/beautiful-residential-area-clean-empty-asphalt-roads-lush-trees-illuminated-sun-summer-257834534.jpg}',
      '{https://images.examples.com/wp-content/uploads/2018/06/Final-Property-Survey-Document-Example1.jpg}'
    ],
    features: ['C of O', 'Survey Plan', 'Good Access Road', 'Electricity'],
    coordinates: { lat: 9.1579, lng: 7.4951 },
    isActive: true,
    agentId: 'agent1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>(sampleProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(sampleProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filters, setFilters] = useState({
    propertyType: '',
    listingType: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    location: ''
  });

  useEffect(() => {
    let filtered = properties;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(property => property.propertyType === filters.propertyType);
    }

    // Listing type filter
    if (filters.listingType) {
      filtered = filtered.filter(property => property.listingType === filters.listingType);
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(property => property.price >= parseInt(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(property => property.price <= parseInt(filters.maxPrice));
    }

    // Bedrooms filter
    if (filters.bedrooms) {
      filtered = filtered.filter(property => property.bedrooms === parseInt(filters.bedrooms));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(property =>
        property.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        break;
    }

    setFilteredProperties(filtered);
  }, [properties, searchTerm, filters, sortBy]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      propertyType: '',
      listingType: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      location: ''
    });
    setSearchTerm('');
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
              Find Your Perfect Property
            </h1>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Discover premium properties across Nigeria with our comprehensive real estate platform
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by location, property type, or keywords..."
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

      {/* Filters and Controls */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </Button>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="text-sm text-gray-600">
                {filteredProperties.length} properties found
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="RESIDENTIAL">Residential</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="LAND">Land</SelectItem>
                    <SelectItem value="MIXED_USE">Mixed Use</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filters.listingType} onValueChange={(value) => handleFilterChange('listingType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Listing Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Listings</SelectItem>
                    <SelectItem value="SALE">For Sale</SelectItem>
                    <SelectItem value="RENT">For Rent</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />

                <Input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />

                <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              </div>
            </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {filteredProperties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <PropertyCard property={property} viewMode={viewMode} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
