/**
 * Test Document Functionality
 * Tests Create and View Document features
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#',
};

let authToken = null;
let createdDocumentId = null;

/**
 * Login to get auth token
 */
async function login() {
  logSection('🔐 Step 1: Login');
  
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      authToken = data.token;
      logSuccess('Login successful');
      logInfo(`Token: ${authToken.substring(0, 20)}...`);
      return true;
    } else {
      logError(`Login failed: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Login error: ${error.message}`);
    return false;
  }
}

/**
 * Create a test PDF file
 */
function createTestPDF() {
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF`;

  const testDir = path.join(process.cwd(), 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  const filePath = path.join(testDir, 'test-document.pdf');
  fs.writeFileSync(filePath, pdfContent);
  
  return filePath;
}

/**
 * Test: Create Document
 */
async function testCreateDocument() {
  logSection('📄 Step 2: Create Document');

  try {
    // Create test PDF
    const pdfPath = createTestPDF();
    logInfo(`Created test PDF: ${pdfPath}`);

    // Read file
    const fileBuffer = fs.readFileSync(pdfPath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    // Create FormData
    const FormData = (await import('formdata-node')).FormData;
    const formData = new FormData();
    formData.append('file', blob, 'test-document.pdf');
    formData.append('title', 'Test Document - ' + new Date().toISOString());
    formData.append('tags', JSON.stringify(['test', 'automation', 'pdf']));
    formData.append('description', 'This is a test document created by automated test');

    logInfo('Uploading document...');

    const response = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      createdDocumentId = data.data.id;
      logSuccess('Document created successfully');
      logInfo(`Document ID: ${createdDocumentId}`);
      logInfo(`Title: ${data.data.title}`);
      logInfo(`File Name: ${data.data.fileName}`);
      logInfo(`File Type: ${data.data.fileType}`);
      logInfo(`File Size: ${data.data.fileSize} bytes`);
      logInfo(`Tags: ${data.data.tags.join(', ')}`);
      logInfo(`URL: ${data.data.url}`);
      return true;
    } else {
      logError(`Document creation failed: ${data.error || 'Unknown error'}`);
      console.log('Response:', data);
      return false;
    }
  } catch (error) {
    logError(`Document creation error: ${error.message}`);
    console.error(error);
    return false;
  }
}

/**
 * Test: List Documents
 */
async function testListDocuments() {
  logSection('📋 Step 3: List Documents');

  try {
    const response = await fetch(`${API_BASE}/documents`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess(`Found ${data.count} documents`);
      
      if (data.data.length > 0) {
        logInfo('Recent documents:');
        data.data.slice(0, 5).forEach((doc, index) => {
          console.log(`  ${index + 1}. ${doc.title} (${doc.fileType})`);
        });
      }

      // Check if our created document is in the list
      const foundDoc = data.data.find(doc => doc.id === createdDocumentId);
      if (foundDoc) {
        logSuccess('✓ Created document appears in list');
      } else {
        logWarning('Created document not found in list');
      }

      return true;
    } else {
      logError(`Failed to list documents: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`List documents error: ${error.message}`);
    return false;
  }
}

/**
 * Test: View Document
 */
async function testViewDocument() {
  logSection('👁️  Step 4: View Document');

  if (!createdDocumentId) {
    logError('No document ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${createdDocumentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess('Document retrieved successfully');
      logInfo(`Title: ${data.document.title}`);
      logInfo(`File Name: ${data.document.fileName}`);
      logInfo(`File Type: ${data.document.fileType}`);
      logInfo(`Size: ${data.document.size} bytes`);
      logInfo(`Uploaded At: ${data.document.uploadedAt}`);
      logInfo(`Tags: ${data.document.tags.join(', ')}`);
      logInfo(`Workspace: ${data.document.workspace}`);
      logInfo(`View Count: ${data.document.viewCount}`);
      
      if (data.document.extractedText) {
        logInfo(`Extracted Text: ${data.document.extractedText.substring(0, 100)}...`);
      }

      return true;
    } else {
      logError(`Failed to view document: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`View document error: ${error.message}`);
    return false;
  }
}

/**
 * Test: Update Document
 */
async function testUpdateDocument() {
  logSection('✏️  Step 5: Update Document');

  if (!createdDocumentId) {
    logError('No document ID available');
    return false;
  }

  try {
    const newTitle = 'Updated Test Document - ' + new Date().toISOString();
    
    const response = await fetch(`${API_BASE}/documents/${createdDocumentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        title: newTitle,
        tags: ['test', 'updated', 'automation'],
        description: 'Updated description',
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess('Document updated successfully');
      logInfo(`New Title: ${data.document.title}`);
      logInfo(`New Tags: ${data.document.tags.join(', ')}`);
      return true;
    } else {
      logError(`Failed to update document: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Update document error: ${error.message}`);
    return false;
  }
}

/**
 * Test: Delete Document
 */
async function testDeleteDocument() {
  logSection('🗑️  Step 6: Delete Document');

  if (!createdDocumentId) {
    logError('No document ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${createdDocumentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      logSuccess('Document deleted successfully');
      return true;
    } else {
      logError(`Failed to delete document: ${data.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    logError(`Delete document error: ${error.message}`);
    return false;
  }
}

/**
 * Test: Verify Document Not Found
 */
async function testDocumentNotFound() {
  logSection('🔍 Step 7: Verify Document Deleted');

  if (!createdDocumentId) {
    logError('No document ID available');
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/documents/${createdDocumentId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
    });

    const data = await response.json();

    if (response.status === 404) {
      logSuccess('✓ Document correctly returns 404 after deletion');
      return true;
    } else {
      logWarning('Document still accessible after deletion');
      return false;
    }
  } catch (error) {
    logError(`Verification error: ${error.message}`);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║     DOCUMENT FUNCTIONALITY TEST SUITE                     ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    passed: 0,
    failed: 0,
    total: 7,
  };

  // Run tests
  if (await login()) results.passed++; else results.failed++;
  if (await testCreateDocument()) results.passed++; else results.failed++;
  if (await testListDocuments()) results.passed++; else results.failed++;
  if (await testViewDocument()) results.passed++; else results.failed++;
  if (await testUpdateDocument()) results.passed++; else results.failed++;
  if (await testDeleteDocument()) results.passed++; else results.failed++;
  if (await testDocumentNotFound()) results.passed++; else results.failed++;

  // Summary
  logSection('📊 Test Summary');
  log(`Total Tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log(`\n⚠️  ${results.failed} test(s) failed`, 'red');
  }

  console.log('\n');
}

// Run tests
runTests().catch(error => {
  logError(`Test suite error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
