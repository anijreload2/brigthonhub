// Seed script for BrightonHub database using Supabase
import { getAdminClient } from './supabase';

/**
 * BrightonHub Supabase Seed Script
 * 
 * This script only seeds business-specific data and admin settings.
 * The main sample data (properties, food, projects, etc.) is already 
 * present via the SQL migration files (FINAL_COMPLETE_SCHEMA.sql & URL_MIGRATION_UPDATE.sql)
 */

export async function seedDatabase() {
  try {
    console.log('🌱 Starting BrightonHub business data seeding...');
    
    const supabaseAdmin = getAdminClient();

    // 1. Ensure admin user exists (in case not created via SQL)
    const { data: existingAdmin } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', 'admin@brightonhub.ng')
      .single();

    let adminUserId = existingAdmin?.id;

    if (!existingAdmin) {
      console.log('Creating admin user...');
      const { data: newAdmin, error: adminError } = await supabaseAdmin
        .from('users')
        .insert({
          id: 'admin-001',
          email: 'admin@brightonhub.ng',
          name: 'BrightonHub Admin',
          phone: '+234-800-BRIGHTON',
          role: 'ADMIN',
          is_active: true,
        })
        .select()
        .single();

      if (adminError) throw adminError;
      adminUserId = newAdmin.id;
    }

    // 2. Create admin profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .upsert({
        id: 'profile-admin-001',
        user_id: adminUserId,
        first_name: 'BrightonHub',
        last_name: 'Admin',
        avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150',
        bio: 'System Administrator for BrightonHub platform. Managing real estate, food, and project operations.',
        businessName: 'BrightonHub Management',
        businessAddress: 'Victoria Island, Lagos, Nigeria',
        businessPhone: '+234-800-BRIGHTON',
        location: 'Lagos, Nigeria',
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        },
        notifications: {
          email: true,
          sms: true,
          push: true
        }
      });

    if (profileError) throw profileError;

    // 3. Site Settings (Business Configuration)
    console.log('Setting up site configuration...');
    const siteSettings = [
      {
        id: 'site-001',
        key: 'company_name',
        value: 'BrightonHub',
        description: 'Company name displayed across the platform'
      },
      {
        id: 'site-002',
        key: 'company_tagline',
        value: 'Your Gateway to Property, Food, and Projects in Nigeria',
        description: 'Main tagline for marketing and branding'
      },
      {
        id: 'site-003',
        key: 'contact_email',
        value: 'info@brightonhub.ng',
        description: 'Primary contact email for customer inquiries'
      },
      {
        id: 'site-004',
        key: 'contact_phone',
        value: '+234-800-BRIGHTON',
        description: 'Primary contact phone number'
      },
      {
        id: 'site-005',
        key: 'business_address',
        value: 'Victoria Island, Lagos, Nigeria',
        description: 'Main business address'
      },
      {
        id: 'site-006',
        key: 'hero_title',
        value: 'Find Your Perfect Property, Fresh Food & Top Projects',
        description: 'Main hero section title'
      },
      {
        id: 'site-007',
        key: 'hero_subtitle',
        value: 'Discover premium properties, farm-fresh produce, and showcase projects all in one convenient platform designed for Nigeria.',
        description: 'Hero section subtitle'
      },
      {
        id: 'site-008',
        key: 'facebook_url',
        value: 'https://facebook.com/brightonhub',
        description: 'Facebook social media link'
      },
      {
        id: 'site-009',
        key: 'twitter_url',
        value: 'https://twitter.com/brightonhub',
        description: 'Twitter social media link'
      },
      {
        id: 'site-010',
        key: 'instagram_url',
        value: 'https://instagram.com/brightonhub',
        description: 'Instagram social media link'
      }
    ];

    const { error: settingsError } = await supabaseAdmin
      .from('site_settings')
      .upsert(siteSettings, { onConflict: 'key' });

    if (settingsError) throw settingsError;

    // 4. AI Assistant Training Data
    console.log('Setting up AI assistant training data...');
    const aiTrainingData = [
      {
        id: 'ai-001',
        question: 'What is BrightonHub?',
        answer: 'BrightonHub is a comprehensive platform that connects you to premium properties, fresh farm produce, and showcase projects across Nigeria. We provide a one-stop solution for real estate, food marketplace, and project discovery.',
        category: 'general',
        is_active: true
      },
      {
        id: 'ai-002',
        question: 'How can I contact BrightonHub?',
        answer: 'You can reach us via email at info@brightonhub.ng, call us at +234-800-BRIGHTON, or visit our office at Victoria Island, Lagos, Nigeria. We\'re here to help with all your property, food, and project needs.',
        category: 'contact',
        is_active: true
      },
      {
        id: 'ai-003',
        question: 'What services does BrightonHub offer?',
        answer: 'BrightonHub offers three main services: 1) Real Estate - Find and list properties for sale or rent, 2) Food Marketplace - Buy fresh produce directly from farmers, 3) Project Showcase - Discover construction and development projects across Nigeria.',
        category: 'services',
        is_active: true
      },
      {
        id: 'ai-004',
        question: 'How do I list my property on BrightonHub?',
        answer: 'To list your property, create an account, go to the Properties section, and click "Add Property". Fill in the details including title, description, price, location, and upload high-quality images. Our team will review and approve your listing.',
        category: 'properties',
        is_active: true
      },
      {
        id: 'ai-005',
        question: 'Can I sell farm produce on BrightonHub?',
        answer: 'Yes! BrightonHub has a dedicated Food Marketplace where farmers and vendors can sell fresh produce. Simply register as a vendor, create your product listings with photos and descriptions, and start selling to customers across Nigeria.',
        category: 'food',
        is_active: true
      },
      {
        id: 'ai-006',
        question: 'What areas does BrightonHub cover?',
        answer: 'BrightonHub operates across Nigeria, with strong presence in Lagos, Abuja, Port Harcourt, Kano, and other major cities. We connect buyers and sellers nationwide for properties, food, and projects.',
        category: 'coverage',
        is_active: true
      }
    ];

    const { error: aiError } = await supabaseAdmin
      .from('ai_training_data')
      .upsert(aiTrainingData, { onConflict: 'id' });

    if (aiError) throw aiError;

    console.log('✅ Business data seeding completed successfully!');
    console.log('📊 Seeded:');
    console.log('   - Admin user and profile');
    console.log('   - Site settings (10 items)');
    console.log('   - AI training data (6 items)');
    console.log('');
    console.log('ℹ️  Main sample data (properties, food, projects) is already present via SQL migration files.');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🎉 Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
