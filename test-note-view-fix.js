/**
 * Test Note View Fix
 * Comprehensive test to verify the note view bug is fixed
 * 
 * Usage: 
 * 1. Start your dev server: npm run dev
 * 2. Login to get a token
 * 3. Run: TOKEN=your_token NOTE_ID=your_note_id node test-note-view-fix.js
 */

const BASE_URL = 'http://localhost:3000';

// Get token and note ID from environment or command line
const TOKEN = process.env.TOKEN;
const NOTE_ID = process.env.NOTE_ID || '692c8f52108187d6d92e8bb1'; // Your example ID

// Colors for output
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
  console.log('='.repeat(70));
}

function logTest(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  log(`${icon} ${name}`, color);
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function testAPI(endpoint, token, expectedStatus) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    log(`\n📡 Testing: ${url}`, 'blue');
    
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    
    log(`📊 Status: ${response.status}`, response.ok ? 'green' : 'red');
    
    let data;
    try {
      data = await response.json();
      log(`📦 Response: ${JSON.stringify(data, null, 2).substring(0, 200)}...`, 'blue');
    } catch (e) {
      log(`❌ Failed to parse JSON response`, 'red');
      return { success: false, status: response.status, error: 'Invalid JSON' };
    }
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      data,
    };
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  log('\n🔧 NOTE VIEW BUG FIX - COMPREHENSIVE TEST\n', 'cyan');
  
  let totalTests = 0;
  let passedTests = 0;

  // ============================================================
  // TEST 1: Invalid ObjectId Format
  // ============================================================
  logSection('TEST 1: Invalid ObjectId Format');
  
  totalTests++;
  log('Testing with invalid ObjectId: "invalid123"', 'blue');
  const invalidIdTest = await testAPI('/api/notes/invalid123', TOKEN, 400);
  
  if (invalidIdTest.success && invalidIdTest.data?.error === 'Invalid note ID') {
    passedTests++;
    logTest('Returns 400 for invalid ObjectId', true, invalidIdTest.data.message);
  } else {
    logTest('Returns 400 for invalid ObjectId', false, `Got ${invalidIdTest.status}`);
  }

  // ============================================================
  // TEST 2: No Authentication Token
  // ============================================================
  logSection('TEST 2: No Authentication Token');
  
  totalTests++;
  log('Testing without token', 'blue');
  const noAuthTest = await testAPI(`/api/notes/${NOTE_ID}`, null, 401);
  
  if (noAuthTest.success && noAuthTest.data?.error === 'Unauthorized') {
    passedTests++;
    logTest('Returns 401 without token', true, noAuthTest.data.message);
  } else {
    logTest('Returns 401 without token', false, `Got ${noAuthTest.status}`);
  }

  // ============================================================
  // TEST 3: Valid Note ID (if token provided)
  // ============================================================
  logSection('TEST 3: Valid Note ID with Authentication');
  
  if (!TOKEN) {
    log('⚠️  Skipping - No TOKEN provided', 'yellow');
    log('   To test with authentication:', 'yellow');
    log('   1. Login to your app', 'yellow');
    log('   2. Get token: localStorage.getItem("token")', 'yellow');
    log('   3. Run: TOKEN=your_token node test-note-view-fix.js', 'yellow');
  } else {
    totalTests++;
    log(`Testing with valid token and note ID: ${NOTE_ID}`, 'blue');
    const validTest = await testAPI(`/api/notes/${NOTE_ID}`, TOKEN, 200);
    
    if (validTest.success && validTest.data?.success && validTest.data?.note) {
      passedTests++;
      logTest('Returns 200 with note data', true, `Title: ${validTest.data.note.title}`);
      
      // Verify all required fields
      const note = validTest.data.note;
      const requiredFields = ['id', 'title', 'content', 'color', 'createdAt', 'updatedAt'];
      const missingFields = requiredFields.filter(field => !note[field]);
      
      if (missingFields.length === 0) {
        log('   ✅ All required fields present', 'green');
      } else {
        log(`   ❌ Missing fields: ${missingFields.join(', ')}`, 'red');
      }
    } else if (validTest.status === 404) {
      log('⚠️  Note not found - this is expected if note doesn\'t exist', 'yellow');
      log(`   Message: ${validTest.data?.message}`, 'yellow');
    } else if (validTest.status === 403) {
      log('⚠️  Access denied - you may not have permission', 'yellow');
      log(`   Message: ${validTest.data?.message}`, 'yellow');
    } else {
      logTest('Returns 200 with note data', false, `Got ${validTest.status}`);
    }
  }

  // ============================================================
  // TEST 4: Non-existent Note ID
  // ============================================================
  logSection('TEST 4: Non-existent Note ID');
  
  if (TOKEN) {
    totalTests++;
    const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
    log(`Testing with non-existent note ID: ${fakeId}`, 'blue');
    const notFoundTest = await testAPI(`/api/notes/${fakeId}`, TOKEN, 404);
    
    if (notFoundTest.success && notFoundTest.data?.error === 'Note not found') {
      passedTests++;
      logTest('Returns 404 for non-existent note', true, notFoundTest.data.message);
    } else {
      logTest('Returns 404 for non-existent note', false, `Got ${notFoundTest.status}`);
    }
  } else {
    log('⚠️  Skipping - No TOKEN provided', 'yellow');
  }

  // ============================================================
  // FINAL RESULTS
  // ============================================================
  logSection('TEST RESULTS');
  
  const percentage = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
  const allPassed = passedTests === totalTests;
  
  log(`\nTests Passed: ${passedTests}/${totalTests} (${percentage}%)`, allPassed ? 'green' : 'yellow');
  
  if (allPassed) {
    log('\n🎉 ALL TESTS PASSED! The note view bug is fixed!', 'green');
  } else {
    log('\n⚠️  Some tests failed. Check the details above.', 'yellow');
  }

  // ============================================================
  // DEBUGGING GUIDE
  // ============================================================
  logSection('DEBUGGING GUIDE');
  
  log('\n📋 If you see "Error Loading Note", check:', 'cyan');
  log('   1. Browser Console (F12) - Look for console.log messages', 'yellow');
  log('   2. Terminal - Check API logs with emoji prefixes', 'yellow');
  log('   3. MongoDB - Verify the note exists in database', 'yellow');
  log('   4. Token - Ensure you\'re logged in', 'yellow');
  log('   5. Workspace - Verify you have access to the workspace\n', 'yellow');
  
  log('🔍 Console Log Prefixes:', 'cyan');
  log('   [Frontend] - Client-side logs', 'yellow');
  log('   [API] - Server-side API logs', 'yellow');
  log('   [MongoDB] - Database connection logs\n', 'yellow');
  
  log('📝 Expected Behavior:', 'cyan');
  log('   ✅ Valid note → Shows title and content', 'green');
  log('   ❌ Invalid ID → "Invalid note ID format"', 'red');
  log('   ❌ Not found → "This note does not exist or has been deleted"', 'red');
  log('   ❌ No access → "You do not have permission to view this note"', 'red');
  log('   ❌ No token → "Please login to view this note"', 'red');
  log('   ❌ DB error → "Database connection failed"\n', 'red');
  
  log('🚀 Next Steps:', 'cyan');
  log('   1. Start dev server: npm run dev', 'yellow');
  log('   2. Open browser: http://localhost:3000', 'yellow');
  log('   3. Login to your account', 'yellow');
  log('   4. Create a test note', 'yellow');
  log('   5. Click "View Note"', 'yellow');
  log('   6. Check browser console and terminal for logs\n', 'yellow');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
