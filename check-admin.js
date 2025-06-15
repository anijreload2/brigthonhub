// Test script to check if admin user exists
import 'dotenv/config';
import { getAdminClient } from './lib/supabase';

async function checkAdminUser() {
  try {
    console.log('🔍 Checking for admin user...');
    
    const supabaseAdmin = getAdminClient();
    const { data: adminUser, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', 'admin@brightonhub.ng')
      .single();
    
    if (error) {
      console.error('❌ Error checking admin user:', error);
      return;
    }
    
    if (adminUser) {
      console.log('✅ Admin user found:', {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
    } else {
      console.log('❌ Admin user not found');
    }
    
  } catch (error) {
    console.error('💥 Script failed:', error);
  }
}

checkAdminUser();
