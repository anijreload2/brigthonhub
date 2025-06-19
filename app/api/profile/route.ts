import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to get user from authorization header
async function getUserFromAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

// GET /api/profile - Get current user's profile information
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile data with extended information
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user:users!user_id(
          id,
          email,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // If no profile exists, create a basic one
    if (!profile) {      const { data: newProfile, error: createError } = await supabase
        .from('user_profiles')        .insert({
          user_id: user.id,
          first_name: user.user_metadata?.full_name || '',
          last_name: '',
          bio: '',
          location: '',
          business_phone: '',
          business_name: '',
          business_address: ''
        })
        .select(`
          *,
          user:users!user_id(
            id,
            email,
            created_at
          )
        `)
        .single();

      if (createError) {
        console.error('Profile creation error:', createError);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }

      return NextResponse.json({ profile: newProfile }, { status: 200 });
    }    return NextResponse.json({ profile }, { status: 200 });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/profile - Update current user's profile information
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    const body = await request.json();
    const {
      first_name,
      last_name,
      bio,
      location,
      business_phone,
      business_name,
      business_address
    } = body;

    // Prepare update data (only include non-undefined fields)
    const updateData: any = {};
    if (first_name !== undefined) updateData.first_name = first_name;
    if (last_name !== undefined) updateData.last_name = last_name;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (business_phone !== undefined) updateData.business_phone = business_phone;
    if (business_name !== undefined) updateData.business_name = business_name;
    if (business_address !== undefined) updateData.business_address = business_address;

    // Update the profile
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select(`
        *,
        user:users!user_id(
          id,
          email,
          created_at
        )
      `)
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      profile: updatedProfile,
      message: 'Profile updated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Profile update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
