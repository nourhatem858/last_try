/**
 * Profile Page Test Suite
 * Tests profile data fetching, null handling, and updates
 */

const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let authToken = '';

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

// Test 1: Login
async function testLogin() {
  log('\n📝 Test 1: User Login', 'info');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    assert(response.status === 200, 'Login successful');
    assert(response.data.token, 'Auth token received');
    
    authToken = response.data.token;
  } catch (error) {
    // Try to create user if doesn't exist
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    
    authToken = response.data.token;
    log('Test user created and logged in', 'success');
  }
}

// Test 2: Fetch Profile
async function testFetchProfile() {
  log('\n👤 Test 2: Fetch Profile', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/profile`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Profile fetched successfully');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.user, 'User data returned');
  assert(response.data.user.id, 'User has ID');
  assert(response.data.user.name, 'User has name');
  assert(response.data.user.email, 'User has email');
  assert(response.data.user.role, 'User has role');
  
  // Check optional fields are handled
  assert(response.data.user.avatar !== undefined, 'Avatar field exists (can be empty)');
  assert(response.data.user.bio !== undefined, 'Bio field exists (can be empty)');
  assert(Array.isArray(response.data.user.favoriteTopics), 'Favorite topics is array');
  
  log(`Profile: ${response.data.user.name} (${response.data.user.email})`, 'info');
}

// Test 3: Fetch Profile Stats
async function testFetchStats() {
  log('\n📊 Test 3: Fetch Profile Stats', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/profile/stats`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Stats fetched successfully');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.stats, 'Stats data returned');
  assert(typeof response.data.stats.cardsViewed === 'number', 'Cards viewed is number');
  assert(typeof response.data.stats.bookmarks === 'number', 'Bookmarks is number');
  assert(typeof response.data.stats.likes === 'number', 'Likes is number');
  
  log(`Stats: ${response.data.stats.bookmarks} bookmarks`, 'info');
}

// Test 4: Fetch Profile Activity
async function testFetchActivity() {
  log('\n📋 Test 4: Fetch Profile Activity', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/profile/activity`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Activity fetched successfully');
  assert(response.data.success === true, 'Response has success flag');
  assert(Array.isArray(response.data.activities), 'Activities is array');
  
  log(`Activity: ${response.data.activities.length} items`, 'info');
}

// Test 5: Update Profile
async function testUpdateProfile() {
  log('\n✏️  Test 5: Update Profile', 'info');
  
  const updateData = {
    name: 'Updated Test User',
    bio: 'This is my updated bio',
    favoriteTopics: ['JavaScript', 'TypeScript', 'React'],
  };
  
  const response = await axios.put(`${BASE_URL}/api/profile`, updateData, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Profile updated successfully');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.user, 'Updated user data returned');
  assert(response.data.user.name === updateData.name, 'Name updated');
  assert(response.data.user.bio === updateData.bio, 'Bio updated');
  assert(response.data.user.favoriteTopics.length === 3, 'Favorite topics updated');
  
  log('Profile updated successfully', 'success');
}

// Test 6: Update Avatar
async function testUpdateAvatar() {
  log('\n🖼️  Test 6: Update Avatar', 'info');
  
  const avatarData = {
    avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  };
  
  const response = await axios.put(`${BASE_URL}/api/profile`, avatarData, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Avatar updated successfully');
  assert(response.data.success === true, 'Response has success flag');
  assert(response.data.user.avatar, 'Avatar URL returned');
  
  log('Avatar updated successfully', 'success');
}

// Test 7: Unauthorized Access
async function testUnauthorizedAccess() {
  log('\n🔒 Test 7: Unauthorized Access', 'info');
  
  try {
    await axios.get(`${BASE_URL}/api/profile`);
    assert(false, 'Should have thrown error for unauthorized access');
  } catch (error) {
    assert(error.response.status === 401, 'Returns 401 for unauthorized');
    log('Unauthorized access properly rejected', 'success');
  }
}

// Test 8: Invalid Token
async function testInvalidToken() {
  log('\n🔑 Test 8: Invalid Token', 'info');
  
  try {
    await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: 'Bearer invalid-token-12345' },
    });
    assert(false, 'Should have thrown error for invalid token');
  } catch (error) {
    assert(error.response.status === 401, 'Returns 401 for invalid token');
    log('Invalid token properly rejected', 'success');
  }
}

// Test 9: Null/Empty Profile Fields
async function testNullProfileFields() {
  log('\n🔍 Test 9: Null/Empty Profile Fields Handling', 'info');
  
  // Update with empty optional fields
  const response = await axios.put(`${BASE_URL}/api/profile`, {
    bio: '',
    favoriteTopics: [],
  }, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Profile updated with empty fields');
  assert(response.data.user.bio === '', 'Empty bio handled');
  assert(response.data.user.favoriteTopics.length === 0, 'Empty topics handled');
  
  log('Null/empty fields handled correctly', 'success');
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting Profile Page Test Suite\n', 'info');
  log('=' .repeat(50), 'info');
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Fetch Profile', fn: testFetchProfile },
    { name: 'Fetch Stats', fn: testFetchStats },
    { name: 'Fetch Activity', fn: testFetchActivity },
    { name: 'Update Profile', fn: testUpdateProfile },
    { name: 'Update Avatar', fn: testUpdateAvatar },
    { name: 'Unauthorized Access', fn: testUnauthorizedAccess },
    { name: 'Invalid Token', fn: testInvalidToken },
    { name: 'Null Profile Fields', fn: testNullProfileFields },
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
        log(`Response: ${JSON.stringify(error.response.data)}`, 'error');
      }
    }
  }
  
  log('\n' + '='.repeat(50), 'info');
  log(`\n📊 Test Results: ${passed} passed, ${failed} failed`, passed === tests.length ? 'success' : 'warning');
  log('='.repeat(50) + '\n', 'info');
  
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\n💥 Test suite crashed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
});
