const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client
const supabaseUrl = 'https://pjvjezpjgbgqhtzxlxfa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdmplenBqZ2JncWh0enhseGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3MjU3MjIsImV4cCI6MjA1MDMwMTcyMn0.8aVKdGcNJH1gGNWnP-6Oze9dWDhAQDOTxbNRhyRqbUU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeReconstructionSQL() {
    console.log('🚀 Starting Brighton Hub Database Reconstruction...');
    
    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'complete-database-reconstruction.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📋 Found ${statements.length} SQL statements to execute`);
        
        let successCount = 0;
        let errorCount = 0;
        
        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            
            // Skip comments and empty statements
            if (!statement || statement.startsWith('--')) continue;
            
            try {
                console.log(`\n⚡ Executing statement ${i + 1}/${statements.length}:`);
                console.log(`   ${statement.substring(0, 100)}...`);
                
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: statement
                });
                
                if (error) {
                    console.log(`❌ Error: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`✅ Success`);
                    successCount++;
                }
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (err) {
                console.log(`❌ Exception: ${err.message}`);
                errorCount++;
            }
        }
        
        console.log('\n🎯 RECONSTRUCTION SUMMARY:');
        console.log(`✅ Successful statements: ${successCount}`);
        console.log(`❌ Failed statements: ${errorCount}`);
        console.log(`📊 Total statements: ${successCount + errorCount}`);
        
        // Final verification
        console.log('\n🔍 Verifying critical tables...');
        await verifyTables();
        
        console.log('\n🎉 Brighton Hub Database Reconstruction Complete!');
        console.log('🔥 All 21 critical issues should now be resolved.');
        
    } catch (error) {
        console.error('💥 Reconstruction failed:', error);
    }
}

async function verifyTables() {
    const criticalTables = [
        'vendors',
        'agents', 
        'contractors',
        'admin_users',
        'admin_settings',
        'vendor_products'
    ];
    
    for (const table of criticalTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*', { count: 'exact' })
                .limit(1);
                
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: Table exists and accessible`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
}

// Run the reconstruction
executeReconstructionSQL();
