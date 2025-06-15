
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PropertyFilters as PropertyFiltersType } from '@/lib/types';
import { PROPERTY_TYPES, LISTING_TYPES, NIGERIAN_STATES } from '@/lib/constants';

interface PropertyFiltersProps {
  filters: PropertyFiltersType;
  onFilterChange: (filters: PropertyFiltersType) => void;
  onClearFilters: () => void;
}

export function PropertyFilters({ filters, onFilterChange, onClearFilters }: PropertyFiltersProps) {
  const handleFilterChange = (key: keyof PropertyFiltersType, value: any) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Filter Properties</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="propertyType">Property Type</Label>
          <Select
            value={filters.propertyType || 'all'}
            onValueChange={(value) => handleFilterChange('propertyType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {PROPERTY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="listingType">Listing Type</Label>
          <Select
            value={filters.listingType || 'all'}
            onValueChange={(value) => handleFilterChange('listingType', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All Listings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Listings</SelectItem>
              {LISTING_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Select
            value={filters.location || 'all'}
            onValueChange={(value) => handleFilterChange('location', value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {NIGERIAN_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minPrice">Min Price (₦)</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="0"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="maxPrice">Max Price (₦)</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="No limit"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Select
            value={filters.bedrooms?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('bedrooms', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="1">1 Bedroom</SelectItem>
              <SelectItem value="2">2 Bedrooms</SelectItem>
              <SelectItem value="3">3 Bedrooms</SelectItem>
              <SelectItem value="4">4 Bedrooms</SelectItem>
              <SelectItem value="5">5+ Bedrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Select
            value={filters.bathrooms?.toString() || 'all'}
            onValueChange={(value) => handleFilterChange('bathrooms', value === 'all' ? undefined : parseInt(value))}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any</SelectItem>
              <SelectItem value="1">1 Bathroom</SelectItem>
              <SelectItem value="2">2 Bathrooms</SelectItem>
              <SelectItem value="3">3 Bathrooms</SelectItem>
              <SelectItem value="4">4+ Bathrooms</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="minArea">Min Area (sqm)</Label>
            <Input
              id="minArea"
              type="number"
              placeholder="0"
              value={filters.minArea || ''}
              onChange={(e) => handleFilterChange('minArea', e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="maxArea">Max Area (sqm)</Label>
            <Input
              id="maxArea"
              type="number"
              placeholder="No limit"
              value={filters.maxArea || ''}
              onChange={(e) => handleFilterChange('maxArea', e.target.value ? parseInt(e.target.value) : undefined)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="pt-4 space-y-2">
          <Button onClick={onClearFilters} variant="outline" className="w-full">
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
