/**
 * Test Script for Create Note and Document Functionality
 * Tests the complete flow of creating notes and documents
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000';

// Test user credentials (update with your test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123456',
};

let authToken = '';

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

// Step 1: Login
async function login() {
  try {
    log('\n📝 Step 1: Logging in...', 'cyan');
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (response.data.success && response.data.token) {
      authToken = response.data.token;
      log('✅ Login successful!', 'green');
      log(`Token: ${authToken.substring(0, 20)}...`, 'blue');
      return true;
    } else {
      log('❌ Login failed: No token received', 'red');
      return false;
    }
  } catch (error) {
    log(`❌ Login error: ${error.response?.data?.error || error.message}`, 'red');
    return false;
  }
}

// Step 2: Create Note
async function createNote() {
  try {
    log('\n📝 Step 2: Creating a note...', 'cyan');
    
    const noteData = {
      title: 'Test Note - ' + new Date().toISOString(),
      content: 'This is a test note created to verify the create note functionality.',
      tags: ['test', 'automation', 'verification'],
      color: 'cyan',
    };

    const response = await axios.post(`${BASE_URL}/api/notes`, noteData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      log('✅ Note created successfully!', 'green');
      log(`Note ID: ${response.data.data.id}`, 'blue');
      log(`Title: ${response.data.data.title}`, 'blue');
      log(`Workspace: ${response.data.data.workspace}`, 'blue');
      log(`Tags: ${response.data.data.tags.join(', ')}`, 'blue');
      return response.data.data;
    } else {
      log('❌ Note creation failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Create note error: ${error.response?.data?.error || error.message}`, 'red');
    if (error.response?.data) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
    }
    return null;
  }
}

// Step 3: Fetch Notes
async function fetchNotes() {
  try {
    log('\n📝 Step 3: Fetching all notes...', 'cyan');
    
    const response = await axios.get(`${BASE_URL}/api/notes`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      log(`✅ Fetched ${response.data.count} notes`, 'green');
      response.data.data.forEach((note, index) => {
        log(`\n  Note ${index + 1}:`, 'blue');
        log(`    - Title: ${note.title}`, 'blue');
        log(`    - Workspace: ${note.workspace}`, 'blue');
        log(`    - Created: ${new Date(note.createdAt).toLocaleString()}`, 'blue');
      });
      return response.data.data;
    } else {
      log('❌ Failed to fetch notes', 'red');
      return [];
    }
  } catch (error) {
    log(`❌ Fetch notes error: ${error.response?.data?.error || error.message}`, 'red');
    return [];
  }
}

// Step 4: Create Test Document (text file)
async function createDocument() {
  try {
    log('\n📝 Step 4: Creating a document...', 'cyan');
    
    // Create a temporary test file
    const testContent = 'This is a test document created to verify the upload functionality.\n\nIt contains multiple lines of text.';
    const testFileName = `test-document-${Date.now()}.txt`;
    fs.writeFileSync(testFileName, testContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFileName));
    formData.append('title', 'Test Document - ' + new Date().toISOString());
    formData.append('tags', JSON.stringify(['test', 'automation', 'upload']));
    formData.append('description', 'Test document for verification');

    const response = await axios.post(`${BASE_URL}/api/documents`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${authToken}`,
      },
    });

    // Clean up test file
    fs.unlinkSync(testFileName);

    if (response.data.success) {
      log('✅ Document uploaded successfully!', 'green');
      log(`Document ID: ${response.data.data.id}`, 'blue');
      log(`Title: ${response.data.data.title}`, 'blue');
      log(`File Name: ${response.data.data.fileName}`, 'blue');
      log(`Workspace: ${response.data.data.workspace}`, 'blue');
      log(`Tags: ${response.data.data.tags.join(', ')}`, 'blue');
      return response.data.data;
    } else {
      log('❌ Document upload failed', 'red');
      return null;
    }
  } catch (error) {
    log(`❌ Create document error: ${error.response?.data?.error || error.message}`, 'red');
    if (error.response?.data) {
      log(`Response: ${JSON.stringify(error.response.data, null, 2)}`, 'yellow');
    }
    return null;
  }
}

// Step 5: Fetch Documents
async function fetchDocuments() {
  try {
    log('\n📝 Step 5: Fetching all documents...', 'cyan');
    
    const response = await axios.get(`${BASE_URL}/api/documents`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.data.success) {
      log(`✅ Fetched ${response.data.count} documents`, 'green');
      response.data.data.forEach((doc, index) => {
        log(`\n  Document ${index + 1}:`, 'blue');
        log(`    - Title: ${doc.title}`, 'blue');
        log(`    - File: ${doc.fileName}`, 'blue');
        log(`    - Workspace: ${doc.workspace}`, 'blue');
        log(`    - Uploaded: ${new Date(doc.uploadedAt).toLocaleString()}`, 'blue');
      });
      return response.data.data;
    } else {
      log('❌ Failed to fetch documents', 'red');
      return [];
    }
  } catch (error) {
    log(`❌ Fetch documents error: ${error.response?.data?.error || error.message}`, 'red');
    return [];
  }
}

// Main test function
async function runTests() {
  log('═══════════════════════════════════════════════════', 'cyan');
  log('  🧪 Testing Create Note & Document Functionality', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');

  // Step 1: Login
  const loginSuccess = await login();
  if (!loginSuccess) {
    log('\n❌ Tests aborted: Login failed', 'red');
    log('\n💡 Make sure:', 'yellow');
    log('   1. Server is running (npm run dev)', 'yellow');
    log('   2. MongoDB is connected', 'yellow');
    log('   3. Test user exists with correct credentials', 'yellow');
    return;
  }

  // Step 2: Create Note
  const note = await createNote();
  
  // Step 3: Fetch Notes
  const notes = await fetchNotes();

  // Step 4: Create Document
  const document = await createDocument();

  // Step 5: Fetch Documents
  const documents = await fetchDocuments();

  // Summary
  log('\n═══════════════════════════════════════════════════', 'cyan');
  log('  📊 Test Summary', 'cyan');
  log('═══════════════════════════════════════════════════', 'cyan');
  
  const results = {
    login: loginSuccess ? '✅' : '❌',
    createNote: note ? '✅' : '❌',
    fetchNotes: notes.length > 0 ? '✅' : '❌',
    createDocument: document ? '✅' : '❌',
    fetchDocuments: documents.length > 0 ? '✅' : '❌',
  };

  log(`\n${results.login} Login`, results.login === '✅' ? 'green' : 'red');
  log(`${results.createNote} Create Note`, results.createNote === '✅' ? 'green' : 'red');
  log(`${results.fetchNotes} Fetch Notes (${notes.length} found)`, results.fetchNotes === '✅' ? 'green' : 'red');
  log(`${results.createDocument} Create Document`, results.createDocument === '✅' ? 'green' : 'red');
  log(`${results.fetchDocuments} Fetch Documents (${documents.length} found)`, results.fetchDocuments === '✅' ? 'green' : 'red');

  const allPassed = Object.values(results).every(r => r === '✅');
  
  if (allPassed) {
    log('\n🎉 All tests passed! Create Note & Document functionality is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }

  log('\n═══════════════════════════════════════════════════\n', 'cyan');
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  console.error(error);
});
