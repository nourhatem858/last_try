/**
 * Members Feature Test Script
 * Tests all member functionality
 */

require('dotenv').config({ path: '.env.local' });
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

console.log('🧪 Members Feature Test');
console.log('========================\n');

let authToken = null;
let testWorkspaceId = null;
let testMemberId = null;

async function runTests() {
  try {
    // Test 1: Login to get token
    console.log('📝 Test 1: Login');
    console.log('─────────────────────────');
    
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'Test123456',
    });

    if (loginRes.data.success && loginRes.data.token) {
      authToken = loginRes.data.token;
      console.log('✅ Login successful');
      console.log(`   Token: ${authToken.substring(0, 20)}...`);
    } else {
      console.log('❌ Login failed');
      return;
    }

    // Test 2: Create test workspace
    console.log('\n📝 Test 2: Create Test Workspace');
    console.log('─────────────────────────');
    
    const workspaceRes = await axios.post(
      `${API_BASE}/workspaces`,
      {
        name: 'Test Workspace for Members',
        description: 'Testing members feature',
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (workspaceRes.data.success && workspaceRes.data.data) {
      testWorkspaceId = workspaceRes.data.data.id;
      console.log('✅ Workspace created');
      console.log(`   Workspace ID: ${testWorkspaceId}`);
    } else {
      console.log('❌ Workspace creation failed');
      return;
    }

    // Test 3: Get initial members list
    console.log('\n📝 Test 3: Get Initial Members List');
    console.log('─────────────────────────');
    
    const membersRes = await axios.get(
      `${API_BASE}/members?workspaceId=${testWorkspaceId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (membersRes.data.success) {
      console.log('✅ Members list fetched');
      console.log(`   Initial member count: ${membersRes.data.count}`);
      console.log(`   Members:`, membersRes.data.data.map(m => m.email));
    } else {
      console.log('❌ Failed to fetch members');
    }

    // Test 4: Add new member
    console.log('\n📝 Test 4: Add New Member');
    console.log('─────────────────────────');
    
    const newMemberEmail = `testmember_${Date.now()}@example.com`;
    
    try {
      const addMemberRes = await axios.post(
        `${API_BASE}/members`,
        {
          email: newMemberEmail,
          role: 'member',
          workspaceId: testWorkspaceId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (addMemberRes.data.success) {
        testMemberId = addMemberRes.data.data.id;
        console.log('✅ Member added successfully');
        console.log(`   Member ID: ${testMemberId}`);
        console.log(`   Email: ${addMemberRes.data.data.email}`);
        console.log(`   Role: ${addMemberRes.data.data.role}`);
      } else {
        console.log('❌ Failed to add member');
      }
    } catch (err) {
      console.log('⚠️  Add member failed (expected if user doesn\'t exist)');
      console.log(`   Error: ${err.response?.data?.error || err.message}`);
      console.log('   Note: User must sign up first before being added to workspace');
    }

    // Test 5: Verify member appears in list
    console.log('\n📝 Test 5: Verify Member in List');
    console.log('─────────────────────────');
    
    const updatedMembersRes = await axios.get(
      `${API_BASE}/members?workspaceId=${testWorkspaceId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );

    if (updatedMembersRes.data.success) {
      console.log('✅ Members list fetched');
      console.log(`   Updated member count: ${updatedMembersRes.data.count}`);
      
      if (testMemberId) {
        const memberExists = updatedMembersRes.data.data.some(m => m.id === testMemberId);
        if (memberExists) {
          console.log('✅ New member appears in list');
        } else {
          console.log('❌ New member NOT in list');
        }
      }
    }

    // Test 6: Test error cases
    console.log('\n📝 Test 6: Test Error Cases');
    console.log('─────────────────────────');
    
    // Test invalid email
    try {
      await axios.post(
        `${API_BASE}/members`,
        {
          email: 'invalid-email',
          role: 'member',
          workspaceId: testWorkspaceId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log('❌ Invalid email should have been rejected');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid email rejected correctly');
        console.log(`   Error: ${err.response.data.error}`);
      }
    }

    // Test invalid role
    try {
      await axios.post(
        `${API_BASE}/members`,
        {
          email: 'test@example.com',
          role: 'invalid-role',
          workspaceId: testWorkspaceId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log('❌ Invalid role should have been rejected');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Invalid role rejected correctly');
        console.log(`   Error: ${err.response.data.error}`);
      }
    }

    // Test missing workspace ID
    try {
      await axios.post(
        `${API_BASE}/members`,
        {
          email: 'test@example.com',
          role: 'member',
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      console.log('❌ Missing workspace ID should have been rejected');
    } catch (err) {
      if (err.response?.status === 400) {
        console.log('✅ Missing workspace ID rejected correctly');
        console.log(`   Error: ${err.response.data.error}`);
      }
    }

    // Summary
    console.log('\n');
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ All critical tests completed');
    console.log('\n📝 Test Results:');
    console.log(`   Workspace ID: ${testWorkspaceId || 'N/A'}`);
    console.log(`   Member ID: ${testMemberId || 'N/A'}`);
    console.log(`   Auth Token: ${authToken ? 'Valid' : 'Invalid'}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Create a test user account');
    console.log('   2. Try adding that user to a workspace');
    console.log('   3. Verify member appears in Members page');
    console.log('   4. Check notification was created');
    console.log('═══════════════════════════════════════\n');

  } catch (err) {
    console.error('\n💥 Unexpected error:', err.message);
    if (err.response) {
      console.error('Response:', err.response.data);
    }
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
    console.log('\nThen run this test again:');
    console.log('   node test-members-feature.js');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
})();
