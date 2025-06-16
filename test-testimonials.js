import { supabase } from './lib/supabase.js';

console.log('🔍 Testing testimonials table...');

async function testTestimonials() {
  try {
    console.log('📡 Connecting to Supabase...');
    
    // Test basic connection
    const { data: connectionTest, error: connectionError } = await supabase
      .from('testimonials')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection error:', connectionError);
      return;
    }
    
    console.log('✅ Connected! Found', connectionTest?.length || 0, 'testimonials');
    
    // Try to fetch testimonials
    const { data: testimonials, error: fetchError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
      return;
    }
    
    console.log('📋 Sample testimonials:');
    console.table(testimonials);
    
    // Test the specific query from the API
    const { data: activeTestimonials, error: activeError } = await supabase
      .from('testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (activeError) {
      console.error('❌ Active testimonials error:', activeError);
      return;
    }
    
    console.log('✅ Active testimonials query successful');
    console.log('📊 Found', activeTestimonials?.length || 0, 'active testimonials');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testTestimonials();
