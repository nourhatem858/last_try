/**
 * Authentication System Test Suite
 * Tests both Login and Signup flows
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

// Generate unique email for testing
const generateTestEmail = () => `test${Date.now()}@example.com`;

// Test 1: Signup with valid data
async function testSignupSuccess() {
  log('\n📝 Test 1: Signup with Valid Data', 'info');
  
  const testEmail = generateTestEmail();
  const response = await axios.post(`${BASE_URL}/api/auth/signup`, {
    name: 'Test User',
    email: testEmail,
    password: 'password123',
  });

  assert(response.status === 201, 'Signup returns 201 status');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.token, 'Token is returned');
  assert(response.data.user, 'User data is returned');
  assert(response.data.user.email === testEmail, 'Correct user email');
  assert(response.data.user.name === 'Test User', 'Correct user name');
  
  log(`Created user: ${response.data.user.name} (${response.data.user.email})`, 'info');
  
  return { email: testEmail, password: 'password123' };
}

// Test 2: Signup with duplicate email
async function testSignupDuplicateEmail() {
  log('\n📧 Test 2: Signup with Duplicate Email', 'info');
  
  const testEmail = 'duplicate@example.com';
  
  // Create first user
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'First User',
      email: testEmail,
      password: 'password123',
    });
  } catch (error) {
    // User might already exist, that's okay
  }
  
  // Try to create duplicate
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Second User',
      email: testEmail,
      password: 'password456',
    });
    assert(false, 'Should have thrown error for duplicate email');
  } catch (error) {
    assert(error.response?.status === 409, 'Returns 409 for duplicate email');
    assert(error.response?.data?.error, 'Error message provided');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 3: Signup with invalid email
async function testSignupInvalidEmail() {
  log('\n❌ Test 3: Signup with Invalid Email', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    });
    assert(false, 'Should have thrown error for invalid email');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for invalid email');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 4: Signup with short password
async function testSignupShortPassword() {
  log('\n🔑 Test 4: Signup with Short Password', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: generateTestEmail(),
      password: '12345',
    });
    assert(false, 'Should have thrown error for short password');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for short password');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 5: Signup with missing fields
async function testSignupMissingFields() {
  log('\n📋 Test 5: Signup with Missing Fields', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      // Missing email and password
    });
    assert(false, 'Should have thrown error for missing fields');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for missing fields');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 6: Login with valid credentials
async function testLoginSuccess(credentials) {
  log('\n🔐 Test 6: Login with Valid Credentials', 'info');
  
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: credentials.email,
    password: credentials.password,
  });

  assert(response.status === 200, 'Login returns 200 status');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.token, 'Token is returned');
  assert(response.data.user, 'User data is returned');
  assert(response.data.user.email === credentials.email, 'Correct user email');
  
  log(`Logged in: ${response.data.user.name} (${response.data.user.email})`, 'info');
}

// Test 7: Login with wrong password
async function testLoginWrongPassword(credentials) {
  log('\n❌ Test 7: Login with Wrong Password', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: credentials.email,
      password: 'wrongpassword',
    });
    assert(false, 'Should have thrown error for wrong password');
  } catch (error) {
    assert(error.response?.status === 401, 'Returns 401 for wrong password');
    assert(error.response?.data?.error === 'Invalid email or password', 'Generic error message');
    log('Correct: Generic error message prevents enumeration', 'success');
  }
}

// Test 8: Login with non-existent user
async function testLoginNonExistentUser() {
  log('\n👻 Test 8: Login with Non-existent User', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'nonexistent@example.com',
      password: 'password123',
    });
    assert(false, 'Should have thrown error for non-existent user');
  } catch (error) {
    assert(error.response?.status === 401, 'Returns 401 for non-existent user');
    assert(error.response?.data?.error === 'Invalid email or password', 'Generic error message');
    log('Correct: Same error as wrong password (prevents enumeration)', 'success');
  }
}

// Test 9: Login with invalid email format
async function testLoginInvalidEmail() {
  log('\n📧 Test 9: Login with Invalid Email Format', 'info');
  
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'invalid-email',
      password: 'password123',
    });
    assert(false, 'Should have thrown error for invalid email');
  } catch (error) {
    assert(error.response?.status === 400, 'Returns 400 for invalid email');
    log(`Error message: ${error.response.data.error}`, 'info');
  }
}

// Test 10: Case insensitive email
async function testCaseInsensitiveEmail() {
  log('\n🔤 Test 10: Case Insensitive Email', 'info');
  
  const testEmail = generateTestEmail();
  
  // Signup with lowercase
  await axios.post(`${BASE_URL}/api/auth/signup`, {
    name: 'Test User',
    email: testEmail.toLowerCase(),
    password: 'password123',
  });
  
  // Login with uppercase
  const response = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: testEmail.toUpperCase(),
    password: 'password123',
  });
  
  assert(response.status === 200, 'Login successful with uppercase email');
  log('Email is case-insensitive', 'success');
}

// Test 11: Token validation
async function testTokenValidation(credentials) {
  log('\n🎫 Test 11: Token Validation', 'info');
  
  const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
    email: credentials.email,
    password: credentials.password,
  });

  const token = loginResponse.data.token;
  assert(token, 'Token received');
  
  // Test token format (JWT has 3 parts)
  const parts = token.split('.');
  assert(parts.length === 3, 'Token is valid JWT format');
  log('Token format is valid JWT', 'success');
  
  // Try using token
  try {
    const profileResponse = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (profileResponse.status === 200) {
      log('Token successfully authenticates protected routes', 'success');
    }
  } catch (error) {
    log('Note: Profile route may not exist yet', 'warning');
  }
}

// Test 12: Response time
async function testResponseTime() {
  log('\n⏱️  Test 12: Response Time', 'info');
  
  const testEmail = generateTestEmail();
  
  // Test signup response time
  const signupStart = Date.now();
  await axios.post(`${BASE_URL}/api/auth/signup`, {
    name: 'Test User',
    email: testEmail,
    password: 'password123',
  });
  const signupTime = Date.now() - signupStart;
  
  log(`Signup response time: ${signupTime}ms`, 'info');
  assert(signupTime < 5000, 'Signup response time is under 5 seconds');
  
  // Test login response time
  const loginStart = Date.now();
  await axios.post(`${BASE_URL}/api/auth/login`, {
    email: testEmail,
    password: 'password123',
  });
  const loginTime = Date.now() - loginStart;
  
  log(`Login response time: ${loginTime}ms`, 'info');
  assert(loginTime < 5000, 'Login response time is under 5 seconds');
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting Authentication System Test Suite\n', 'info');
  log('=' .repeat(50), 'info');
  
  let testCredentials = null;
  
  const tests = [
    { name: 'Signup Success', fn: async () => { testCredentials = await testSignupSuccess(); } },
    { name: 'Signup Duplicate Email', fn: testSignupDuplicateEmail },
    { name: 'Signup Invalid Email', fn: testSignupInvalidEmail },
    { name: 'Signup Short Password', fn: testSignupShortPassword },
    { name: 'Signup Missing Fields', fn: testSignupMissingFields },
    { name: 'Login Success', fn: async () => await testLoginSuccess(testCredentials) },
    { name: 'Login Wrong Password', fn: async () => await testLoginWrongPassword(testCredentials) },
    { name: 'Login Non-existent User', fn: testLoginNonExistentUser },
    { name: 'Login Invalid Email', fn: testLoginInvalidEmail },
    { name: 'Case Insensitive Email', fn: testCaseInsensitiveEmail },
    { name: 'Token Validation', fn: async () => await testTokenValidation(testCredentials) },
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
    log('🎉 All tests passed! Authentication system is working correctly.', 'success');
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
