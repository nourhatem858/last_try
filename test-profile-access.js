/**
 * Test Profile Access
 * Check if token exists and is valid
 */

const axios = require('axios');

async function testProfileAccess() {
  console.log('🔍 Testing Profile Access...\n');

  // Check if we can access the profile page
  const token = process.env.TEST_TOKEN || 'your-token-here';
  
  if (!token || token === 'your-token-here') {
    console.log('❌ No token provided!');
    console.log('📝 Steps to fix:');
    console.log('1. Login first: http://localhost:3000/login');
    console.log('2. Open browser console (F12)');
    console.log('3. Run: localStorage.getItem("token")');
    console.log('4. Copy the token');
    console.log('5. Run: TEST_TOKEN=your-token node test-profile-access.js\n');
    return;
  }

  try {
    console.log('🔑 Testing with token:', token.substring(0, 20) + '...\n');

    const response = await axios.get('http://localhost:3000/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success) {
      console.log('✅ Profile API works!');
      console.log('👤 User:', response.data.user.name);
      console.log('📧 Email:', response.data.user.email);
      console.log('🎭 Role:', response.data.user.role);
      console.log('\n✅ You should be able to access /profile page now!');
    } else {
      console.log('❌ API returned success: false');
      console.log('Error:', response.data.error);
    }
  } catch (error) {
    console.error('❌ Error accessing profile:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Error:', error.response.data.error);
      
      if (error.response.status === 401) {
        console.log('\n🔒 Token is invalid or expired!');
        console.log('📝 Solution: Login again to get a new token');
      }
    } else {
      console.log('Error:', error.message);
      console.log('\n⚠️ Make sure the server is running:');
      console.log('npm run dev');
    }
  }
}

testProfileAccess();
