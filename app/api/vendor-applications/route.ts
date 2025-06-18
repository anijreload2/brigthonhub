import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';
import { getAuthUser } from '@/lib/auth';

// Function to get Supabase user from Authorization header
async function getSupabaseUser(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const adminClient = getAdminClient();
    
    const { data: { user }, error } = await adminClient.auth.getUser(token);
    
    if (error || !user) {
      console.error('Supabase auth error:', error);
      return null;
    }    // Get user role from our user_profiles table (not users table)
    const { data: userData, error: userError } = await adminClient
      .from('user_profiles')
      .select('user_id, first_name, last_name, role')
      .eq('user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return null;
    }    return {
      id: userData.user_id,
      email: user.email || '', // Get email from Supabase auth user, fallback to empty string
      name: `${userData.first_name} ${userData.last_name}`.trim(),
      role: userData.role
    };
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}

// GET /api/vendor-applications - Get all vendor applications (admin only)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/vendor-applications - Starting request');
    
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    console.log('📝 Custom JWT auth result:', authUser ? 'Found user' : 'No user found');
    
    if (!authUser) {
      console.log('🔍 Trying Supabase auth...');
      authUser = await getSupabaseUser(request); // Supabase token
      console.log('📝 Supabase auth result:', authUser ? `Found user: ${authUser.email}` : 'No user found');
    }
    
    if (!authUser) {
      console.log('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Authenticated user:', { id: authUser.id, email: authUser.email, role: authUser.role });

    // Check if user is admin
    if (authUser.role !== 'ADMIN') {
      console.log('❌ User is not admin, role:', authUser.role);
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }    console.log('✅ User is admin, proceeding with query...');

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const limit = url.searchParams.get('limit') || '50';
    const offset = url.searchParams.get('offset') || '0';    console.log('📊 Query parameters:', { status, limit, offset });

    // Use admin client to bypass RLS since user is already authenticated as admin
    const adminClient = getAdminClient();
    
    // Simplified query without the join first to test
    let query = adminClient
      .from('vendor_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    console.log('🔍 Executing database query...');
    const { data: applications, error } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch vendor applications' }, { status: 500 });
    }    console.log('✅ Query successful, found', applications?.length || 0, 'applications');
    return NextResponse.json({ applications });

  } catch (error) {
    console.error('❌ Unexpected error in vendor applications GET API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/vendor-applications - Create new vendor application
export async function POST(request: NextRequest) {
  try {
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    if (!authUser) {
      authUser = await getSupabaseUser(request); // Supabase token
    }
    
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
    // Try to get authenticated user from either system
    let authUser = getAuthUser(request); // Custom JWT
    if (!authUser) {
      authUser = await getSupabaseUser(request); // Supabase token
    }
    
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