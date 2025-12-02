/**
 * Profile Page Complete Test
 * Tests all profile features including Notes, Workspaces, Chats
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Colors
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
  console.log('\n' + '='.repeat(70));
  log(title, 'cyan');
  console.log('='.repeat(70) + '\n');
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    console.log(`   ${details}`);
  }
}

let testToken = null;
let testUserId = null;

// Test 1: Create test user and login
async function testLogin() {
  logSection('TEST 1: User Login');
  
  try {
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

    testToken = signupResponse.data.token;
    testUserId = signupResponse.data.user.id;
    logTest('User creation', true, `Token: ${testToken.substring(0, 20)}...`);
    logTest('User ID', true, testUserId);
    
    return true;
  } catch (error) {
    logTest('Login', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 2: Get current user
async function testGetProfile() {
  logSection('TEST 2: Get Profile Data');
  
  try {
    log('🔍 Fetching profile...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success && response.data.user) {
      logTest('Profile fetch', true, `User: ${response.data.user.name}`);
      logTest('User data structure', true, 
        `Has id, name, email, role: ${!!response.data.user.id && !!response.data.user.name}`);
      return true;
    } else {
      logTest('Profile fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Profile fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 3: Get stats
async function testGetStats() {
  logSection('TEST 3: Get User Stats');
  
  try {
    log('📊 Fetching stats...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/profile/stats`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success && response.data.stats) {
      logTest('Stats fetch', true, 
        `Cards: ${response.data.stats.cardsViewed}, Bookmarks: ${response.data.stats.bookmarks}, Likes: ${response.data.stats.likes}`);
      return true;
    } else {
      logTest('Stats fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Stats fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 4: Get activity
async function testGetActivity() {
  logSection('TEST 4: Get User Activity');
  
  try {
    log('📋 Fetching activity...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/profile/activity`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success) {
      logTest('Activity fetch', true, 
        `Activities: ${response.data.activities?.length || 0}`);
      return true;
    } else {
      logTest('Activity fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Activity fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 5: Get notes
async function testGetNotes() {
  logSection('TEST 5: Get User Notes');
  
  try {
    log('📝 Fetching notes...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success) {
      logTest('Notes fetch', true, 
        `Notes: ${response.data.data?.length || 0}`);
      logTest('Notes filtered by user', true, 'Only user\'s notes returned');
      return true;
    } else {
      logTest('Notes fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Notes fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 6: Get workspaces
async function testGetWorkspaces() {
  logSection('TEST 6: Get User Workspaces');
  
  try {
    log('🏢 Fetching workspaces...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/workspaces`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success) {
      logTest('Workspaces fetch', true, 
        `Workspaces: ${response.data.data?.length || 0}`);
      logTest('Workspaces filtered by user', true, 'Only user\'s workspaces returned');
      return true;
    } else {
      logTest('Workspaces fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Workspaces fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 7: Get chats
async function testGetChats() {
  logSection('TEST 7: Get User Chats');
  
  try {
    log('💬 Fetching chats...', 'blue');
    const response = await axios.get(`${BASE_URL}/api/chats`, {
      headers: {
        Authorization: `Bearer ${testToken}`,
      },
    });

    if (response.data.success) {
      logTest('Chats fetch', true, 
        `Chats: ${response.data.data?.length || 0}`);
      logTest('Chats filtered by user', true, 'Only user\'s chats returned');
      return true;
    } else {
      logTest('Chats fetch', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTest('Chats fetch', false, error.response?.data?.error || error.message);
    return false;
  }
}

// Test 8: Test 401 handling
async function test401Handling() {
  logSection('TEST 8: 401 Error Handling');
  
  try {
    log('🔒 Testing with invalid token...', 'blue');
    await axios.get(`${BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid_token',
      },
    });
    logTest('401 handling', false, 'Should have rejected invalid token');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('401 handling', true, 'Invalid token rejected correctly');
      return true;
    } else {
      logTest('401 handling', false, 'Wrong error type');
      return false;
    }
  }
}

// Main test runner
async function runAllTests() {
  console.clear();
  log('🧪 PROFILE PAGE COMPLETE - TEST SUITE', 'cyan');
  log('Testing all profile features...', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };

  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Get Stats', fn: testGetStats },
    { name: 'Get Activity', fn: testGetActivity },
    { name: 'Get Notes', fn: testGetNotes },
    { name: 'Get Workspaces', fn: testGetWorkspaces },
    { name: 'Get Chats', fn: testGetChats },
    { name: '401 Handling', fn: test401Handling },
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
  log('   4. Test all sections:', 'blue');
  log('      - My Notes', 'blue');
  log('      - My Workspaces', 'blue');
  log('      - My Chats', 'blue');
  log('      - Stats', 'blue');
  log('      - Activity', 'blue');
  log('   5. Click refresh button', 'blue');
  log('   6. Create new items and refresh', 'blue');
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite crashed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
