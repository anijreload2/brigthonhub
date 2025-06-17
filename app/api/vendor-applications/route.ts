import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// GET - Fetch vendor applications (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const adminClient = getAdminClient();
    
    let query = adminClient
      .from('vendor_applications')
      .select(`
        *,
        users!vendor_applications_user_id_fkey(
          name,
          email
        )
      `)
      .order('submitted_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: applications, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    return NextResponse.json({
      applications: applications || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });

  } catch (error) {
    console.error('Vendor applications API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Submit new vendor application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categories,
      business_name,
      business_description,
      contact_email,
      contact_phone,
      business_address,
      website_url,
      verification_data
    } = body;

    // Validate required fields
    if (!categories || !business_name || !business_description || !contact_email) {
      return NextResponse.json({ 
        error: 'Missing required fields: categories, business_name, business_description, contact_email' 
      }, { status: 400 });
    }

    // Get authenticated user from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Create client with user's token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid authentication' }, { status: 401 });
    }

    // Check if user already has a pending or approved application
    const { data: existingApplication } = await supabase
      .from('vendor_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .single();

    if (existingApplication) {
      return NextResponse.json({ 
        error: `You already have a ${existingApplication.status} vendor application` 
      }, { status: 400 });
    }

    // Insert new application
    const { data: application, error: insertError } = await supabase
      .from('vendor_applications')
      .insert({
        user_id: user.id,
        categories,
        business_name,
        business_description,
        contact_email,
        contact_phone,
        business_address,
        website_url,
        verification_data,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating vendor application:', insertError);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Vendor application submitted successfully',
      application 
    }, { status: 201 });

  } catch (error) {
    console.error('Vendor application submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update vendor application (admin only)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, admin_notes, reviewed_by } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing required fields: id, status' }, { status: 400 });
    }

    const adminClient = getAdminClient();
    
    // First, get the application to find the user_id
    const { data: currentApplication, error: fetchError } = await adminClient
      .from('vendor_applications')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching application:', fetchError);
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (admin_notes) updateData.admin_notes = admin_notes;
    if (reviewed_by) updateData.reviewed_by = reviewed_by;

    // Update the vendor application
    const { data: application, error } = await adminClient
      .from('vendor_applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor application:', error);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }    // If approving the application, update the user's role to VENDOR
    if (status === 'approved') {
      const { error: userUpdateError } = await adminClient
        .from('users')
        .update({ 
          role: 'VENDOR',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentApplication.user_id);

      if (userUpdateError) {
        console.error('Error updating user role:', userUpdateError);
        // Don't fail the entire operation, but log the error
        console.warn('Application approved but user role update failed');
      }
    }

    return NextResponse.json({ 
      message: 'Application updated successfully',
      application 
    });

  } catch (error) {
    console.error('Vendor application update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
