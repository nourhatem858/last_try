/**
 * Test Critical Fixes
 * Tests all 11 critical issues to verify they're fixed
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

// Test 1: EMAIL_EXISTS Error Code
async function testEmailExists() {
  logSection('TEST 1: EMAIL_EXISTS Error Code');
  
  try {
    // First create a user
    const email = `test${Date.now()}@example.com`;
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email,
      password: 'Test123456',
    });

    // Try to signup again with same email
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Another User',
      email,
      password: 'AnotherPass123',
    });

    log('❌ Test failed: Should have returned error', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 409 && error.response?.data?.code === 'EMAIL_EXISTS') {
      log('✅ EMAIL_EXISTS code returned correctly', 'green');
      log(`   Message: ${error.response.data.message}`, 'green');
      return true;
    } else {
      log('❌ Wrong error code or status', 'red');
      return false;
    }
  }
}

// Test 2: NOT_FOUND Error Code
async function testNotFound() {
  logSection('TEST 2: NOT_FOUND Error Code');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'SomePassword123',
    });

    log('❌ Test failed: Should have returned error', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 404 && error.response?.data?.code === 'NOT_FOUND') {
      log('✅ NOT_FOUND code returned correctly', 'green');
      log(`   Message: ${error.response.data.message}`, 'green');
      return true;
    } else {
      log('❌ Wrong error code or status', 'red');
      log(`   Got: ${error.response?.status} - ${error.response?.data?.code}`, 'red');
      return false;
    }
  }
}

// Test 3: INVALID_PASSWORD Error Code
async function testInvalidPassword() {
  logSection('TEST 3: INVALID_PASSWORD Error Code');
  
  try {
    // Create a user first
    const email = `test${Date.now()}@example.com`;
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email,
      password: 'CorrectPassword123',
    });

    // Try to login with wrong password
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password: 'WrongPassword123',
    });

    log('❌ Test failed: Should have returned error', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 401 && error.response?.data?.code === 'INVALID_PASSWORD') {
      log('✅ INVALID_PASSWORD code returned correctly', 'green');
      log(`   Message: ${error.response.data.message}`, 'green');
      return true;
    } else {
      log('❌ Wrong error code or status', 'red');
      log(`   Got: ${error.response?.status} - ${error.response?.data?.code}`, 'red');
      return false;
    }
  }
}

// Test 4: JWT Token Verification
async function testJWTVerification() {
  logSection('TEST 4: JWT Token Verification');
  
  try {
    // Create and login user
    const email = `test${Date.now()}@example.com`;
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email,
      password: 'Test123456',
    });

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password: 'Test123456',
    });

    const token = loginResponse.data.token;

    // Test protected route with valid token
    const meResponse = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (meResponse.data.success && meResponse.data.user) {
      log('✅ JWT verification works with valid token', 'green');
      
      // Test with invalid token
      try {
        await axios.get(`${BASE_URL}/api/auth/me`, {
          headers: { Authorization: 'Bearer invalid-token' },
        });
        log('❌ Should have rejected invalid token', 'red');
        return false;
      } catch (error) {
        if (error.response?.status === 401) {
          log('✅ Invalid token correctly rejected', 'green');
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    log('❌ JWT verification test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 5: Dynamic Counts
async function testDynamicCounts() {
  logSection('TEST 5: Dynamic Counts');
  
  try {
    // Create and login user
    const email = `test${Date.now()}@example.com`;
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email,
      password: 'Test123456',
    });

    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email,
      password: 'Test123456',
    });

    const token = loginResponse.data.token;

    // Test all count endpoints
    const [notesRes, workspacesRes, documentsRes, chatsRes] = await Promise.all([
      axios.get(`${BASE_URL}/api/notes/count`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BASE_URL}/api/workspaces/count`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BASE_URL}/api/documents/count`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      axios.get(`${BASE_URL}/api/chats/count`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    const allSuccess = 
      notesRes.data.success &&
      workspacesRes.data.success &&
      documentsRes.data.success &&
      chatsRes.data.success;

    if (allSuccess) {
      log('✅ All count endpoints working', 'green');
      log(`   Notes: ${notesRes.data.count}`, 'green');
      log(`   Workspaces: ${workspacesRes.data.count}`, 'green');
      log(`   Documents: ${documentsRes.data.count}`, 'green');
      log(`   Chats: ${chatsRes.data.count}`, 'green');
      return true;
    } else {
      log('❌ Some count endpoints failed', 'red');
      return false;
    }
  } catch (error) {
    log('❌ Dynamic counts test failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// Test 6: Unauthorized Access
async function testUnauthorizedAccess() {
  logSection('TEST 6: Unauthorized Access Protection');
  
  try {
    // Try to access protected route without token
    await axios.get(`${BASE_URL}/api/auth/me`);
    log('❌ Should have rejected request without token', 'red');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log('✅ Unauthorized access correctly blocked', 'green');
      return true;
    } else {
      log('❌ Wrong status code', 'red');
      return false;
    }
  }
}

// Run all tests
async function runAllTests() {
  log('\n🚀 Starting Critical Fixes Test Suite\n', 'cyan');
  log(`Base URL: ${BASE_URL}`, 'yellow');
  log('Make sure the server is running on port 3000\n', 'yellow');

  const results = [];

  // Run tests
  results.push({ name: 'EMAIL_EXISTS Error Code', passed: await testEmailExists() });
  results.push({ name: 'NOT_FOUND Error Code', passed: await testNotFound() });
  results.push({ name: 'INVALID_PASSWORD Error Code', passed: await testInvalidPassword() });
  results.push({ name: 'JWT Token Verification', passed: await testJWTVerification() });
  results.push({ name: 'Dynamic Counts', passed: await testDynamicCounts() });
  results.push({ name: 'Unauthorized Access Protection', passed: await testUnauthorizedAccess() });

  // Print summary
  logSection('TEST SUMMARY');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const color = result.passed ? 'green' : 'red';
    log(`${index + 1}. ${result.name}: ${status}`, color);
  });

  console.log('\n' + '='.repeat(70));
  const summaryColor = passed === total ? 'green' : (passed > total / 2 ? 'yellow' : 'red');
  log(`\nTotal: ${passed}/${total} tests passed`, summaryColor);
  console.log('='.repeat(70) + '\n');

  if (passed === total) {
    log('🎉 All critical fixes verified! System is working correctly.', 'green');
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
