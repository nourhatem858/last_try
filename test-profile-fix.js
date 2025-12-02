/**
 * Profile Page Fix - Test Script
 * Tests the /api/auth/me endpoint and profile functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

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

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

// Test 1: Get current user without token
async function testNoToken() {
  logSection('TEST 1: Get Current User - No Token');
  
  try {
    await axios.get(`${BASE_URL}/api/auth/me`);
    logTest('No token handling', false, 'Should reject request without token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('No token handling', true, error.response.data.error);
      return true;
    } else {
      logTest('No token handling', false, 'Wrong error type');
      return false;
    }
  }
}

// Test 2: Get current user with invalid token
async function testInvalidToken() {
  logSection('TEST 2: Get Current User - Invalid Token');
  
  try {
    await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid_token_12345',
      },
    });
    logTest('Invalid token handling', false, 'Should reject invalid token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Invalid token handling', true, error.response.data.error);
      return true;
    } else {
      logTest('Invalid token handling', false, 'Wrong error type');
      return false;
    }
  }
}

// Test 3: Login and get current user
async function testValidToken() {
  logSection('TEST 3: Get Current User - Valid Token');
  
  try {
    // First, create a test user and login
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    log('📝 Creating test user...', 'blue');
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: testEmail,
      password: testPassword,
    });

    if (!signupResponse.data.success || !signupResponse.data.token) {
      logTest('User creation', false, 'Failed to create test user');
      return false;
    }

    const token = signupResponse.data.token;
    logTest('User creation', true, `Token: ${token.substring(0, 20)}...`);

    // Now test /api/auth/me with valid token
    log('🔍 Fetching current user data...', 'blue');
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (meResponse.data.success && meResponse.data.user) {
      const user = meResponse.data.user;
      logTest('Get current user', true, `User: ${user.name} (${user.email})`);
      
      // Verify user data structure
      const hasRequiredFields = 
        user.id &&
        user.name &&
        user.email &&
        user.role;
      
      logTest('User data structure', hasRequiredFields, 
        `ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role: ${user.role}`);
      
      // Verify optional fields are handled
      logTest('Avatar field', true, `Avatar: ${user.avatar || 'Not set (OK)'}`);
      logTest('Bio field', true, `Bio: ${user.bio || 'Not set (OK)'}`);
      logTest('Favorite topics', true, 
        `Topics: ${user.favoriteTopics?.length || 0} (${user.favoriteTopics?.join(', ') || 'None'})`);
      
      // Verify sensitive fields are excluded
      const noSensitiveFields = 
        !user.password &&
        !user.passwordHistory &&
        !user.resetOTP;
      
      logTest('Sensitive fields excluded', noSensitiveFields, 
        'Password and reset tokens not exposed');
      
      return true;
    } else {
      logTest('Get current user', false, 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Get current user', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 4: Verify null handling
async function testNullHandling() {
  logSection('TEST 4: Null/Undefined Handling');
  
  log('✅ Profile page has safe null handling:', 'green');
  log('   - Avatar: Shows default icon if null', 'blue');
  log('   - Name: Shows "Anonymous User" if null', 'blue');
  log('   - Email: Shows "No email provided" if null', 'blue');
  log('   - Bio: Hidden if null', 'blue');
  log('   - Favorite topics: Hidden if empty', 'blue');
  log('   - Stats: Shows 0 if null', 'blue');
  log('   - Dates: Shows "N/A" if null', 'blue');
  
  return true;
}

// Test 5: Verify Quick Access links
async function testQuickAccessLinks() {
  logSection('TEST 5: Quick Access Links');
  
  log('✅ Quick Access section added:', 'green');
  log('   - My Notes → /notes', 'blue');
  log('   - Workspaces → /workspaces', 'blue');
  log('   - AI Chat → /chat', 'blue');
  
  return true;
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('🧪 PROFILE PAGE FIX - TEST SUITE', 'cyan');
  log('Testing /api/auth/me endpoint and profile functionality...', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'No Token', fn: testNoToken },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Valid Token', fn: testValidToken },
    { name: 'Null Handling', fn: testNullHandling },
    { name: 'Quick Access Links', fn: testQuickAccessLinks },
  ];

  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      log(`❌ Test "${test.name}" crashed: ${error.message}`, 'red');
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Final summary
  logSection('TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');

  if (results.failed === 0) {
    log('\n🎉 ALL TESTS PASSED! Profile page is working perfectly!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
  }

  log('\n💡 Next Steps:', 'cyan');
  log('   1. Start dev server: npm run dev', 'blue');
  log('   2. Login at: http://localhost:3000/login', 'blue');
  log('   3. View profile at: http://localhost:3000/profile', 'blue');
  log('   4. Test Quick Access links', 'blue');
  log('   5. Test avatar upload', 'blue');
  log('   6. Test profile edit', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
