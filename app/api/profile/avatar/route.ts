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

// POST /api/profile/avatar - Upload user's profile avatar
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/avatar_${Date.now()}.${fileExt}`;

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(buffer);    // Get current avatar URL
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar')
      .eq('user_id', user.id)
      .single();

    if (currentProfile?.avatar) {
      // Extract file path from URL to delete old file
      const oldPath = currentProfile.avatar.split('/').pop();
      if (oldPath) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${oldPath}`]);
      }
    }

    // Upload new avatar to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Avatar upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      );
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = urlData.publicUrl;    // Update user profile with new avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile with new avatar' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      avatar_url: avatarUrl,
      profile: updatedProfile,
      message: 'Avatar uploaded successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/profile/avatar - Remove user's profile avatar
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }    // Get current avatar URL
    const { data: currentProfile } = await supabase
      .from('user_profiles')
      .select('avatar')
      .eq('user_id', user.id)
      .single();

    if (currentProfile?.avatar) {
      // Extract file path from URL to delete file
      const filePath = currentProfile.avatar.split('/').pop();
      if (filePath) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${filePath}`]);
      }
    }

    // Update profile to remove avatar URL
    const { data: updatedProfile, error: updateError } = await supabase
      .from('user_profiles')
      .update({
        avatar: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to remove avatar from profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      profile: updatedProfile,
      message: 'Avatar removed successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Avatar removal API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
