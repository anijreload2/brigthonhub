// Simple network test
const dns = require('dns');

console.log('🔍 Testing DNS resolution...');

const hostname = 'db.oxihwxwfkoxqeajwhshe.supabase.co';

dns.lookup(hostname, (err, address, family) => {
  if (err) {
    console.error('❌ DNS lookup failed:', err.message);
    console.log('🎯 This confirms the hostname does not exist');
    console.log('✅ Solution: Get a new connection string from Supabase Dashboard');
  } else {
    console.log('✅ DNS lookup successful:', address);
    console.log('Family:', family);
  }
});

// Also test general internet connectivity
dns.lookup('supabase.com', (err, address, family) => {
  if (err) {
    console.error('❌ Cannot reach supabase.com - check internet connection');
  } else {
    console.log('✅ supabase.com is reachable:', address);
  }
});
