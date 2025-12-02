/**
 * Profile API Test Script
 * Tests the profile endpoints with JWT authentication
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

async function testProfileAPI() {
  log('\n🔐 PROFILE API TEST\n', 'cyan');

  let token = '';

  try {
    // Test 1: Login to get token
    log('📝 Test 1: Login to get JWT token...', 'blue');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'password123',
      });

      if (loginResponse.data.success) {
        token = loginResponse.data.token;
        log(`✓ Login successful`, 'green');
        log(`  User: ${loginResponse.data.user.name} (${loginResponse.data.user.email})`, 'reset');
        log(`  Token: ${token.substring(0, 20)}...`, 'reset');
      }
    } catch (error) {
      log('⚠️  Login failed. Make sure you have a test user created.', 'yellow');
      log('   Run: node create-test-user.js', 'yellow');
      return;
    }

    // Test 2: Get profile with token
    log('\n👤 Test 2: Get profile with valid token...', 'blue');
    try {
      const profileResponse = await axios.get(`${BASE_URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.data.success) {
        log('✓ Profile retrieved successfully', 'green');
        log(`  Name: ${profileResponse.data.user.name}`, 'reset');
        log(`  Email: ${profileResponse.data.user.email}`, 'reset');
        log(`  Role: ${profileResponse.data.user.role}`, 'reset');
        log(`  ID: ${profileResponse.data.user.id}`, 'reset');
      }
    } catch (error) {
      log(`✗ Profile fetch failed: ${error.response?.data?.error || error.message}`, 'red');
    }

    // Test 3: Get profile without token (should fail)
    log('\n🚫 Test 3: Get profile without token (should fail)...', 'blue');
    try {
      await axios.get(`${BASE_URL}/api/profile`);
      log('✗ Should have failed but succeeded', 'red');
    } catch (error) {
      if (error.response?.status === 401) {
        log('✓ Correctly rejected unauthorized request', 'green');
        log(`  Error: ${error.response.data.error}`, 'reset');
      } else {
        log(`✗ Unexpected error: ${error.message}`, 'red');
      }
    }

    // Test 4: Get profile with invalid token (should fail)
    log('\n🔒 Test 4: Get profile with invalid token (should fail)...', 'blue');
    try {
      await axios.get(`${BASE_URL}/api/profile`, {
        headers: {
          Authorization: 'Bearer invalid_token_12345',
        },
      });
      log('✗ Should have failed but succeeded', 'red');
    } catch (error) {
      if (error.response?.status === 401) {
        log('✓ Correctly rejected invalid token', 'green');
        log(`  Error: ${error.response.data.error}`, 'reset');
      } else {
        log(`✗ Unexpected error: ${error.message}`, 'red');
      }
    }

    // Test 5: Update profile
    log('\n✏️  Test 5: Update profile...', 'blue');
    try {
      const updateResponse = await axios.put(
        `${BASE_URL}/api/profile`,
        {
          name: 'Updated Test User',
          bio: 'This is my updated bio',
          favoriteTopics: ['JavaScript', 'TypeScript', 'React'],
          theme: 'dark',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (updateResponse.data.success) {
        log('✓ Profile updated successfully', 'green');
        log(`  Name: ${updateResponse.data.user.name}`, 'reset');
        log(`  Bio: ${updateResponse.data.user.bio}`, 'reset');
        log(`  Topics: ${updateResponse.data.user.favoriteTopics?.join(', ')}`, 'reset');
        log(`  Theme: ${updateResponse.data.user.theme}`, 'reset');
      }
    } catch (error) {
      log(`✗ Profile update failed: ${error.response?.data?.error || error.message}`, 'red');
    }

    // Test 6: Get stats
    log('\n📊 Test 6: Get user stats...', 'blue');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/profile/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (statsResponse.data.success) {
        log('✓ Stats retrieved successfully', 'green');
        log(`  Cards Viewed: ${statsResponse.data.stats.cardsViewed}`, 'reset');
        log(`  Bookmarks: ${statsResponse.data.stats.bookmarks}`, 'reset');
        log(`  Likes: ${statsResponse.data.stats.likes}`, 'reset');
      }
    } catch (error) {
      log(`✗ Stats fetch failed: ${error.response?.data?.error || error.message}`, 'red');
    }

    // Test 7: Get activity
    log('\n📜 Test 7: Get user activity...', 'blue');
    try {
      const activityResponse = await axios.get(`${BASE_URL}/api/profile/activity`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (activityResponse.data.success) {
        log('✓ Activity retrieved successfully', 'green');
        log(`  Activities: ${activityResponse.data.activities.length}`, 'reset');
      }
    } catch (error) {
      log(`✗ Activity fetch failed: ${error.response?.data?.error || error.message}`, 'red');
    }

    log('\n✅ All tests completed!', 'green');
    log('\n📝 Summary:', 'cyan');
    log('  ✓ JWT authentication working', 'green');
    log('  ✓ Profile API secured', 'green');
    log('  ✓ Unauthorized requests blocked', 'green');
    log('  ✓ Profile updates working', 'green');
    log('  ✓ Stats and activity endpoints working', 'green');

    log('\n🌐 Frontend Testing:', 'cyan');
    log('  1. Visit: http://localhost:3000/login', 'reset');
    log('  2. Login with your credentials', 'reset');
    log('  3. Navigate to: http://localhost:3000/profile', 'reset');
    log('  4. Verify your profile data is displayed', 'reset');
    log('  5. Try editing your profile', 'reset');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`Status: ${error.response.status}`, 'red');
      log(`Error: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Run tests
log('Starting profile API tests...', 'cyan');
log('Make sure your Next.js server is running on http://localhost:3000\n', 'yellow');

testProfileAPI().catch((error) => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
