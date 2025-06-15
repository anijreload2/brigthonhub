// Setup admin user in Supabase Auth
import 'dotenv/config';
import { getAdminClient } from './lib/supabase';

async function setupAdminUser() {
  try {
    console.log('🔧 Setting up admin user in Supabase Auth...');
    
    const supabaseAdmin = getAdminClient();

    // Create admin user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@brightonhub.ng',
      password: 'admin123',
      email_confirm: true, // Skip email confirmation
    });

    if (error) {
      console.error('❌ Failed to create admin user:', error);
      return;
    }

    console.log('✅ Admin user created in Supabase Auth:', data.user?.email);
    console.log('📧 Email:', data.user?.email);
    console.log('🆔 Supabase User ID:', data.user?.id);
    
    // Update our users table to link with Supabase Auth user
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        supabase_user_id: data.user?.id
      })
      .eq('email', 'admin@brightonhub.ng');

    if (updateError) {
      console.error('❌ Failed to link admin user:', updateError);
    } else {
      console.log('✅ Admin user linked successfully');
    }

  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

setupAdminUser();
