/**
 * Complete Authentication System Test
 * Tests signup, login, forgot password, and protected routes
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test123456',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

async function testSignup() {
  logSection('TEST 1: User Signup');
  
  try {
    log(`📝 Creating account for: ${TEST_USER.email}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (response.data.success && response.data.token && response.data.user) {
      log('✅ Signup successful!', 'green');
      log(`   Token: ${response.data.token.substring(0, 20)}...`, 'green');
      log(`   User ID: ${response.data.user.id}`, 'green');
      log(`   Name: ${response.data.user.name}`, 'green');
      log(`   Email: ${response.data.user.email}`, 'green');
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      log('❌ Signup failed: Invalid response structure', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Signup failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${error.response.data.error || error.response.data.message}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    return { success: false };
  }
}

async function testDuplicateSignup() {
  logSection('TEST 2: Duplicate Email Signup (Should Fail)');
  
  try {
    log(`📝 Attempting duplicate signup for: ${TEST_USER.email}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Another User',
      email: TEST_USER.email,
      password: 'AnotherPassword123',
    });

    log('❌ Test failed: Duplicate signup should have been rejected', 'red');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 409) {
      log('✅ Duplicate signup correctly rejected!', 'green');
      log(`   Error: ${error.response.data.error}`, 'green');
      return { success: true };
    } else {
      log('❌ Unexpected error:', 'red');
      log(`   ${error.message}`, 'red');
      return { success: false };
    }
  }
}

async function testLogin() {
  logSection('TEST 3: User Login');
  
  try {
    log(`🔐 Logging in as: ${TEST_USER.email}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (response.data.success && response.data.token && response.data.user) {
      log('✅ Login successful!', 'green');
      log(`   Token: ${response.data.token.substring(0, 20)}...`, 'green');
      log(`   User: ${response.data.user.name}`, 'green');
      return { success: true, token: response.data.token, user: response.data.user };
    } else {
      log('❌ Login failed: Invalid response structure', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Login failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${error.response.data.error || error.response.data.message}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    return { success: false };
  }
}

async function testInvalidLogin() {
  logSection('TEST 4: Invalid Login (Should Fail)');
  
  try {
    log(`🔐 Attempting login with wrong password`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: 'WrongPassword123',
    });

    log('❌ Test failed: Invalid login should have been rejected', 'red');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✅ Invalid login correctly rejected!', 'green');
      log(`   Error: ${error.response.data.error}`, 'green');
      return { success: true };
    } else {
      log('❌ Unexpected error:', 'red');
      log(`   ${error.message}`, 'red');
      return { success: false };
    }
  }
}

async function testProtectedRoute(token) {
  logSection('TEST 5: Protected Route Access');
  
  try {
    log(`🔒 Accessing /api/auth/me with token`, 'blue');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success && response.data.user) {
      log('✅ Protected route access successful!', 'green');
      log(`   User: ${response.data.user.name}`, 'green');
      log(`   Email: ${response.data.user.email}`, 'green');
      return { success: true };
    } else {
      log('❌ Protected route failed: Invalid response', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Protected route access failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${error.response.data.message}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    return { success: false };
  }
}

async function testUnauthorizedAccess() {
  logSection('TEST 6: Unauthorized Access (Should Fail)');
  
  try {
    log(`🔒 Accessing /api/auth/me without token`, 'blue');
    
    const response = await axios.get(`${BASE_URL}/api/auth/me`);

    log('❌ Test failed: Unauthorized access should have been rejected', 'red');
    return { success: false };
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✅ Unauthorized access correctly rejected!', 'green');
      log(`   Error: ${error.response.data.message}`, 'green');
      return { success: true };
    } else {
      log('❌ Unexpected error:', 'red');
      log(`   ${error.message}`, 'red');
      return { success: false };
    }
  }
}

async function testForgotPassword() {
  logSection('TEST 7: Forgot Password');
  
  try {
    log(`📧 Requesting password reset for: ${TEST_USER.email}`, 'blue');
    
    const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, {
      email: TEST_USER.email,
    });

    if (response.data.success) {
      log('✅ Password reset request successful!', 'green');
      log(`   Message: ${response.data.message}`, 'green');
      log('   ⚠️  Check server logs for OTP code', 'yellow');
      return { success: true };
    } else {
      log('❌ Password reset failed', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Password reset request failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${error.response.data.message}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    return { success: false };
  }
}

async function testDashboardSummary(token) {
  logSection('TEST 8: Dashboard Summary');
  
  try {
    log(`📊 Fetching dashboard summary`, 'blue');
    
    const response = await axios.get(`${BASE_URL}/api/dashboard/summary`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.success && response.data.data) {
      log('✅ Dashboard summary fetched successfully!', 'green');
      log(`   Workspaces: ${response.data.data.workspaces}`, 'green');
      log(`   Notes: ${response.data.data.notes}`, 'green');
      log(`   Documents: ${response.data.data.documents}`, 'green');
      log(`   AI Chats: ${response.data.data.aiChats}`, 'green');
      return { success: true };
    } else {
      log('❌ Dashboard summary failed: Invalid response', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Dashboard summary failed:', 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Error: ${error.response.data.message}`, 'red');
    } else {
      log(`   ${error.message}`, 'red');
    }
    return { success: false };
  }
}

async function runAllTests() {
  log('\n🚀 Starting Complete Authentication System Tests\n', 'cyan');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Test User: ${TEST_USER.email}\n`, 'blue');

  const results = [];
  let token = null;

  // Test 1: Signup
  const signupResult = await testSignup();
  results.push({ name: 'Signup', ...signupResult });
  if (signupResult.success) {
    token = signupResult.token;
  }

  // Test 2: Duplicate Signup
  const duplicateResult = await testDuplicateSignup();
  results.push({ name: 'Duplicate Signup Prevention', ...duplicateResult });

  // Test 3: Login
  const loginResult = await testLogin();
  results.push({ name: 'Login', ...loginResult });
  if (loginResult.success) {
    token = loginResult.token;
  }

  // Test 4: Invalid Login
  const invalidLoginResult = await testInvalidLogin();
  results.push({ name: 'Invalid Login Prevention', ...invalidLoginResult });

  // Test 5: Protected Route (only if we have a token)
  if (token) {
    const protectedResult = await testProtectedRoute(token);
    results.push({ name: 'Protected Route Access', ...protectedResult });
  }

  // Test 6: Unauthorized Access
  const unauthorizedResult = await testUnauthorizedAccess();
  results.push({ name: 'Unauthorized Access Prevention', ...unauthorizedResult });

  // Test 7: Forgot Password
  const forgotPasswordResult = await testForgotPassword();
  results.push({ name: 'Forgot Password', ...forgotPasswordResult });

  // Test 8: Dashboard Summary (only if we have a token)
  if (token) {
    const dashboardResult = await testDashboardSummary(token);
    results.push({ name: 'Dashboard Summary', ...dashboardResult });
  }

  // Print Summary
  logSection('TEST SUMMARY');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach((result, index) => {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    const color = result.success ? 'green' : 'red';
    log(`${index + 1}. ${result.name}: ${status}`, color);
  });

  console.log('\n' + '='.repeat(60));
  const summaryColor = passed === total ? 'green' : (passed > total / 2 ? 'yellow' : 'red');
  log(`\nTotal: ${passed}/${total} tests passed`, summaryColor);
  console.log('='.repeat(60) + '\n');

  if (passed === total) {
    log('🎉 All tests passed! Authentication system is working correctly.', 'green');
  } else {
    log('⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  log('\n💥 Test suite crashed:', 'red');
  console.error(error);
  process.exit(1);
});
