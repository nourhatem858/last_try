/**
 * Data Consistency Test Suite
 * Tests dashboard counts, document persistence, and resource linking
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
let authToken = '';
let testWorkspaceId = '';
let testDocumentId = '';
let testNoteId = '';
let testChatId = '';

// Test utilities
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

// Test 1: Login and get auth token
async function testLogin() {
  log('\n📝 Test 1: User Login', 'info');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });

    assert(response.status === 200, 'Login successful');
    assert(response.data.success === true, 'Login response has success flag');
    assert(response.data.token, 'Auth token received');
    
    authToken = response.data.token;
    log(`Auth token: ${authToken.substring(0, 20)}...`, 'info');
  } catch (error) {
    log(`Login failed: ${error.message}`, 'error');
    log('Creating test user...', 'warning');
    
    // Create test user
    await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });
    
    // Try login again
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123',
    });
    
    authToken = response.data.token;
    log('Test user created and logged in', 'success');
  }
}

// Test 2: Dashboard shows real counts
async function testDashboardCounts() {
  log('\n📊 Test 2: Dashboard Real Counts', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/dashboard/summary`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Dashboard summary fetched');
  assert(response.data.success === true, 'Dashboard response successful');
  
  const { workspaces, notes, documents, aiChats } = response.data.data;
  
  log(`Workspaces: ${workspaces}`, 'info');
  log(`Notes: ${notes}`, 'info');
  log(`Documents: ${documents}`, 'info');
  log(`AI Chats: ${aiChats}`, 'info');
  
  assert(typeof workspaces === 'number', 'Workspaces count is a number');
  assert(typeof notes === 'number', 'Notes count is a number');
  assert(typeof documents === 'number', 'Documents count is a number');
  assert(typeof aiChats === 'number', 'AI Chats count is a number');
  
  // Counts should not be hardcoded values
  const isNotHardcoded = !(workspaces === 5 && notes === 23 && documents === 12);
  assert(isNotHardcoded, 'Counts are not hardcoded mock values');
}

// Test 3: Create workspace
async function testCreateWorkspace() {
  log('\n🏢 Test 3: Create Workspace', 'info');
  
  const response = await axios.post(
    `${BASE_URL}/api/workspaces`,
    {
      name: `Test Workspace ${Date.now()}`,
      description: 'Automated test workspace',
      tags: ['test', 'automation'],
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  assert(response.status === 201, 'Workspace created');
  assert(response.data.success === true, 'Workspace creation successful');
  assert(response.data.data.id, 'Workspace ID returned');
  
  testWorkspaceId = response.data.data.id;
  log(`Workspace ID: ${testWorkspaceId}`, 'info');
}

// Test 4: Create note and verify persistence
async function testCreateNote() {
  log('\n📝 Test 4: Create Note and Verify Persistence', 'info');
  
  const response = await axios.post(
    `${BASE_URL}/api/notes`,
    {
      title: `Test Note ${Date.now()}`,
      content: 'This is a test note for data consistency verification',
      workspaceId: testWorkspaceId,
      tags: ['test', 'automated'],
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  assert(response.status === 201, 'Note created');
  assert(response.data.success === true, 'Note creation successful');
  assert(response.data.data.id, 'Note ID returned');
  
  testNoteId = response.data.data.id;
  log(`Note ID: ${testNoteId}`, 'info');
  
  // Verify note can be retrieved
  const getResponse = await axios.get(`${BASE_URL}/api/notes/${testNoteId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  
  assert(getResponse.status === 200, 'Note retrieved successfully');
  assert(getResponse.data.note.id === testNoteId, 'Retrieved note matches created note');
}

// Test 5: Upload document and verify persistence
async function testUploadDocument() {
  log('\n📄 Test 5: Upload Document and Verify Persistence', 'info');
  
  // Create a test file
  const testFilePath = path.join(__dirname, 'test-document.txt');
  fs.writeFileSync(testFilePath, 'This is a test document for upload verification.\nIt contains multiple lines.\nAnd should be indexed for search.');
  
  const formData = new FormData();
  formData.append('file', fs.createReadStream(testFilePath));
  formData.append('title', `Test Document ${Date.now()}`);
  formData.append('workspaceId', testWorkspaceId);
  formData.append('tags', JSON.stringify(['test', 'upload']));
  formData.append('description', 'Automated test document upload');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/documents`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    assert(response.status === 201, 'Document uploaded');
    assert(response.data.success === true, 'Document upload successful');
    assert(response.data.data.id, 'Document ID returned');
    
    testDocumentId = response.data.data.id;
    log(`Document ID: ${testDocumentId}`, 'info');
    
    // Verify document can be retrieved
    const getResponse = await axios.get(`${BASE_URL}/api/documents/${testDocumentId}`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    assert(getResponse.status === 200, 'Document retrieved successfully');
    assert(getResponse.data.document.id === testDocumentId, 'Retrieved document matches uploaded document');
    assert(getResponse.data.document.extractedText, 'Document text was extracted');
    
  } finally {
    // Cleanup test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  }
}

// Test 6: Create chat with resource linking
async function testCreateChatWithResourceLink() {
  log('\n💬 Test 6: Create Chat with Resource Linking', 'info');
  
  const response = await axios.post(
    `${BASE_URL}/api/chats`,
    {
      title: `Test Chat ${Date.now()}`,
      workspaceId: testWorkspaceId,
      isAIConversation: true,
      context: {
        noteId: testNoteId,
        documentId: testDocumentId,
      },
    },
    {
      headers: { Authorization: `Bearer ${authToken}` },
    }
  );

  assert(response.status === 201, 'Chat created');
  assert(response.data.success === true, 'Chat creation successful');
  assert(response.data.data.id, 'Chat ID returned');
  
  testChatId = response.data.data.id;
  log(`Chat ID: ${testChatId}`, 'info');
  
  // Verify chat retrieves linked resources
  const getResponse = await axios.get(`${BASE_URL}/api/chats/${testChatId}`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });
  
  assert(getResponse.status === 200, 'Chat retrieved successfully');
  assert(getResponse.data.chat.contextResources, 'Context resources included');
  assert(getResponse.data.chat.contextResources.note, 'Linked note found');
  assert(getResponse.data.chat.contextResources.document, 'Linked document found');
  assert(!getResponse.data.chat.contextResources.note.isMissing, 'Linked note exists');
  assert(!getResponse.data.chat.contextResources.document.isMissing, 'Linked document exists');
}

// Test 7: Verify dashboard counts updated
async function testDashboardCountsUpdated() {
  log('\n📊 Test 7: Verify Dashboard Counts Updated', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/dashboard/summary`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  const { workspaces, notes, documents, aiChats } = response.data.data;
  
  assert(workspaces >= 1, 'At least 1 workspace exists');
  assert(notes >= 1, 'At least 1 note exists');
  assert(documents >= 1, 'At least 1 document exists');
  assert(aiChats >= 1, 'At least 1 chat exists');
  
  log(`Updated counts - Workspaces: ${workspaces}, Notes: ${notes}, Documents: ${documents}, Chats: ${aiChats}`, 'success');
}

// Test 8: Search functionality
async function testSearch() {
  log('\n🔍 Test 8: Search Functionality', 'info');
  
  const response = await axios.get(`${BASE_URL}/api/search?q=test&type=all`, {
    headers: { Authorization: `Bearer ${authToken}` },
  });

  assert(response.status === 200, 'Search executed');
  assert(response.data.success === true, 'Search successful');
  assert(response.data.results, 'Search results returned');
  assert(response.data.totalResults >= 0, 'Total results count provided');
  
  log(`Found ${response.data.totalResults} results`, 'info');
  log(`Notes: ${response.data.results.notes.length}`, 'info');
  log(`Documents: ${response.data.results.documents.length}`, 'info');
  log(`Workspaces: ${response.data.results.workspaces.length}`, 'info');
}

// Test 9: Test invalid resource ID (404 handling)
async function testInvalidResourceId() {
  log('\n❌ Test 9: Invalid Resource ID Handling', 'info');
  
  try {
    await axios.get(`${BASE_URL}/api/documents/invalid-id-12345`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(false, 'Should have thrown error for invalid ID');
  } catch (error) {
    assert(error.response.status === 400 || error.response.status === 404, 'Returns 400/404 for invalid ID');
    log('Invalid ID properly rejected', 'success');
  }
  
  try {
    await axios.get(`${BASE_URL}/api/notes/507f1f77bcf86cd799439011`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(false, 'Should have thrown error for non-existent note');
  } catch (error) {
    assert(error.response.status === 404, 'Returns 404 for non-existent note');
    log('Non-existent resource properly handled', 'success');
  }
}

// Run all tests
async function runAllTests() {
  log('🚀 Starting Data Consistency Test Suite\n', 'info');
  
  const tests = [
    { name: 'Login', fn: testLogin },
    { name: 'Dashboard Counts', fn: testDashboardCounts },
    { name: 'Create Workspace', fn: testCreateWorkspace },
    { name: 'Create Note', fn: testCreateNote },
    { name: 'Upload Document', fn: testUploadDocument },
    { name: 'Create Chat with Links', fn: testCreateChatWithResourceLink },
    { name: 'Dashboard Counts Updated', fn: testDashboardCountsUpdated },
    { name: 'Search', fn: testSearch },
    { name: 'Invalid Resource Handling', fn: testInvalidResourceId },
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
