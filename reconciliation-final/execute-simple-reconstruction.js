const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role key for admin operations
const supabaseUrl = 'https://pjvjezpjgbgqhtzxlxfa.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqdmplenBqZ2JncWh0enhseGZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDcyNTcyMiwiZXhwIjoyMDUwMzAxNzIyfQ.qKB2Wg1nKR5i9VYLWjW_dEj3X_z1E6KYoKdJEfK-cUk'; // This would be your service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeDirectSQL() {
    console.log('🚀 Starting Brighton Hub Database Reconstruction (Direct SQL)...');
    
    try {
        // Read the SQL file
        const sqlFile = path.join(__dirname, 'complete-database-reconstruction.sql');
        const sqlContent = fs.readFileSync(sqlFile, 'utf8');
        
        console.log('📋 Executing complete SQL script...');
        
        // Execute the entire SQL script at once
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: sqlContent
        });
        
        if (error) {
            console.log(`❌ Error executing SQL: ${error.message}`);
            console.log('🔧 Trying alternative approach...');
            
            // Try direct table queries to check if tables exist
            await checkTablesDirectly();
        } else {
            console.log('✅ SQL script executed successfully!');
            console.log('Data:', data);
        }
        
    } catch (error) {
        console.error('💥 Error:', error.message);
        console.log('\n🔧 Trying to check tables directly instead...');
        await checkTablesDirectly();
    }
}

async function checkTablesDirectly() {
    console.log('\n🔍 Checking tables directly...');
    
    const tablesToCheck = [
        'user_profiles',
        'properties', 
        'projects',
        'food_items',
        'store_products',
        'blogs',
        'categories',
        'messages'
    ];
    
    for (const table of tablesToCheck) {
        try {
            const { data, error, count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });
                
            if (error) {
                console.log(`❌ ${table}: ${error.message}`);
            } else {
                console.log(`✅ ${table}: Exists (${count || 0} records)`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ${err.message}`);
        }
    }
}

// Simple alternative: Just create the essential tables
async function createEssentialTables() {
    console.log('\n🛠️  Creating essential missing tables...');
    
    const essentialTables = [
        {
            name: 'vendors',
            sql: `
                CREATE TABLE IF NOT EXISTS vendors (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    business_name VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        },
        {
            name: 'agents',
            sql: `
                CREATE TABLE IF NOT EXISTS agents (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    agency_name VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        },
        {
            name: 'contractors',
            sql: `
                CREATE TABLE IF NOT EXISTS contractors (
                    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                    name VARCHAR(255) NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    business_name VARCHAR(255),
                    is_active BOOLEAN DEFAULT true,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        }
    ];
    
    for (const table of essentialTables) {
        try {
            const { data, error } = await supabase.rpc('exec_sql', {
                sql_query: table.sql
            });
            
            if (error) {
                console.log(`❌ ${table.name}: ${error.message}`);
            } else {
                console.log(`✅ ${table.name}: Created successfully`);
            }
        } catch (err) {
            console.log(`❌ ${table.name}: ${err.message}`);
        }
    }
}

// Run everything
async function main() {
    await executeDirectSQL();
    await createEssentialTables();
    
    console.log('\n🎉 Process complete! Check the results above.');
    console.log('💡 If you see network errors, you may need to run the SQL manually in Supabase Dashboard.');
}

main();
