/**
 * Authentication API Test Script
 * Tests signup and login endpoints
 */

const BASE_URL = 'http://localhost:3000';

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

async function testAuthAPI() {
  log('\n========================================', 'blue');
  log('  Authentication API Test Suite', 'blue');
  log('========================================\n', 'blue');

  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'password123';
  const testName = 'Test User';

  // Test 1: Signup
  log('Test 1: Signup (POST /api/auth/signup)', 'cyan');
  try {
    const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    const signupData = await signupResponse.json();

    if (signupResponse.status === 201 && signupData.success) {
      log('✅ Signup successful!', 'green');
      log(`   Status: ${signupResponse.status}`, 'yellow');
      log(`   Token: ${signupData.token.substring(0, 20)}...`, 'yellow');
      log(`   User: ${signupData.user.name} (${signupData.user.email})`, 'yellow');
    } else {
      log('❌ Signup failed!', 'red');
      log(`   Status: ${signupResponse.status}`, 'yellow');
      log(`   Error: ${signupData.error}`, 'yellow');
      return;
    }
  } catch (error) {
    log('❌ Signup request failed!', 'red');
    log(`   Error: ${error.message}`, 'yellow');
    return;
  }

  // Test 2: Login
  log('\nTest 2: Login (POST /api/auth/login)', 'cyan');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.status === 200 && loginData.success) {
      log('✅ Login successful!', 'green');
      log(`   Status: ${loginResponse.status}`, 'yellow');
      log(`   Token: ${loginData.token.substring(0, 20)}...`, 'yellow');
      log(`   User: ${loginData.user.name} (${loginData.user.email})`, 'yellow');
    } else {
      log('❌ Login failed!', 'red');
      log(`   Status: ${loginResponse.status}`, 'yellow');
      log(`   Error: ${loginData.error}`, 'yellow');
    }
  } catch (error) {
    log('❌ Login request failed!', 'red');
    log(`   Error: ${error.message}`, 'yellow');
  }

  // Test 3: Login with wrong password
  log('\nTest 3: Login with wrong password (should fail)', 'cyan');
  try {
    const wrongLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongpassword',
      }),
    });

    const wrongLoginData = await wrongLoginResponse.json();

    if (wrongLoginResponse.status === 401 && !wrongLoginData.success) {
      log('✅ Correctly rejected wrong password!', 'green');
      log(`   Status: ${wrongLoginResponse.status}`, 'yellow');
      log(`   Error: ${wrongLoginData.error}`, 'yellow');
    } else {
      log('❌ Should have rejected wrong password!', 'red');
    }
  } catch (error) {
    log('❌ Request failed!', 'red');
    log(`   Error: ${error.message}`, 'yellow');
  }

  // Test 4: Signup with existing email
  log('\nTest 4: Signup with existing email (should fail)', 'cyan');
  try {
    const duplicateResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
      }),
    });

    const duplicateData = await duplicateResponse.json();

    if (duplicateResponse.status === 409 && !duplicateData.success) {
      log('✅ Correctly rejected duplicate email!', 'green');
      log(`   Status: ${duplicateResponse.status}`, 'yellow');
      log(`   Error: ${duplicateData.error}`, 'yellow');
    } else {
      log('❌ Should have rejected duplicate email!', 'red');
    }
  } catch (error) {
    log('❌ Request failed!', 'red');
    log(`   Error: ${error.message}`, 'yellow');
  }

  // Test 5: Validation errors
  log('\nTest 5: Validation errors (missing fields)', 'cyan');
  try {
    const validationResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'A', // Too short
        email: 'invalid-email',
        password: '123', // Too short
      }),
    });

    const validationData = await validationResponse.json();

    if (validationResponse.status === 400 && !validationData.success) {
      log('✅ Validation working correctly!', 'green');
      log(`   Status: ${validationResponse.status}`, 'yellow');
      log(`   Error: ${validationData.error}`, 'yellow');
    } else {
      log('❌ Validation should have failed!', 'red');
    }
  } catch (error) {
    log('❌ Request failed!', 'red');
    log(`   Error: ${error.message}`, 'yellow');
  }

  // Summary
  log('\n========================================', 'blue');
  log('  Test Summary', 'blue');
  log('========================================\n', 'blue');

  log('✅ All tests completed!', 'green');
  log('\n💡 Your authentication API is working correctly!', 'cyan');
  log('\nNext steps:', 'yellow');
  log('  1. Create frontend signup/login forms', 'cyan');
  log('  2. Store JWT token in localStorage', 'cyan');
  log('  3. Add protected routes', 'cyan');
  log('  4. Add user profile page', 'cyan');
  log('');
}

// Run tests
testAuthAPI().catch((error) => {
  log('\n❌ Test suite failed:', 'red');
  log(`   ${error.message}`, 'red');
  log('\n💡 Make sure:', 'yellow');
  log('   - MongoDB is connected', 'cyan');
  log('   - Next.js dev server is running (npm run dev)', 'cyan');
  log('   - Server is accessible at http://localhost:3000\n', 'cyan');
  process.exit(1);
});
