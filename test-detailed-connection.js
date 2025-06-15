const { Client } = require('pg');
require('dotenv').config();

async function testDetailedConnection() {
    console.log('🔍 Testing Supabase Connection Details...\n');
    
    // Parse the connection string
    const connectionString = process.env.DATABASE_URL;
    console.log('📋 Connection String (masked):', connectionString.replace(/:[^:@]*@/, ':****@'));
    
    try {
        // Parse URL components
        const url = new URL(connectionString);
        console.log('🌐 Host:', url.hostname);
        console.log('🔌 Port:', url.port);
        console.log('🗄️ Database:', url.pathname.slice(1));
        console.log('👤 Username:', url.username);
        console.log('📊 SSL Mode:', url.searchParams.get('sslmode') || 'not specified');
        
        console.log('\n🔗 Testing connection...');
        
        // Test with different SSL configurations
        const configs = [
            {
                name: 'Default SSL',
                config: {
                    connectionString: connectionString,
                    ssl: { rejectUnauthorized: false }
                }
            },
            {
                name: 'No SSL',
                config: {
                    connectionString: connectionString.replace('?sslmode=require', ''),
                    ssl: false
                }
            },
            {
                name: 'Force SSL',
                config: {
                    connectionString: connectionString,
                    ssl: { rejectUnauthorized: true }
                }
            }
        ];
        
        for (const { name, config } of configs) {
            console.log(`\n⚡ Testing ${name}...`);
            const client = new Client(config);
            
            try {
                await client.connect();
                console.log(`✅ ${name}: SUCCESS!`);
                
                // Test a simple query
                const result = await client.query('SELECT version()');
                console.log(`📊 Database version: ${result.rows[0].version.slice(0, 50)}...`);
                
                await client.end();
                console.log(`🎉 ${name} connection working perfectly!`);
                return true;
            } catch (err) {
                console.log(`❌ ${name}: FAILED`);
                console.log(`   Error: ${err.message}`);
                try {
                    await client.end();
                } catch (e) {
                    // Ignore cleanup errors
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.log('❌ Connection test failed:', error.message);
        
        // Additional diagnostic info
        console.log('\n🔧 Diagnostic Information:');
        console.log('- Check if your Supabase project is in the correct region');
        console.log('- Verify the project reference ID in the hostname');
        console.log('- Ensure your password doesn\'t contain special characters that need encoding');
        console.log('- Try accessing your Supabase dashboard to confirm project status');
        
        return false;
    }
}

testDetailedConnection()
    .then(success => {
        if (success) {
            console.log('\n🎊 Database connection is working! You can now run Prisma commands.');
        } else {
            console.log('\n😞 All connection attempts failed. Please check your Supabase project settings.');
        }
        process.exit(success ? 0 : 1);
    })
    .catch(err => {
        console.log('💥 Unexpected error:', err);
        process.exit(1);
    });
