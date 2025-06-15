// Test the login API directly
import 'dotenv/config';

async function testLogin() {
  try {
    console.log('🔐 Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@brightonhub.ng',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Login successful:', data);
    } else {
      const error = await response.text();
      console.log('❌ Login failed:', error);
    }
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testLogin();
