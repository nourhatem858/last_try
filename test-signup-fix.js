/**
 * Signup Fix Verification Script
 * Tests all signup scenarios to verify the fix works
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
const testEmail = `test_${Date.now()}@example.com`;

console.log('🧪 Signup Fix Verification');
console.log('==========================\n');

async function testSignup() {
  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Valid Signup
  console.log('📝 Test 1: Valid Signup');
  console.log('─────────────────────────');
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test User',
      email: testEmail,
      password: 'Test123456',
    });

    if (response.data.success && response.data.token && response.data.user) {
      console.log('✅ PASS: Valid signup successful');
      console.log(`   Token: ${response.data.token.substring(0, 20)}...`);
      console.log(`   User: ${response.data.user.email}`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Invalid response structure');
      console.log('   Response:', response.data);
      testsFailed++;
    }
  } catch (error) {
    console.log('❌ FAIL: Valid signup failed');
    console.log('   Error:', error.response?.data || error.message);
    testsFailed++;
  }

  // Test 2: Duplicate Email
  console.log('\n📝 Test 2: Duplicate Email');
  console.log('─────────────────────────');
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Another User',
      email: testEmail, // Same email as Test 1
      password: 'Test123456',
    });
    console.log('❌ FAIL: Duplicate email should have been rejected');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 409 && error.response?.data?.error) {
      console.log('✅ PASS: Duplicate email rejected correctly');
      console.log(`   Error message: "${error.response.data.error}"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Wrong error response');
      console.log('   Response:', error.response?.data);
      testsFailed++;
    }
  }

  // Test 3: Invalid Email
  console.log('\n📝 Test 3: Invalid Email Format');
  console.log('─────────────────────────');
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test User',
      email: 'not-an-email',
      password: 'Test123456',
    });
    console.log('❌ FAIL: Invalid email should have been rejected');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('email')) {
      console.log('✅ PASS: Invalid email rejected correctly');
      console.log(`   Error message: "${error.response.data.error}"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Wrong error response');
      console.log('   Response:', error.response?.data);
      testsFailed++;
    }
  }

  // Test 4: Short Password
  console.log('\n📝 Test 4: Short Password');
  console.log('─────────────────────────');
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      password: '123',
    });
    console.log('❌ FAIL: Short password should have been rejected');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('6 characters')) {
      console.log('✅ PASS: Short password rejected correctly');
      console.log(`   Error message: "${error.response.data.error}"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Wrong error response');
      console.log('   Response:', error.response?.data);
      testsFailed++;
    }
  }

  // Test 5: Missing Fields
  console.log('\n📝 Test 5: Missing Fields');
  console.log('─────────────────────────');
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      // password missing
    });
    console.log('❌ FAIL: Missing fields should have been rejected');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error) {
      console.log('✅ PASS: Missing fields rejected correctly');
      console.log(`   Error message: "${error.response.data.error}"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Wrong error response');
      console.log('   Response:', error.response?.data);
      testsFailed++;
    }
  }

  // Test 6: Short Name
  console.log('\n📝 Test 6: Short Name');
  console.log('─────────────────────────');
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: 'A', // Only 1 character
      email: `test_${Date.now()}@example.com`,
      password: 'Test123456',
    });
    console.log('❌ FAIL: Short name should have been rejected');
    testsFailed++;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.includes('2 characters')) {
      console.log('✅ PASS: Short name rejected correctly');
      console.log(`   Error message: "${error.response.data.error}"`);
      testsPassed++;
    } else {
      console.log('❌ FAIL: Wrong error response');
      console.log('   Response:', error.response?.data);
      testsFailed++;
    }
  }

  // Summary
  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('📊 TEST SUMMARY');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Tests Passed: ${testsPassed}/6`);
  console.log(`❌ Tests Failed: ${testsFailed}/6`);
  console.log('═══════════════════════════════════════');

  if (testsFailed === 0) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('✅ Signup fix is working correctly');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test signup in browser: http://localhost:3000/signup');
    console.log('   2. Verify error messages are user-friendly');
    console.log('   3. Check browser console for detailed logs');
  } else {
    console.log('\n⚠️  SOME TESTS FAILED');
    console.log('❌ Please review the errors above');
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check if server is running: npm run dev');
    console.log('   2. Verify MongoDB connection: node verify-mongodb-connection.js');
    console.log('   3. Check server console for errors');
    console.log('   4. Review SIGNUP_FIX_COMPLETE.md for details');
  }

  console.log('\n');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch (err) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('\n📝 Please start the server first:');
    console.log('   npm run dev');
    console.log('\nThen run this test again:');
    console.log('   node test-signup-fix.js');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await testSignup();
})();
