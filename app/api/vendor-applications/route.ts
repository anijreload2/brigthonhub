import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

// GET /api/vendor-applications - Get all vendor applications (admin only)
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') || '50';
    const offset = url.searchParams.get('offset') || '0';

    let query = supabase
      .from('vendor_applications')
      .select(`
        *,
        user:users(name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching vendor applications:', error);
      return NextResponse.json({ error: 'Failed to fetch vendor applications' }, { status: 500 });
    }

    return NextResponse.json({ applications });

  } catch (error) {
    console.error('Error in vendor applications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/vendor-applications - Create new vendor application
export async function POST(request: NextRequest) {
  try {
    // Get user (can be authenticated or anonymous)
    const authUser = getAuthUser(request);
    
    const body = await request.json();
    const {
      business_name,
      business_type,
      description,
      contact_name,
      contact_email,
      contact_phone,
      business_address,
      website,
      social_media,
      experience_years,
      portfolio_links,
      references,
      additional_info
    } = body;

    // Validate required fields
    if (!business_name || !business_type || !contact_name || !contact_email) {
      return NextResponse.json(
        { error: 'Missing required fields: business_name, business_type, contact_name, contact_email' },
        { status: 400 }
      );
    }    const applicationData = {
      user_id: authUser?.id || null,
      business_name,
      business_type,
      description,
      contact_name,
      contact_email,
      contact_phone,
      business_address,
      website,
      social_media: social_media || {},
      experience_years: experience_years || 0,
      portfolio_links: portfolio_links || [],
      references: references || [],
      additional_info,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: application, error } = await supabase
      .from('vendor_applications')
      .insert([applicationData])
      .select()
      .single();

    if (error) {
      console.error('Error creating vendor application:', error);
      return NextResponse.json({ error: 'Failed to create vendor application' }, { status: 500 });
    }

    return NextResponse.json({ 
      application,
      message: 'Vendor application submitted successfully' 
    }, { status: 201 });

  } catch (error) {
    console.error('Error in vendor applications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/vendor-applications - Update vendor application status (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Verify user is authenticated and is admin
    const authUser = getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, admin_notes } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }    const updateData = {
      status,
      admin_notes,
      reviewed_by: authUser.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: application, error } = await supabase
      .from('vendor_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor application:', error);
      return NextResponse.json({ error: 'Failed to update vendor application' }, { status: 500 });
    }

    // If approved, create vendor user and vendor profile
    if (status === 'approved') {
      // Update user role to vendor if user_id exists
      if (application.user_id) {
        await supabase
          .from('users')
          .update({ role: 'vendor' })
          .eq('id', application.user_id);
      }

      // Create vendor profile
      const vendorData = {
        user_id: application.user_id,
        business_name: application.business_name,
        business_type: application.business_type,
        description: application.description,
        contact_email: application.contact_email,
        contact_phone: application.contact_phone,
        business_address: application.business_address,
        website: application.website,
        social_media: application.social_media,
        status: 'active',
        created_at: new Date().toISOString()
      };

      await supabase
        .from('vendors')
        .insert([vendorData]);
    }

    return NextResponse.json({ 
      application,
      message: `Vendor application ${status} successfully` 
    });

  } catch (error) {
    console.error('Error in vendor applications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}