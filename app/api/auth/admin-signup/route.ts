import { NextRequest, NextResponse } from 'next/server';
import { supabase, getAdminClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name,
      phone,
      adminKey // Secret key to verify admin creation permission
    } = body;

    // Validate required fields
    if (!email || !password || !name || !adminKey) {
      return NextResponse.json(
        { error: 'Missing required fields (email, password, name, adminKey)' },
        { status: 400 }
      );
    }

    // Verify admin creation key (you can change this secret)
    const ADMIN_CREATION_KEY = process.env.ADMIN_CREATION_KEY || 'brightonhub-admin-2025';
    if (adminKey !== ADMIN_CREATION_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin creation key' },
        { status: 403 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Check if email already exists in custom users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Get admin client for user creation
    const adminClient = getAdminClient();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name: name,
        role: 'ADMIN'
      },
      email_confirm: true // Auto-confirm email for admin users
    });

    if (authError) {
      console.error('Supabase Auth admin creation error:', authError);
      return NextResponse.json(
        { error: `Failed to create admin auth user: ${authError.message}` },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create admin auth user' },
        { status: 500 }
      );
    }

    console.log('Admin auth user created:', authData.user.id);

    // Generate custom user ID for our users table
    const customUserId = `admin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const profileId = `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create admin user in custom users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: customUserId,
          email: email,
          name: name,
          phone: phone || '',
          role: 'ADMIN',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating admin user record:', userError);
        // Clean up Supabase Auth user if custom user creation fails
        await adminClient.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { error: `Failed to create admin user record: ${userError.message}` },
          { status: 500 }
        );
      }

      // Create admin user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: profileId,
          userId: customUserId,
          firstName: name.split(' ')[0] || '',
          lastName: name.split(' ').slice(1).join(' ') || '',
          businessName: 'BrightonHub Administration',
          businessAddress: '',
          businessPhone: phone || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

      if (profileError) {
        console.error('Error creating admin profile:', profileError);
        // Continue anyway as profile is not critical for admin function
      }

      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully',
        data: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          authUserId: authData.user.id
        }
      });

    } catch (error) {
      console.error('Error in admin creation process:', error);
      // Clean up Supabase Auth user if there's an error
      try {
        await adminClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error('Error cleaning up auth user:', cleanupError);
      }
      
      return NextResponse.json(
        { error: 'Failed to complete admin creation process' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
