/**
 * Test Signup API - Run this to test the signup endpoint
 * Usage: node test-signup-api.js
 */

const testSignup = async () => {
  const API_URL = 'http://localhost:3000/api/auth/signup';

  console.log('🧪 Testing Signup API...\n');

  // Test 1: Valid signup
  console.log('Test 1: Valid signup');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(data.success ? '✅ PASS\n' : '❌ FAIL\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('❌ FAIL\n');
  }

  // Test 2: Missing fields
  console.log('Test 2: Missing fields');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: '',
        password: '',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✅ PASS\n' : '❌ FAIL\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('❌ FAIL\n');
  }

  // Test 3: Invalid email
  console.log('Test 3: Invalid email');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✅ PASS\n' : '❌ FAIL\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('❌ FAIL\n');
  }

  // Test 4: Short password
  console.log('Test 4: Short password');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      }),
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✅ PASS\n' : '❌ FAIL\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('❌ FAIL\n');
  }

  console.log('🎉 Tests complete!');
};

testSignup();
