const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function runDatabaseCheck() {
  try {
    console.log('🔍 Running check-all-databases.sql...\n');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'check-all-databases.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split SQL into individual queries
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q && !q.startsWith('--'));
    
    const results = {};
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (!query) continue;
      
      console.log(`📊 Running query ${i + 1}/${queries.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_query: query
        });
        
        if (error) {
          console.error(`❌ Error in query ${i + 1}:`, error);
          results[`query_${i + 1}`] = { error: error.message };
        } else {
          console.log(`✅ Query ${i + 1} completed`);
          results[`query_${i + 1}`] = data;
        }
      } catch (e) {
        console.error(`💥 Exception in query ${i + 1}:`, e.message);
        results[`query_${i + 1}`] = { error: e.message };
      }
    }
    
    // Save results
    const outputPath = path.join(__dirname, 'database-check-results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n💾 Results saved to: ${outputPath}`);
    
    return results;
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

runDatabaseCheck();
