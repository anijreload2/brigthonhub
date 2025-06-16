const { supabase } = require('./lib/supabase');

async function checkTestimonials() {
  console.log('🔍 Checking testimonials table structure...');
  
  try {
    // First, let's see if the table exists at all
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'testimonials');
      
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError);
      return;
    }

    console.log('📋 Tables found:', tables);

    // Now check the columns
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'testimonials')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error checking columns:', columnsError);
      return;
    }

    console.log('📊 Testimonials table columns:');
    columns?.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Let's also try to fetch some sample data
    console.log('\n📄 Sample testimonials data:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('testimonials')
      .select('*')
      .limit(2);

    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
    } else {
      console.log('Sample records:', sampleData?.length || 0);
      if (sampleData && sampleData.length > 0) {
        console.log('First record keys:', Object.keys(sampleData[0]));
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkTestimonials().catch(console.error);
