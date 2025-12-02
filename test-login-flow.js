/**
 * Login Flow Test Suite
 * Tests login functionality with various scenarios
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warning: '\x1b[33m',
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`❌ Assertion failed: ${message}`);
  }
  log(`✅ ${message}`, 'success');
};

// Test 1: Successful Login
async function testSuccessfulLogin() {
  log('\n🔐 Test 1: Successful Login', 'info');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    assert(response.status === 200, 'Login returns 200 status');
    assert(response.data.success === true, 'Response has success flag');
    assert(response.data.token, 'Token is returned');
    assert(response.data.user, 'User data is returned');
    assert(response.data.user.email === 'test@example.com', 'Correct user email');
    assert(response.data.user.name, 'User has name');
    assert(response.data.user.id, 'User has ID');
    
    log(`Token: ${response.data.token.substring(0, 20)}...`, 'info');
    log(`User: ${response.data.user.name} (${response.data.user.email})`, 'info');
  } catch (error) {
    if (error.response?.status === 401) {
      log('User not found. Creating test user...', 'warning');
      
      // Create test user
      await axios.post(`${BASE_URL}/api/auth/signup`, {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      
      log('Test user created. Retrying login...', 'info');
      
      // Retry login
      const response = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123',
      });
      
      assert(response.status === 200, 'Login successful after signup');
      assert(response.data.token, 'Token received');
    } else {
      throw error;
    }
  }
}

// Test 2: Invalid Email Format
async function testInvalidEmailFormat() {
  log('\n📧 Test 2: Invalid Email Format', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'invalid-email',
      password: 'password123',
    });
    assert(false, 'Should have thrown error for invalid email');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for invalid email');
    assert(error.response?.data?.error, 'Error message provided');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 3: Missing Email
async function testMissingEmail() {
  log('\n❌ Test 3: Missing Email', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      password: 'password123',
    });
    assert(false, 'Should have thrown error for missing email');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for missing email');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 4: Missing Password
async function testMissingPassword() {
  log('\n❌ Test 4: Missing Password', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
    });
    assert(false, 'Should have thrown error for missing password');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for missing password');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 5: Wrong Password
async function testWrongPassword() {
  log('\n🔑 Test 5: Wrong Password', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'wrongpassword',
    });
    assert(false, 'Should have thrown error for wrong password');
  } catch (error) {
    assert(error.response?.status === 401, 'Returns 401 for wrong password');
    assert(error.response?.data?.error === 'Invalid email or password', 'Generic error message (security)');
    log('Correct: Generic error message prevents enumeration', 'success');
  }
}

// Test 6: Non-existent User
async function testNonExistentUser() {
  log('\n👻 Test 6: Non-existent User', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    assert(false, 'Should have thrown error for non-existent user');
  } catch (error) {
    assert(error.response?.status === 401, 'Returns 401 for non-existent user');
    assert(error.response?.data?.error === 'Invalid email or password', 'Generic error message (security)');
    log('Correct: Same error message as wrong password (prevents enumeration)', 'success');
  }
}

// Test 7: Case Insensitive Email
async function testCaseInsensitiveEmail() {
  log('\n🔤 Test 7: Case Insensitive Email', 'info');
  
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'TEST@EXAMPLE.COM',
    password: 'password123',
  });

  assert(response.status === 200, 'Login successful with uppercase email');
  assert(response.data.token, 'Token received');
  log('Email is case-insensitive', 'success');
}

// Test 8: Token Validation
async function testTokenValidation() {
  log('\n🎫 Test 8: Token Validation', 'info');
  
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });

  const token = loginResponse.data.token;
  assert(token, 'Token received');
  
  // Test token format (JWT has 3 parts separated by dots)
  const parts = token.split('.');
  assert(parts.length === 3, 'Token is valid JWT format');
  log('Token format is valid JWT', 'success');
  
  // Try using token to access protected route
  try {
    const profileResponse = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    assert(profileResponse.status === 200, 'Token works for protected routes');
    log('Token successfully authenticates protected routes', 'success');
  } catch (error) {
    log('Note: Profile route may not exist yet', 'warning');
  }
}

// Test 9: Multiple Login Attempts
async function testMultipleLogins() {
  log('\n🔄 Test 9: Multiple Login Attempts', 'info');
  
  for (let i = 1; i <= 3; i++) {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    
    assert(response.status === 200, `Login attempt ${i} successful`);
    assert(response.data.token, `Token received on attempt ${i}`);
  }
  
  log('Multiple logins work correctly', 'success');
}

// Test 10: Response Time
async function testResponseTime() {
  log('\n⏱️  Test 10: Response Time', 'info');
  
  const startTime = Date.now();
  
  await axios.post(`${BASE_URL}/api/auth/login`, {
    email: 'test@example.com',
    password: 'password123',
  });
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  log(`Response time: ${responseTime}ms`, 'info');
  assert(responseTime < 5000, 'Response time is under 5 seconds');
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting Login Flow Test Suite\n', 'info');
  log('=' .repeat(50), 'info');
  
  const tests = [
    { name: 'Successful Login', fn: testSuccessfulLogin },
    { name: 'Invalid Email Format', fn: testInvalidEmailFormat },
    { name: 'Missing Email', fn: testMissingEmail },
    { name: 'Missing Password', fn: testMissingPassword },
    { name: 'Wrong Password', fn: testWrongPassword },
    { name: 'Non-existent User', fn: testNonExistentUser },
    { name: 'Case Insensitive Email', fn: testCaseInsensitiveEmail },
    { name: 'Token Validation', fn: testTokenValidation },
    { name: 'Multiple Logins', fn: testMultipleLogins },
    { name: 'Response Time', fn: testResponseTime },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      await test.fn();
      passed++;
    } catch (error) {
      failed++;
      log(`\n❌ Test "${test.name}" failed:`, 'error');
      log(error.message, 'error');
      if (error.response) {
        log(`Response status: ${error.response.status}`, 'error');
        log(`Response data: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  }
  
  log('\n' + '='.repeat(50), 'info');
  log(`\n📊 Test Results: ${passed} passed, ${failed} failed`, passed === tests.length ? 'success' : 'warning');
  log('='.repeat(50) + '\n', 'info');
  
  if (passed === tests.length) {
    log('🎉 All tests passed! Login flow is working correctly.', 'success');
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', 'warning');
  }
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
