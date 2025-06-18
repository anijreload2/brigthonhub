import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase';

interface VendorSignupData {
  // Basic account info
  email: string;
  password: string;
  name: string;
  phone?: string;
  
  // Vendor-specific info
  categories: string[];
  business_name: string;
  business_description: string;
  contact_email: string;
  contact_phone?: string;
  business_address?: string;
  website_url?: string;
  verification_data?: {
    experience?: string;
    certifications?: string;
    contact_preferences?: Record<string, boolean>;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: VendorSignupData = await request.json();
    
    // Validate required fields
    const { 
      email, 
      password, 
      name, 
      categories, 
      business_name, 
      business_description,
      contact_email 
    } = body;

    if (!email || !password || !name || !categories || !business_name || !business_description || !contact_email) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['email', 'password', 'name', 'categories', 'business_name', 'business_description', 'contact_email']
      }, { status: 400 });
    }

    if (categories.length === 0) {
      return NextResponse.json({ 
        error: 'At least one vendor category must be selected' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ 
        error: 'Password must be at least 8 characters long' 
      }, { status: 400 });
    }

    const adminClient = getAdminClient();

    // Step 1: Create Supabase Auth User
    console.log('Creating Supabase auth user for:', email);
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for vendor signups
      user_metadata: {
        name,
        role: 'REGISTERED', // Will be updated to VENDOR after application approval
        signup_type: 'vendor'
      }
    });

    if (authError) {
      console.error('Auth user creation failed:', authError);
      
      if (authError.message?.includes('already registered')) {
        return NextResponse.json({ 
          error: 'An account with this email already exists' 
        }, { status: 409 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create account: ' + authError.message 
      }, { status: 500 });
    }

    const authUser = authData.user;
    if (!authUser) {
      return NextResponse.json({ 
        error: 'Failed to create user account' 
      }, { status: 500 });
    }    console.log('Auth user created:', authUser.id);    // Step 2: Create Custom User Record
    // Use auth user ID directly as primary key for compatibility
    const { error: userError } = await adminClient
      .from('users')
      .insert({
        id: authUser.id, // Use auth user ID directly as primary key
        auth_user_id: authUser.id, // Also store as reference
        email,
        name,
        phone: body.phone || null,
        role: 'REGISTERED', // Will be updated to VENDOR after approval
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (userError) {
      console.error('Custom user creation failed:', userError);
      
      // Cleanup: Delete the auth user if custom user creation fails
      await adminClient.auth.admin.deleteUser(authUser.id);
      
      return NextResponse.json({ 
        error: 'Failed to create user profile: ' + userError.message 
      }, { status: 500 });
    }

    console.log('Custom user created:', authUser.id);

    // Step 3: Create Vendor Application
    const { error: applicationError, data: applicationData } = await adminClient
      .from('vendor_applications')
      .insert({
        user_id: authUser.id, // Use Supabase auth user ID for RLS compatibility
        categories,
        business_name,
        business_description,
        contact_email,
        contact_phone: body.contact_phone || null,
        business_address: body.business_address || null,
        website_url: body.website_url || null,
        verification_data: body.verification_data || null,
        status: 'pending',
        submitted_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (applicationError) {
      console.error('Vendor application creation failed:', applicationError);
        // Cleanup: Delete both auth user and custom user
      await adminClient.auth.admin.deleteUser(authUser.id);
      await adminClient.from('users').delete().eq('id', authUser.id);
      
      return NextResponse.json({ 
        error: 'Failed to create vendor application: ' + applicationError.message 
      }, { status: 500 });
    }

    console.log('Vendor application created:', applicationData.id);

    // Step 4: Create initial analytics record
    try {
      await adminClient
        .from('vendor_analytics')
        .insert({
          vendor_id: authUser.id,
          total_listings: 0,
          active_listings: 0,
          total_views: 0,
          total_contacts: 0,
          conversion_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (analyticsError) {
      console.warn('Failed to create analytics record:', analyticsError);
      // Non-critical, don't fail the entire process
    }    // Success response
    return NextResponse.json({
      message: 'Vendor account created successfully',      user: {
        id: authUser.id,
        auth_id: authUser.id,
        email,
        name,
        role: 'REGISTERED'
      },
      application: {
        id: applicationData.id,
        status: 'pending',
        business_name,
        categories
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Vendor signup error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
