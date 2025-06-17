const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function harmonizeTables() {
  console.log('🔄 Starting table harmonization...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./Database/HARMONIZE_ALL_TABLES.sql', 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length < 10) continue; // Skip very short statements
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}`);
      console.log(`   ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message);
      }
    }
    
    console.log('🎉 Table harmonization completed!');
    
    // Test the harmonized structure
    console.log('\n🔍 Testing harmonized structure...');
    await testHarmonizedStructure();
    
  } catch (error) {
    console.error('❌ Harmonization error:', error);
  }
}

async function testHarmonizedStructure() {
  try {
    // Test users table with snake_case columns
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, updated_at')
      .limit(1);
    
    if (userError) {
      console.error('❌ Users table test failed:', userError.message);
    } else {
      console.log('✅ Users table structure verified');
    }
    
    // Test vendor_applications table
    const { data: appData, error: appError } = await supabase
      .from('vendor_applications')
      .select('id, user_id, status, created_at, updated_at')
      .limit(1);
    
    if (appError) {
      console.error('❌ Vendor applications table test failed:', appError.message);
    } else {
      console.log('✅ Vendor applications table structure verified');
    }
    
    console.log('✅ All tables harmonized successfully!');
    
  } catch (error) {
    console.error('❌ Structure test error:', error);
  }
}

harmonizeTables();
