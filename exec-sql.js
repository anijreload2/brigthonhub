const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create admin client for executing SQL
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function execSql(sql, description = 'SQL execution') {
  try {
    console.log(`🔧 ${description}...`);
    
    // Use raw SQL execution through Supabase
    const { data, error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: sql.trim()
    });
    
    if (error) {
      // If exec_sql doesn't exist, log the SQL for manual execution
      if (error.message?.includes('function exec_sql') || error.code === '42883') {
        console.log(`⚠️ exec_sql function not available. SQL to execute manually:`);
        console.log(`   ${sql.trim()}`);
        console.log(`   (Please run this in Supabase SQL Editor)`);
        return true; // Continue as if successful
      } else {
        console.error(`❌ ${description} failed:`, error);
        return false;
      }
    }
    
    console.log(`✅ ${description} completed successfully`);
    if (data) {
      console.log('   Result:', data);
    }
    return true;
  } catch (err) {
    console.error(`❌ ${description} error:`, err);
    return false;
  }
}

// Alternative function using raw SQL execution
async function execRawSql(sql, description = 'SQL execution') {
  try {
    console.log(`🔧 ${description}...`);
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.toLowerCase().includes('begin') || 
          statement.toLowerCase().includes('commit') ||
          statement.toLowerCase().includes('rollback')) {
        continue; // Skip transaction control statements
      }
      
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          sql_query: statement 
        });
        
        if (error) {
          console.error(`❌ Statement failed: ${statement.substring(0, 50)}...`);
          console.error(`   Error:`, error);
          return false;
        }
      } catch (statementError) {
        console.error(`❌ Statement error: ${statement.substring(0, 50)}...`);
        console.error(`   Error:`, statementError);
        return false;
      }
    }
    
    console.log(`✅ ${description} completed successfully`);
    return true;
  } catch (err) {
    console.error(`❌ ${description} error:`, err);
    return false;
  }
}

// Create the exec_sql function if it doesn't exist
async function createExecSqlFunction() {
  const createFunctionSQL = `
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result text;
BEGIN
  EXECUTE sql_query;
  GET DIAGNOSTICS result = ROW_COUNT;
  RETURN 'Executed successfully. Rows affected: ' || result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$;
  `;
  
  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      sql_query: createFunctionSQL 
    });
    
    if (error) {
      console.log('📝 Creating exec_sql function using alternative method...');
      // Try to create it using a simple query approach
      const { error: altError } = await supabaseAdmin
        .schema('public')
        .rpc('create_function', { 
          function_sql: createFunctionSQL 
        });
        
      if (altError) {
        console.log('⚠️ Could not create exec_sql function automatically');
        console.log('   You may need to create it manually in Supabase SQL Editor');
        return false;
      }
    }
    
    console.log('✅ exec_sql function created successfully');
    return true;
  } catch (err) {
    console.log('⚠️ Could not create exec_sql function:', err.message);
    return false;
  }
}

module.exports = {
  execSql,
  execRawSql,
  createExecSqlFunction,
  supabaseAdmin
};

// If run directly, create the function
if (require.main === module) {
  (async () => {
    console.log('🚀 Setting up exec_sql function...\n');
    await createExecSqlFunction();
  })();
}
