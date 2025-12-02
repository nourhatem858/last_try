/**
 * Supercharged System Test Suite
 * Comprehensive automated testing for Knowledge Workspace
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
  name: 'Test User',
  email: `test${Date.now()}@example.com`,
  password: 'Test123!@#'
};

let authToken = null;
let testResults = {
  timestamp: new Date().toISOString(),
  totalTests: 0,
  passed: 0,
  failed: 0,
  weakPoints: [],
  strengths: [],
  recommendations: [],
  testDetails: []
};

// Test runner
async function runTest(name, category, testFn) {
  const startTime = Date.now();
  testResults.totalTests++;
  
  try {
    await testFn();
    const duration = Date.now() - startTime;
    testResults.passed++;
    testResults.testDetails.push({
      name,
      category,
      status: 'PASSED',
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    console.log(`✅ ${name} - PASSED (${duration}ms)`);
    return true;
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    testResults.testDetails.push({
      name,
      category,
      status: 'FAILED',
      error: error.message,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString()
    });
    console.error(`❌ ${name} - FAILED: ${error.message}`);
    testResults.weakPoints.push(`${category}: ${name} - ${error.message}`);
    return false;
  }
}

// Authentication Tests
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...');
  
  await runTest('Signup API', 'Authentication', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/signup`, TEST_USER);
    if (!response.data.success || !response.data.token) {
      throw new Error('Signup failed or no token returned');
    }
    authToken = response.data.token;
  });

  await runTest('Login API', 'Authentication', async () => {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    if (!response.data.success || !response.data.token) {
      throw new Error('Login failed or no token returned');
    }
  });

  await runTest('Protected Route Access', 'Authentication', async () => {
    const response = await axios.get(`${BASE_URL}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (response.status !== 200) {
      throw new Error('Cannot access protected route with valid token');
    }
  });
}

// Dashboard Tests
async function testDashboard() {
  console.log('\n📊 Testing Dashboard...');
  
  await runTest('Dashboard Summary API', 'Dashboard', async () => {
    const response = await axios.get(`${BASE_URL}/api/dashboard/summary`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.data) {
      throw new Error('Dashboard summary data missing');
    }
  });
}

// Workspaces Tests
async function testWorkspaces() {
  console.log('\n🗂️ Testing Workspaces...');
  
  let workspaceId = null;
  
  await runTest('Create Workspace', 'Workspaces', async () => {
    const response = await axios.post(`${BASE_URL}/api/workspaces`, {
      name: 'Test Workspace',
      description: 'Automated test workspace',
      color: '#3B82F6'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Workspace creation failed');
    }
    workspaceId = response.data.data.id;
  });

  await runTest('List Workspaces', 'Workspaces', async () => {
    const response = await axios.get(`${BASE_URL}/api/workspaces`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data.data)) {
      throw new Error('Workspaces list not returned as array');
    }
  });

  if (workspaceId) {
    await runTest('Get Workspace Details', 'Workspaces', async () => {
      const response = await axios.get(`${BASE_URL}/api/workspaces/${workspaceId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.data.data) {
        throw new Error('Workspace details not found');
      }
    });
  }
}

// Notes Tests
async function testNotes() {
  console.log('\n📝 Testing Notes...');
  
  let noteId = null;
  
  await runTest('Create Note', 'Notes', async () => {
    const response = await axios.post(`${BASE_URL}/api/notes`, {
      title: 'Test Note',
      content: 'This is a test note content',
      tags: ['test', 'automated'],
      workspaceId: 'default'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Note creation failed');
    }
    noteId = response.data.data.id;
  });

  await runTest('List Notes', 'Notes', async () => {
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data.data)) {
      throw new Error('Notes list not returned as array');
    }
  });

  if (noteId) {
    await runTest('Get Note Details', 'Notes', async () => {
      const response = await axios.get(`${BASE_URL}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.data.data) {
        throw new Error('Note details not found');
      }
    });

    await runTest('Update Note', 'Notes', async () => {
      const response = await axios.put(`${BASE_URL}/api/notes/${noteId}`, {
        title: 'Updated Test Note',
        content: 'Updated content'
      }, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (!response.data.success) {
        throw new Error('Note update failed');
      }
    });
  }
}

// Documents Tests
async function testDocuments() {
  console.log('\n📄 Testing Documents...');
  
  await runTest('List Documents', 'Documents', async () => {
    const response = await axios.get(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data.data)) {
      throw new Error('Documents list not returned as array');
    }
  });
}

// Search Tests
async function testSearch() {
  console.log('\n🔍 Testing Search...');
  
  await runTest('Search All Categories', 'Search', async () => {
    const response = await axios.get(`${BASE_URL}/api/search?q=test`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.data) {
      throw new Error('Search results not returned');
    }
  });

  await runTest('Search Notes', 'Search', async () => {
    const response = await axios.get(`${BASE_URL}/api/search?q=test&category=notes`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.data) {
      throw new Error('Note search results not returned');
    }
  });
}

// AI Tests
async function testAI() {
  console.log('\n🤖 Testing AI Features...');
  
  await runTest('AI Ask Question', 'AI', async () => {
    const response = await axios.post(`${BASE_URL}/api/ai/ask`, {
      question: 'What is this workspace about?',
      context: 'test workspace'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.data || !response.data.data.answer) {
      throw new Error('AI response not generated');
    }
  });
}

// Chat Tests
async function testChat() {
  console.log('\n💬 Testing Chat...');
  
  let chatId = null;
  
  await runTest('Create Chat', 'Chat', async () => {
    const response = await axios.post(`${BASE_URL}/api/chats`, {
      title: 'Test Chat',
      workspaceId: 'default'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success || !response.data.data.id) {
      throw new Error('Chat creation failed');
    }
    chatId = response.data.data.id;
  });

  await runTest('List Chats', 'Chat', async () => {
    const response = await axios.get(`${BASE_URL}/api/chats`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data.data)) {
      throw new Error('Chats list not returned as array');
    }
  });
}

// Members Tests
async function testMembers() {
  console.log('\n👥 Testing Members...');
  
  await runTest('List Members', 'Members', async () => {
    const response = await axios.get(`${BASE_URL}/api/members`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!Array.isArray(response.data.data)) {
      throw new Error('Members list not returned as array');
    }
  });
}

// Generate Report
function generateReport() {
  const confidenceScore = Math.round((testResults.passed / testResults.totalTests) * 100);
  
  // Identify strengths
  const categoryStats = {};
  testResults.testDetails.forEach(test => {
    if (!categoryStats[test.category]) {
      categoryStats[test.category] = { passed: 0, total: 0 };
    }
    categoryStats[test.category].total++;
    if (test.status === 'PASSED') {
      categoryStats[test.category].passed++;
    }
  });

  Object.entries(categoryStats).forEach(([category, stats]) => {
    if (stats.passed === stats.total) {
      testResults.strengths.push(`${category}: All tests passed (${stats.total}/${stats.total})`);
    }
  });

  // Generate recommendations
  if (testResults.failed > 0) {
    testResults.recommendations.push('Fix failing API endpoints before production deployment');
  }
  if (confidenceScore < 80) {
    testResults.recommendations.push('Improve test coverage and fix critical issues');
  }
  if (testResults.weakPoints.length > 0) {
    testResults.recommendations.push('Address weak points identified in testing');
  }
  
  testResults.recommendations.push('Implement real-time collaboration features');
  testResults.recommendations.push('Add AI-powered content suggestions');
  testResults.recommendations.push('Enhance search with fuzzy matching and synonyms');
  testResults.recommendations.push('Add analytics dashboard for user insights');
  testResults.recommendations.push('Implement document preview and annotation');

  const report = {
    ...testResults,
    confidenceScore,
    summary: {
      total: testResults.totalTests,
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: `${confidenceScore}%`
    }
  };

  return report;
}

// Main execution
async function main() {
  console.log('🚀 Starting Supercharged System Tests...\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Test User: ${TEST_USER.email}\n`);

  try {
    await testAuthentication();
    await testDashboard();
    await testWorkspaces();
    await testNotes();
    await testDocuments();
    await testSearch();
    await testAI();
    await testChat();
    await testMembers();

    const report = generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} ✅`);
    console.log(`Failed: ${report.summary.failed} ❌`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`Confidence Score: ${report.confidenceScore}/100`);
    console.log('='.repeat(60));

    // Save report
    const fs = require('fs');
    fs.writeFileSync(
      'SUPERCHARGED_PROJECT_REPORT.json',
      JSON.stringify(report, null, 2)
    );
    console.log('\n✅ Report saved to SUPERCHARGED_PROJECT_REPORT.json');

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
