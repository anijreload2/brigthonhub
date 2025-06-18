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
        role: 'USER', // Will be updated to VENDOR after application approval
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
    }

    console.log('Auth user created:', authUser.id);

    // Step 2: Create Custom User Record
    // Try using auth_user_id if column exists, otherwise use legacy approach
    const customUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // First try with auth_user_id column
    let userCreated = false;
    let userError = null;
    
    try {
      const { error: newUserError } = await adminClient
        .from('users')
        .insert({
          id: customUserId,
          auth_user_id: authUser.id, // Link to Supabase auth user
          email,
          name,
          phone: body.phone || null,
          role: 'USER', // Will be updated to VENDOR after approval
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (!newUserError) {
        userCreated = true;
        console.log('Custom user created with auth_user_id:', customUserId);
      } else {
        userError = newUserError;
      }
    } catch (e) {
      userError = e;
    }    // If that failed due to missing column, try legacy approach
    if (!userCreated && userError && typeof userError === 'object' && 'message' in userError && 
        (userError as any).message?.includes('auth_user_id')) {
      console.log('Trying legacy user creation without auth_user_id...');
      
      const { error: legacyUserError } = await adminClient
        .from('users')
        .insert({
          id: authUser.id, // Use auth user ID directly as primary key
          email,
          name,
          phone: body.phone || null,
          role: 'USER', // Will be updated to VENDOR after approval
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (legacyUserError) {
        console.error('Legacy user creation also failed:', legacyUserError);
        
        // Cleanup: Delete the auth user
        await adminClient.auth.admin.deleteUser(authUser.id);
        
        return NextResponse.json({ 
          error: 'Failed to create user profile: ' + legacyUserError.message 
        }, { status: 500 });
      } else {
        userCreated = true;
        console.log('Custom user created with legacy approach:', authUser.id);
      }
    } else if (!userCreated) {
      console.error('User creation failed:', userError);
      
      // Cleanup: Delete the auth user
      await adminClient.auth.admin.deleteUser(authUser.id);
      
      const errorMessage = userError && typeof userError === 'object' && 'message' in userError 
        ? (userError as any).message 
        : 'Unknown error';
      
      return NextResponse.json({ 
        error: 'Failed to create user profile: ' + errorMessage
      }, { status: 500 });
    }

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
      if (customUserId !== authUser.id) {
        await adminClient.from('users').delete().eq('id', customUserId);
      } else {
        await adminClient.from('users').delete().eq('id', authUser.id);
      }
      
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
    }

    // Success response
    return NextResponse.json({
      message: 'Vendor account created successfully',
      user: {
        id: userCreated ? (customUserId !== authUser.id ? customUserId : authUser.id) : authUser.id,
        auth_id: authUser.id,
        email,
        name,
        role: 'USER'
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
