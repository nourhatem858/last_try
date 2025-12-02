/**
 * Complete Note View Test Script
 * Tests authentication, note fetching, and error handling
 */

const BASE_URL = 'http://localhost:3000';

// ANSI color codes for terminal output
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

// Test 1: Login and get token
async function testLogin() {
  logSection('TEST 1: Login and Get Token');
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.token) {
      log('✅ Login successful', 'green');
      log(`   Token: ${data.token.substring(0, 20)}...`, 'blue');
      log(`   User: ${data.user.name} (${data.user.email})`, 'blue');
      return { success: true, token: data.token, user: data.user };
    } else {
      log('❌ Login failed', 'red');
      log(`   Error: ${data.error || data.message}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Login error', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 2: Get list of notes
async function testGetNotes(token) {
  logSection('TEST 2: Get Notes List');
  
  try {
    const response = await fetch(`${BASE_URL}/api/notes`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    if (response.ok && data.success && data.notes) {
      log('✅ Notes fetched successfully', 'green');
      log(`   Total notes: ${data.notes.length}`, 'blue');
      
      if (data.notes.length > 0) {
        const firstNote = data.notes[0];
        log(`   First note ID: ${firstNote.id}`, 'blue');
        log(`   First note title: ${firstNote.title}`, 'blue');
        return { success: true, notes: data.notes, firstNoteId: firstNote.id };
      } else {
        log('   No notes found. Create a note first.', 'yellow');
        return { success: true, notes: [], firstNoteId: null };
      }
    } else {
      log('❌ Failed to fetch notes', 'red');
      log(`   Error: ${data.error || data.message}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Fetch notes error', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 3: Get single note (valid ID with token)
async function testGetNote(token, noteId) {
  logSection('TEST 3: Get Single Note (Valid Request)');
  
  try {
    log(`Fetching note: ${noteId}`, 'blue');
    
    const response = await fetch(`${BASE_URL}/api/notes/${noteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    log(`Response status: ${response.status}`, 'blue');
    
    if (response.ok && data.success && data.note) {
      log('✅ Note fetched successfully', 'green');
      log(`   ID: ${data.note.id}`, 'blue');
      log(`   Title: ${data.note.title}`, 'blue');
      log(`   Content: ${data.note.content.substring(0, 50)}...`, 'blue');
      log(`   Workspace: ${data.note.workspace}`, 'blue');
      log(`   Author: ${data.note.author}`, 'blue');
      log(`   Created: ${data.note.createdAt}`, 'blue');
      return { success: true, note: data.note };
    } else {
      log('❌ Failed to fetch note', 'red');
      log(`   Error: ${data.error || data.message}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Fetch note error', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 4: Get note without token (should fail with 401)
async function testGetNoteNoToken(noteId) {
  logSection('TEST 4: Get Note Without Token (Should Fail)');
  
  try {
    const response = await fetch(`${BASE_URL}/api/notes/${noteId}`);
    const data = await response.json();
    
    log(`Response status: ${response.status}`, 'blue');
    
    if (response.status === 401) {
      log('✅ Correctly rejected (401 Unauthorized)', 'green');
      log(`   Error: ${data.error || data.message}`, 'blue');
      return { success: true };
    } else {
      log('❌ Should have returned 401', 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Test error', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 5: Get note with invalid ID (should fail with 400)
async function testGetNoteInvalidId(token) {
  logSection('TEST 5: Get Note With Invalid ID (Should Fail)');
  
  const invalidIds = [
    'invalid-id',
    '123',
    'not-an-objectid',
    '507f1f77bcf86cd79943901', // 23 chars (too short)
    '507f1f77bcf86cd799439011z', // contains 'z'
  ];
  
  for (const invalidId of invalidIds) {
    try {
      log(`Testing invalid ID: ${invalidId}`, 'yellow');
      
      const response = await fetch(`${BASE_URL}/api/notes/${invalidId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      
      if (response.status === 400) {
        log(`  ✅ Correctly rejected (400 Bad Request)`, 'green');
        log(`     Error: ${data.error || data.message}`, 'blue');
      } else {
        log(`  ❌ Should have returned 400, got ${response.status}`, 'red');
      }
    } catch (error) {
      log(`  ❌ Test error: ${error.message}`, 'red');
    }
  }
  
  return { success: true };
}

// Test 6: Get non-existent note (should fail with 404)
async function testGetNoteNotFound(token) {
  logSection('TEST 6: Get Non-Existent Note (Should Fail)');
  
  // Valid ObjectId format but doesn't exist
  const nonExistentId = '507f1f77bcf86cd799439011';
  
  try {
    log(`Testing non-existent ID: ${nonExistentId}`, 'yellow');
    
    const response = await fetch(`${BASE_URL}/api/notes/${nonExistentId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    
    log(`Response status: ${response.status}`, 'blue');
    
    if (response.status === 404 || response.status === 403) {
      log('✅ Correctly rejected (404 Not Found or 403 Forbidden)', 'green');
      log(`   Error: ${data.error || data.message}`, 'blue');
      return { success: true };
    } else if (response.status === 200) {
      log('⚠️  Note exists (this is OK if you have this note)', 'yellow');
      return { success: true };
    } else {
      log(`❌ Unexpected status: ${response.status}`, 'red');
      return { success: false };
    }
  } catch (error) {
    log('❌ Test error', 'red');
    log(`   ${error.message}`, 'red');
    return { success: false };
  }
}

// Test 7: Validate ObjectId format
function testObjectIdValidation() {
  logSection('TEST 7: ObjectId Format Validation');
  
  const testCases = [
    { id: '507f1f77bcf86cd799439011', valid: true },
    { id: '507F1F77BCF86CD799439011', valid: true }, // uppercase
    { id: 'invalid-id', valid: false },
    { id: '123', valid: false },
    { id: '507f1f77bcf86cd79943901', valid: false }, // 23 chars
    { id: '507f1f77bcf86cd799439011z', valid: false }, // contains 'z'
    { id: '507f1f77-bcf8-6cd7-9943-9011', valid: false }, // has dashes
    { id: '', valid: false },
  ];
  
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(({ id, valid }) => {
    const result = objectIdRegex.test(id);
    const isCorrect = result === valid;
    
    if (isCorrect) {
      log(`✅ "${id}" → ${result} (expected ${valid})`, 'green');
      passed++;
    } else {
      log(`❌ "${id}" → ${result} (expected ${valid})`, 'red');
      failed++;
    }
  });
  
  log(`\nValidation tests: ${passed} passed, ${failed} failed`, passed === testCases.length ? 'green' : 'red');
  
  return { success: failed === 0 };
}

// Main test runner
async function runAllTests() {
  log('\n🧪 Starting Complete Note View Tests\n', 'cyan');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
  };
  
  // Test 1: Login
  const loginResult = await testLogin();
  results.total++;
  if (loginResult.success) {
    results.passed++;
  } else {
    results.failed++;
    log('\n⚠️  Cannot continue without login. Please ensure:', 'yellow');
    log('   1. Server is running (npm run dev)', 'yellow');
    log('   2. Test user exists (email: test@example.com, password: password123)', 'yellow');
    log('   3. MongoDB is connected', 'yellow');
    return;
  }
  
  const { token, user } = loginResult;
  
  // Test 2: Get notes list
  const notesResult = await testGetNotes(token);
  results.total++;
  if (notesResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // If we have notes, test with real note ID
  if (notesResult.firstNoteId) {
    // Test 3: Get single note
    const noteResult = await testGetNote(token, notesResult.firstNoteId);
    results.total++;
    if (noteResult.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Test 4: No token
    const noTokenResult = await testGetNoteNoToken(notesResult.firstNoteId);
    results.total++;
    if (noTokenResult.success) {
      results.passed++;
    } else {
      results.failed++;
    }
  } else {
    log('\n⚠️  No notes found. Skipping tests 3-4.', 'yellow');
    log('   Create a note first to test note fetching.', 'yellow');
  }
  
  // Test 5: Invalid ID
  const invalidIdResult = await testGetNoteInvalidId(token);
  results.total++;
  if (invalidIdResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 6: Non-existent note
  const notFoundResult = await testGetNoteNotFound(token);
  results.total++;
  if (notFoundResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Test 7: ObjectId validation
  const validationResult = testObjectIdValidation();
  results.total++;
  if (validationResult.success) {
    results.passed++;
  } else {
    results.failed++;
  }
  
  // Summary
  logSection('TEST SUMMARY');
  log(`Total tests: ${results.total}`, 'blue');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
  
  if (results.failed === 0) {
    log('\n🎉 All tests passed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the output above for details.', 'yellow');
  }
}

// Run tests
runAllTests().catch(error => {
  log('\n❌ Fatal error:', 'red');
  console.error(error);
  process.exit(1);
});
