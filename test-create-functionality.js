/**
 * Test Script: Create Note and Create Document Functionality
 * Tests the complete flow of creating notes and documents
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let testUserId = '';
let testWorkspaceId = '';
let createdNoteId = '';
let createdDocumentId = '';

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

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'blue');
}

// Test 1: Login to get auth token
async function testLogin() {
  logSection('TEST 1: User Authentication');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'Test123!@#',
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      testUserId = response.data.user.id;
      logSuccess('Login successful');
      logInfo(`User ID: ${testUserId}`);
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError('Login failed: No token received');
      return false;
    }
  } catch (error) {
    logError(`Login failed: ${error.response?.data?.error || error.message}`);
    logInfo('Make sure you have a test user created. Run: node create-test-user.js');
    return false;
  }
}

// Test 2: Get or create Personal workspace
async function testGetWorkspace() {
  logSection('TEST 2: Get Personal Workspace');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/workspaces`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data.length > 0) {
      const personalWorkspace = response.data.data.find(w => w.name === 'Personal');
      if (personalWorkspace) {
        testWorkspaceId = personalWorkspace.id;
        logSuccess('Personal workspace found');
        logInfo(`Workspace ID: ${testWorkspaceId}`);
        return true;
      } else {
        logInfo('Personal workspace not found, will be created automatically');
        return true;
      }
    } else {
      logInfo('No workspaces found, Personal workspace will be created automatically');
      return true;
    }
  } catch (error) {
    logError(`Failed to get workspaces: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 3: Create a new note
async function testCreateNote() {
  logSection('TEST 3: Create Note');
  
  const noteData = {
    title: 'Test Note - ' + new Date().toISOString(),
    content: 'This is a test note created by the automated test script. It should appear immediately in the notes list.',
    tags: ['test', 'automated', 'demo'],
    color: 'cyan',
  };

  if (testWorkspaceId) {
    noteData.workspaceId = testWorkspaceId;
  }

  try {
    logInfo('Sending note creation request...');
    logInfo(`Title: ${noteData.title}`);
    logInfo(`Tags: ${noteData.tags.join(', ')}`);
    
    const response = await axios.post(`${BASE_URL}/api/notes`, noteData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data) {
      createdNoteId = response.data.data.id;
      logSuccess('Note created successfully!');
      logInfo(`Note ID: ${createdNoteId}`);
      logInfo(`Title: ${response.data.data.title}`);
      logInfo(`Workspace: ${response.data.data.workspace}`);
      logInfo(`Created At: ${response.data.data.createdAt}`);
      return true;
    } else {
      logError('Note creation failed: No data returned');
      return false;
    }
  } catch (error) {
    logError(`Note creation failed: ${error.response?.data?.error || error.message}`);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

// Test 4: Verify note appears in list
async function testVerifyNoteInList() {
  logSection('TEST 4: Verify Note Appears in List');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data) {
      const notes = response.data.data;
      const createdNote = notes.find(n => n.id === createdNoteId);
      
      if (createdNote) {
        logSuccess('Note found in list!');
        logInfo(`Total notes: ${notes.length}`);
        logInfo(`Note title: ${createdNote.title}`);
        logInfo(`Note tags: ${createdNote.tags.join(', ')}`);
        return true;
      } else {
        logError('Created note not found in list');
        logInfo(`Total notes: ${notes.length}`);
        return false;
      }
    } else {
      logError('Failed to fetch notes list');
      return false;
    }
  } catch (error) {
    logError(`Failed to verify note: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 5: Create a document (simulated file upload)
async function testCreateDocument() {
  logSection('TEST 5: Create Document');
  
  // Create a simple text file buffer
  const fileContent = 'This is a test document created by the automated test script.\n\nIt contains sample content to verify document upload functionality.\n\nKey points:\n- Document upload works\n- File processing works\n- Database storage works';
  const fileName = `test-document-${Date.now()}.txt`;
  
  const FormData = require('form-data');
  const formData = new FormData();
  
  // Create a buffer from the file content
  const buffer = Buffer.from(fileContent, 'utf-8');
  formData.append('file', buffer, {
    filename: fileName,
    contentType: 'text/plain',
  });
  formData.append('title', 'Test Document - ' + new Date().toISOString());
  formData.append('tags', JSON.stringify(['test', 'automated', 'demo']));
  formData.append('description', 'This is a test document for verification');
  
  if (testWorkspaceId) {
    formData.append('workspaceId', testWorkspaceId);
  }

  try {
    logInfo('Sending document upload request...');
    logInfo(`File name: ${fileName}`);
    logInfo(`File size: ${buffer.length} bytes`);
    
    const response = await axios.post(`${BASE_URL}/api/documents`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data) {
      createdDocumentId = response.data.data.id;
      logSuccess('Document uploaded successfully!');
      logInfo(`Document ID: ${createdDocumentId}`);
      logInfo(`Title: ${response.data.data.title}`);
      logInfo(`File Name: ${response.data.data.fileName}`);
      logInfo(`Workspace: ${response.data.data.workspace}`);
      logInfo(`Uploaded At: ${response.data.data.uploadedAt}`);
      return true;
    } else {
      logError('Document upload failed: No data returned');
      return false;
    }
  } catch (error) {
    logError(`Document upload failed: ${error.response?.data?.error || error.message}`);
    if (error.response?.data) {
      console.log('Response data:', error.response.data);
    }
    return false;
  }
}

// Test 6: Verify document appears in list
async function testVerifyDocumentInList() {
  logSection('TEST 6: Verify Document Appears in List');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/documents`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success && response.data.data) {
      const documents = response.data.data;
      const createdDocument = documents.find(d => d.id === createdDocumentId);
      
      if (createdDocument) {
        logSuccess('Document found in list!');
        logInfo(`Total documents: ${documents.length}`);
        logInfo(`Document title: ${createdDocument.title}`);
        logInfo(`File name: ${createdDocument.fileName}`);
        logInfo(`File type: ${createdDocument.fileType}`);
        return true;
      } else {
        logError('Created document not found in list');
        logInfo(`Total documents: ${documents.length}`);
        return false;
      }
    } else {
      logError('Failed to fetch documents list');
      return false;
    }
  } catch (error) {
    logError(`Failed to verify document: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// Test 7: Test error handling - empty fields
async function testErrorHandling() {
  logSection('TEST 7: Error Handling - Empty Fields');
  
  try {
    // Test creating note without title
    logInfo('Testing note creation without title...');
    try {
      await axios.post(`${BASE_URL}/api/notes`, {
        title: '',
        content: 'Content without title',
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });
      logError('Should have failed but succeeded');
      return false;
    } catch (error) {
      if (error.response?.status === 400) {
        logSuccess('Correctly rejected empty title');
      } else {
        logError(`Unexpected error: ${error.message}`);
        return false;
      }
    }

    // Test creating note without auth
    logInfo('Testing note creation without authentication...');
    try {
      await axios.post(`${BASE_URL}/api/notes`, {
        title: 'Test',
        content: 'Test',
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      logError('Should have failed but succeeded');
      return false;
    } catch (error) {
      if (error.response?.status === 401) {
        logSuccess('Correctly rejected unauthenticated request');
      } else {
        logError(`Unexpected error: ${error.message}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    logError(`Error handling test failed: ${error.message}`);
    return false;
  }
}

// Test 8: Cleanup - Delete created items
async function testCleanup() {
  logSection('TEST 8: Cleanup - Delete Test Items');
  
  let success = true;

  // Delete created note
  if (createdNoteId) {
    try {
      logInfo(`Deleting test note: ${createdNoteId}`);
      await axios.delete(`${BASE_URL}/api/notes/${createdNoteId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      logSuccess('Test note deleted');
    } catch (error) {
      logError(`Failed to delete note: ${error.message}`);
      success = false;
    }
  }

  // Delete created document
  if (createdDocumentId) {
    try {
      logInfo(`Deleting test document: ${createdDocumentId}`);
      await axios.delete(`${BASE_URL}/api/documents/${createdDocumentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      logSuccess('Test document deleted');
    } catch (error) {
      logError(`Failed to delete document: ${error.message}`);
      success = false;
    }
  }

  return success;
}

// Main test runner
async function runTests() {
  console.clear();
  logSection('🎯 CREATE NOTE & DOCUMENT FUNCTIONALITY TEST');
  logInfo('Testing the complete flow of creating notes and documents');
  logInfo(`Base URL: ${BASE_URL}`);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  const tests = [
    { name: 'User Authentication', fn: testLogin },
    { name: 'Get Personal Workspace', fn: testGetWorkspace },
    { name: 'Create Note', fn: testCreateNote },
    { name: 'Verify Note in List', fn: testVerifyNoteInList },
    { name: 'Create Document', fn: testCreateDocument },
    { name: 'Verify Document in List', fn: testVerifyDocumentInList },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Cleanup', fn: testCleanup },
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Final summary
  logSection('📊 TEST SUMMARY');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed! Create Note and Create Document functionality is working correctly.', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed. Please review the errors above.`, 'red');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch((error) => {
  logError(`Test runner failed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
