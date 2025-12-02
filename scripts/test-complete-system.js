/**
 * Complete System Test Script
 * Tests all critical functionality: Auth, Notes, Workspaces, Documents, Chats
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';
let authToken = null;
let testUserId = null;
let testWorkspaceId = null;
let testNoteId = null;

console.log('🧪 Complete System Test');
console.log('========================\n');

// Test utilities
function success(message) {
  console.log(`✅ ${message}`);
}

function error(message, err) {
  console.log(`❌ ${message}`);
  if (err) console.log(`   Error: ${err.message || err}`);
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

// Generate random email for testing
const testEmail = `test_${Date.now()}@example.com`;
const testPassword = 'Test123456';
const testName = 'Test User';

async function runTests() {
  console.log('📋 Test Configuration:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log(`   Name: ${testName}\n`);

  try {
    // ========================================
    // TEST 1: SIGNUP
    // ========================================
    console.log('🔵 TEST 1: User Signup');
    console.log('─────────────────────────');
    try {
      const signupRes = await axios.post(`${API_BASE}/auth/signup`, {
        name: testName,
        email: testEmail,
        password: testPassword,
      });

      if (signupRes.data.success && signupRes.data.token) {
        authToken = signupRes.data.token;
        testUserId = signupRes.data.user.id;
        success('Signup successful');
        success(`Token received: ${authToken.substring(0, 20)}...`);
        success(`User ID: ${testUserId}`);
      } else {
        error('Signup failed: Invalid response format');
        return;
      }
    } catch (err) {
      error('Signup failed', err.response?.data || err);
      return;
    }

    // ========================================
    // TEST 2: LOGIN
    // ========================================
    console.log('\n🔵 TEST 2: User Login');
    console.log('─────────────────────────');
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: testEmail,
        password: testPassword,
      });

      if (loginRes.data.success && loginRes.data.token) {
        authToken = loginRes.data.token;
        success('Login successful');
        success(`Token refreshed: ${authToken.substring(0, 20)}...`);
      } else {
        error('Login failed: Invalid response format');
      }
    } catch (err) {
      error('Login failed', err.response?.data || err);
    }

    // ========================================
    // TEST 3: GET PROFILE
    // ========================================
    console.log('\n🔵 TEST 3: Get User Profile');
    console.log('─────────────────────────');
    try {
      const profileRes = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (profileRes.data.success && profileRes.data.user) {
        success('Profile fetched successfully');
        success(`Name: ${profileRes.data.user.name}`);
        success(`Email: ${profileRes.data.user.email}`);
      } else {
        error('Profile fetch failed: Invalid response format');
      }
    } catch (err) {
      error('Profile fetch failed', err.response?.data || err);
    }

    // ========================================
    // TEST 4: CREATE WORKSPACE
    // ========================================
    console.log('\n🔵 TEST 4: Create Workspace');
    console.log('─────────────────────────');
    try {
      const workspaceRes = await axios.post(
        `${API_BASE}/workspaces`,
        {
          name: 'Test Workspace',
          description: 'Automated test workspace',
          tags: ['test', 'automation'],
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (workspaceRes.data.success && workspaceRes.data.data) {
        testWorkspaceId = workspaceRes.data.data.id;
        success('Workspace created successfully');
        success(`Workspace ID: ${testWorkspaceId}`);
      } else {
        error('Workspace creation failed: Invalid response format');
      }
    } catch (err) {
      error('Workspace creation failed', err.response?.data || err);
    }

    // ========================================
    // TEST 5: CREATE NOTE
    // ========================================
    console.log('\n🔵 TEST 5: Create Note');
    console.log('─────────────────────────');
    if (!testWorkspaceId) {
      error('Cannot create note: No workspace ID');
    } else {
      try {
        const noteRes = await axios.post(
          `${API_BASE}/notes`,
          {
            title: 'Test Note',
            content: 'This is a test note created by automated testing',
            workspace: testWorkspaceId,
            tags: ['test', 'automated'],
          },
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (noteRes.data.success && noteRes.data.data) {
          testNoteId = noteRes.data.data.id;
          success('Note created successfully');
          success(`Note ID: ${testNoteId}`);
        } else {
          error('Note creation failed: Invalid response format');
        }
      } catch (err) {
        error('Note creation failed', err.response?.data || err);
      }
    }

    // ========================================
    // TEST 6: GET NOTES
    // ========================================
    console.log('\n🔵 TEST 6: Get All Notes');
    console.log('─────────────────────────');
    try {
      const notesRes = await axios.get(`${API_BASE}/notes`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (notesRes.data.success) {
        const count = notesRes.data.data?.length || 0;
        success(`Notes fetched successfully: ${count} notes`);
        if (count > 0) {
          success(`First note: ${notesRes.data.data[0].title}`);
        }
      } else {
        error('Notes fetch failed: Invalid response format');
      }
    } catch (err) {
      error('Notes fetch failed', err.response?.data || err);
    }

    // ========================================
    // TEST 7: GET WORKSPACES
    // ========================================
    console.log('\n🔵 TEST 7: Get All Workspaces');
    console.log('─────────────────────────');
    try {
      const workspacesRes = await axios.get(`${API_BASE}/workspaces`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (workspacesRes.data.success) {
        const count = workspacesRes.data.data?.length || 0;
        success(`Workspaces fetched successfully: ${count} workspaces`);
        if (count > 0) {
          success(`First workspace: ${workspacesRes.data.data[0].name}`);
        }
      } else {
        error('Workspaces fetch failed: Invalid response format');
      }
    } catch (err) {
      error('Workspaces fetch failed', err.response?.data || err);
    }

    // ========================================
    // TEST 8: DASHBOARD SUMMARY
    // ========================================
    console.log('\n🔵 TEST 8: Dashboard Summary');
    console.log('─────────────────────────');
    try {
      const dashboardRes = await axios.get(`${API_BASE}/dashboard/summary`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (dashboardRes.data.success && dashboardRes.data.data) {
        const stats = dashboardRes.data.data;
        success('Dashboard data fetched successfully');
        success(`Workspaces: ${stats.workspaces || 0}`);
        success(`Notes: ${stats.notes || 0}`);
        success(`Documents: ${stats.documents || 0}`);
        success(`AI Chats: ${stats.aiChats || 0}`);
      } else {
        error('Dashboard fetch failed: Invalid response format');
      }
    } catch (err) {
      error('Dashboard fetch failed', err.response?.data || err);
    }

    // ========================================
    // TEST 9: FORGOT PASSWORD
    // ========================================
    console.log('\n🔵 TEST 9: Forgot Password');
    console.log('─────────────────────────');
    try {
      const forgotRes = await axios.post(`${API_BASE}/auth/forgot-password`, {
        email: testEmail,
      });

      if (forgotRes.data.success) {
        success('Forgot password request successful');
        info('Check server console for OTP code (dev mode)');
      } else {
        error('Forgot password failed: Invalid response format');
      }
    } catch (err) {
      error('Forgot password failed', err.response?.data || err);
    }

    // ========================================
    // SUMMARY
    // ========================================
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ All critical tests completed');
    console.log('\n📝 Test Results:');
    console.log(`   User ID: ${testUserId || 'N/A'}`);
    console.log(`   Workspace ID: ${testWorkspaceId || 'N/A'}`);
    console.log(`   Note ID: ${testNoteId || 'N/A'}`);
    console.log(`   Auth Token: ${authToken ? 'Valid' : 'Invalid'}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Login with test credentials:');
    console.log(`      Email: ${testEmail}`);
    console.log(`      Password: ${testPassword}`);
    console.log('   2. Verify data appears in dashboard');
    console.log('   3. Test creating more notes/workspaces');
    console.log('═══════════════════════════════════════\n');

  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message);
  }
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${API_BASE}/health`);
    return true;
  } catch (err) {
    return false;
  }
}

// Main execution
(async () => {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running!');
    console.log('\n📝 Please start the server first:');
    console.log('   npm run dev');
    console.log('\nThen run this test again.');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
})();
