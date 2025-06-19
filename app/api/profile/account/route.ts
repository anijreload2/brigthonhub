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

// DELETE /api/profile/account - Delete user's account and all associated data
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { password, confirmDeletion } = body;

    // Validate required fields
    if (!password || !confirmDeletion) {
      return NextResponse.json(
        { error: 'Password and confirmation are required for account deletion' },
        { status: 400 }
      );
    }

    if (confirmDeletion !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE_MY_ACCOUNT"' },
        { status: 400 }
      );
    }

    // Verify password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: password
    });

    if (signInError) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Begin transaction-like cleanup of user data
    const userId = user.id;

    try {
      // 1. Delete user's avatar from storage if exists
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', userId)
        .single();

      if (profile?.avatar_url) {
        const filePath = profile.avatar_url.split('/').pop();
        if (filePath) {
          await supabase.storage
            .from('avatars')
            .remove([`${userId}/${filePath}`]);
        }
      }

      // 2. Delete user bookmarks
      await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', userId);

      // 3. Update messages to mark them as from deleted user (preserve for recipients)
      await supabase
        .from('contact_messages')
        .update({ 
          sender_name: '[Deleted User]',
          sender_email: '[deleted@example.com]',
          updated_at: new Date().toISOString()
        })
        .eq('sender_id', userId);

      // 4. Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId);

      // 5. Delete the user from auth (this should cascade to other related data)
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

      if (deleteUserError) {
        console.error('User deletion error:', deleteUserError);
        return NextResponse.json(
          { error: 'Failed to delete user account' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        message: 'Account deleted successfully'
      }, { status: 200 });

    } catch (cleanupError) {
      console.error('Account deletion cleanup error:', cleanupError);
      return NextResponse.json(
        { error: 'Failed to completely clean up account data' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Account deletion API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/profile/account - Request account deletion (alternative softer approach)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = body;

    // Create a deletion request record (for admin review if needed)
    const { error } = await supabase
      .from('user_profiles')
      .update({
        deletion_requested: true,
        deletion_reason: reason || 'No reason provided',
        deletion_requested_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Deletion request error:', error);
      return NextResponse.json(
        { error: 'Failed to submit deletion request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Account deletion request submitted. You will receive an email with next steps.'
    }, { status: 200 });

  } catch (error) {
    console.error('Deletion request API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
