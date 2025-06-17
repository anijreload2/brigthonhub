import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {  try {
    let { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Check if this is a vendor listing (prefixed with 'vendor_')
    const isVendorId = id.startsWith('vendor_');
    if (isVendorId) {
      id = id.replace('vendor_', '');
    }    let property;
    let isVendorListing = false;
    let relatedProperties = [];

    if (isVendorId) {
      // This is a vendor listing, fetch from vendor_listings table
      const { data: vendorListing, error: vendorError } = await supabase
        .from('vendor_listings')
        .select(`
          *,
          vendor:users!vendor_listings_vendor_id_fkey (
            id,
            name,
            email
          )
        `)
        .eq('id', id)
        .eq('status', 'active')
        .eq('category', 'property')
        .single();

      if (vendorError && vendorError.code !== 'PGRST116') {
        console.error('Error fetching vendor listing:', vendorError);
        return NextResponse.json(
          { error: 'Failed to fetch property' },
          { status: 500 }
        );
      }

      if (vendorListing) {
        isVendorListing = true;
        // Transform vendor listing to match property interface
        property = {
          id: vendorListing.id,
          title: vendorListing.title,
          description: vendorListing.description,
          price: vendorListing.price,
          location: vendorListing.location,
          images: vendorListing.images || [],
          propertyType: vendorListing.specifications?.propertyType || 'RESIDENTIAL',
          listingType: vendorListing.specifications?.listingType || 'SALE',
          bedrooms: vendorListing.specifications?.bedrooms,
          bathrooms: vendorListing.specifications?.bathrooms,
          area: vendorListing.specifications?.area,
          address: vendorListing.specifications?.address || vendorListing.location,
          features: vendorListing.specifications?.features ? vendorListing.specifications.features.split('\n').filter((f: string) => f.trim()) : [],
          isActive: true,
          createdAt: vendorListing.created_at,
          updatedAt: vendorListing.updated_at,
          isVendorListing: true,
          vendor: vendorListing.vendor,
          // Contact info from vendor listing
          agent: {
            name: vendorListing.vendor?.name || 'Vendor',
            email: vendorListing.contact_info?.email || vendorListing.vendor?.email,
            phone: vendorListing.contact_info?.phone,
            showEmail: true,
            showPhone: true
          }
        };
      }
    } else {
      // This is an admin property, fetch from properties table
      const { data: adminProperty, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .eq('isActive', true)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching property:', error);
        return NextResponse.json(
          { error: 'Failed to fetch property' },
          { status: 500 }
        );
      }

      property = adminProperty;
    }

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Fetch related properties from both sources
    if (!isVendorListing) {
      // For admin properties, get related admin properties
      const { data: adminRelated } = await supabase
        .from('properties')
        .select('*')
        .eq('isActive', true)
        .eq('propertyType', property.propertyType)
        .neq('id', id)
        .limit(4);
      relatedProperties = adminRelated || [];
    } else {
      // For vendor listings, get related vendor listings
      const { data: vendorRelated } = await supabase
        .from('vendor_listings')
        .select(`
          *,
          vendor:users!vendor_listings_vendor_id_fkey (name)
        `)
        .eq('status', 'active')
        .eq('category', 'property')
        .neq('id', id)
        .limit(4);

      // Transform vendor listings to match property interface
      relatedProperties = (vendorRelated || []).map(listing => ({
        id: listing.id,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        location: listing.location,
        images: listing.images || [],
        propertyType: listing.specifications?.propertyType || 'RESIDENTIAL',
        listingType: listing.specifications?.listingType || 'SALE',
        bedrooms: listing.specifications?.bedrooms,
        bathrooms: listing.specifications?.bathrooms,
        area: listing.specifications?.area,
        isActive: true,
        createdAt: listing.created_at,
        isVendorListing: true,
        vendor: listing.vendor
      }));
    }

    return NextResponse.json({
      property,
      relatedProperties: relatedProperties || []
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
