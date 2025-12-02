/**
 * Complete Signup API Test Script
 * Tests all validation, error handling, and success cases
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

async function test(name, fn) {
  try {
    log(`\n📝 Test: ${name}`, 'blue');
    const result = await fn();
    if (result) {
      log(`✅ PASS: ${name}`, 'green');
      return true;
    } else {
      log(`❌ FAIL: ${name}`, 'red');
      return false;
    }
  } catch (error) {
    log(`❌ FAIL: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testValidSignup() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Response: ${JSON.stringify(data, null, 2)}`, 'yellow');

  if (response.status !== 201) {
    throw new Error(`Expected 201, got ${response.status}`);
  }

  if (!data.success) {
    throw new Error('Response success is false');
  }

  if (!data.token) {
    throw new Error('Token not returned');
  }

  if (!data.user || !data.user.id || !data.user.name || !data.user.email) {
    throw new Error('User object incomplete');
  }

  if (data.user.role !== 'user') {
    throw new Error('Default role should be "user"');
  }

  log('   ✓ Token generated', 'cyan');
  log('   ✓ User object complete', 'cyan');
  log('   ✓ Default role set', 'cyan');

  return true;
}

async function testMissingFields() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test' }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Error: ${data.error}`, 'yellow');

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  if (data.success !== false) {
    throw new Error('Success should be false');
  }

  if (!data.error) {
    throw new Error('Error message not returned');
  }

  log('   ✓ Correctly rejected', 'cyan');

  return true;
}

async function testShortName() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'A',
      email: 'test@example.com',
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Error: ${data.error}`, 'yellow');

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  if (!data.error.includes('2 characters')) {
    throw new Error('Error message should mention 2 characters');
  }

  log('   ✓ Name validation working', 'cyan');

  return true;
}

async function testShortPassword() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345',
    }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Error: ${data.error}`, 'yellow');

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  if (!data.error.includes('6 characters')) {
    throw new Error('Error message should mention 6 characters');
  }

  log('   ✓ Password validation working', 'cyan');

  return true;
}

async function testInvalidEmail() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Error: ${data.error}`, 'yellow');

  if (response.status !== 400) {
    throw new Error(`Expected 400, got ${response.status}`);
  }

  if (!data.error.toLowerCase().includes('email')) {
    throw new Error('Error message should mention email');
  }

  log('   ✓ Email validation working', 'cyan');

  return true;
}

async function testDuplicateEmail() {
  const email = `duplicate${Date.now()}@example.com`;

  // First signup
  await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email,
      password: 'password123',
    }),
  });

  // Second signup with same email
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User',
      email,
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  log(`   Status: ${response.status}`, 'yellow');
  log(`   Error: ${data.error}`, 'yellow');

  if (response.status !== 409) {
    throw new Error(`Expected 409, got ${response.status}`);
  }

  if (!data.error.toLowerCase().includes('already')) {
    throw new Error('Error message should mention already registered');
  }

  log('   ✓ Duplicate detection working', 'cyan');

  return true;
}

async function testCORSHeaders() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'OPTIONS',
  });

  log(`   Status: ${response.status}`, 'yellow');
  log(`   CORS Headers:`, 'yellow');
  log(`     Access-Control-Allow-Origin: ${response.headers.get('Access-Control-Allow-Origin')}`, 'yellow');
  log(`     Access-Control-Allow-Methods: ${response.headers.get('Access-Control-Allow-Methods')}`, 'yellow');

  if (response.status !== 200) {
    throw new Error(`Expected 200, got ${response.status}`);
  }

  const allowOrigin = response.headers.get('Access-Control-Allow-Origin');
  if (!allowOrigin) {
    throw new Error('CORS headers not set');
  }

  log('   ✓ CORS configured', 'cyan');

  return true;
}

async function testJWTToken() {
  const response = await fetch(`${BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'JWT Test User',
      email: `jwt${Date.now()}@example.com`,
      password: 'password123',
    }),
  });

  const data = await response.json();
  
  if (!data.token) {
    throw new Error('Token not returned');
  }

  // Decode JWT (without verification)
  const parts = data.token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  
  log(`   Token payload:`, 'yellow');
  log(`     id: ${payload.id}`, 'yellow');
  log(`     email: ${payload.email}`, 'yellow');
  log(`     role: ${payload.role}`, 'yellow');
  log(`     exp: ${new Date(payload.exp * 1000).toISOString()}`, 'yellow');

  if (!payload.id || !payload.email || !payload.role) {
    throw new Error('JWT payload incomplete');
  }

  // Check expiry (should be ~7 days)
  const expiryDate = new Date(payload.exp * 1000);
  const now = new Date();
  const daysDiff = (expiryDate - now) / (1000 * 60 * 60 * 24);
  
  if (daysDiff < 6.9 || daysDiff > 7.1) {
    throw new Error(`JWT expiry should be 7 days, got ${daysDiff.toFixed(2)} days`);
  }

  log('   ✓ JWT format valid', 'cyan');
  log('   ✓ JWT payload complete', 'cyan');
  log('   ✓ JWT expiry correct (7 days)', 'cyan');

  return true;
}

async function runTests() {
  log('\n========================================', 'blue');
  log('  Complete Signup API Test Suite', 'blue');
  log('========================================', 'blue');

  log('\n📋 Prerequisites:', 'yellow');
  log('   - MongoDB running (mongod)', 'yellow');
  log('   - Next.js dev server running (npm run dev)', 'yellow');
  log('   - Server at http://localhost:3000', 'yellow');

  const results = [];

  // Run all tests
  results.push(await test('Valid signup', testValidSignup));
  results.push(await test('Missing fields', testMissingFields));
  results.push(await test('Short name (< 2 chars)', testShortName));
  results.push(await test('Short password (< 6 chars)', testShortPassword));
  results.push(await test('Invalid email format', testInvalidEmail));
  results.push(await test('Duplicate email (409)', testDuplicateEmail));
  results.push(await test('CORS headers', testCORSHeaders));
  results.push(await test('JWT token generation', testJWTToken));

  // Summary
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  log('\n========================================', 'blue');
  log('  Test Summary', 'blue');
  log('========================================', 'blue');
  log(`\n✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');
  log(`📊 Total: ${results.length}`, 'cyan');

  if (failed === 0) {
    log('\n🎉 All tests passed! Signup API is working perfectly!\n', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above.\n', 'yellow');
  }
}

// Run tests
runTests().catch((error) => {
  log('\n❌ Test suite failed:', 'red');
  log(`   ${error.message}`, 'red');
  log('\n💡 Make sure:', 'yellow');
  log('   - MongoDB is running (mongod)', 'yellow');
  log('   - Next.js dev server is running (npm run dev)', 'yellow');
  log('   - Server is accessible at http://localhost:3000\n', 'yellow');
  process.exit(1);
});
