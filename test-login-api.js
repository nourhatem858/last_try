/**
 * Test Login API
 * Tests the login endpoint directly
 */

async function testLoginAPI() {
  try {
    console.log('🧪 Testing Login API...\n');

    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    console.log('📤 Sending login request...');
    console.log('Email:', credentials.email);
    console.log('Password:', credentials.password);
    console.log('');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    console.log('📥 Response Status:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('\n📋 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Login successful!');
      console.log('🎫 Token:', data.token.substring(0, 20) + '...');
      console.log('👤 User:', data.user.name, `(${data.user.email})`);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testLoginAPI();
