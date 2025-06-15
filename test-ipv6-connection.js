const { Client } = require('pg');
require('dotenv').config();

async function testIPv6Connection() {
    console.log('🔍 Testing IPv6 database connection...\n');
    
    try {
        // Force IPv6 by using the IPv6 address directly
        const ipv6Address = '2a05:d014:1c06:5f04:e569:c508:f465:a419';
        const originalUrl = process.env.DATABASE_URL;
        
        // Replace hostname with IPv6 address (bracketed for URLs)
        const ipv6Url = originalUrl.replace(
            'db.oxihwxwfkoxqeajwhshe.supabase.co', 
            `[${ipv6Address}]`
        );
        
        console.log('📋 Original URL:', originalUrl.replace(/:[^:@]*@/, ':****@'));
        console.log('📋 IPv6 URL:', ipv6Url.replace(/:[^:@]*@/, ':****@'));
        
        const client = new Client({
            connectionString: ipv6Url,
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('🔗 Attempting IPv6 connection...');
        await client.connect();
        console.log('✅ IPv6 connection successful!');
        
        const result = await client.query('SELECT version()');
        console.log('📊 Database version:', result.rows[0].version.slice(0, 50) + '...');
        
        await client.end();
        console.log('🎉 IPv6 connection test completed successfully!');
        return true;
        
    } catch (error) {
        console.log('❌ IPv6 connection failed:', error.message);
        return false;
    }
}

// Also test if we can enable IPv6 in Node.js
async function testNodeIPv6Support() {
    console.log('\n🔍 Testing Node.js IPv6 support...');
    
    try {
        const dns = require('dns');
        dns.setDefaultResultOrder('ipv6first');
        console.log('✅ IPv6 priority set in Node.js');
        return true;
    } catch (error) {
        console.log('❌ IPv6 configuration failed:', error.message);
        return false;
    }
}

async function main() {
    const ipv6Support = await testNodeIPv6Support();
    const ipv6Connection = await testIPv6Connection();
    
    if (ipv6Connection) {
        console.log('\n🎊 Solution found! Your database requires IPv6 connection.');
        console.log('💡 You can either:');
        console.log('   1. Use IPv6 connection string in your app');
        console.log('   2. Create a new Supabase project with IPv4 support');
        console.log('   3. Use the manual dashboard setup method');
    } else {
        console.log('\n😞 IPv6 connection also failed.');
        console.log('💡 Recommended: Set up database manually via Supabase Dashboard');
    }
}

main().catch(console.error);
