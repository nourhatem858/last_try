/**
 * Axios API Connection Test Script
 * Tests API connectivity and diagnoses common issues
 */

const axios = require('axios');

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

async function testServerConnection() {
  log('\n========================================', 'blue');
  log('  Axios API Connection Test', 'blue');
  log('========================================\n', 'blue');
  
  const baseURL = 'http://localhost:3000';
  const endpoint = '/api/auth/signup';
  const fullURL = `${baseURL}${endpoint}`;
  
  log('📋 Test Configuration:', 'cyan');
  log(`   Base URL: ${baseURL}`, 'yellow');
  log(`   Endpoint: ${endpoint}`, 'yellow');
  log(`   Full URL: ${fullURL}`, 'yellow');
  log('');
  
  // Test 1: Check if server is reachable
  log('Test 1: Checking if server is reachable...', 'blue');
  try {
    const response = await axios.get(baseURL, { timeout: 3000 });
    log('✅ Server is reachable!', 'green');
    log(`   Status: ${response.status}`, 'yellow');
  } catch (error) {
    log('❌ Server is NOT reachable!', 'red');
    log('   💡 Make sure Next.js dev server is running:', 'yellow');
    log('      npm run dev', 'cyan');
    return;
  }
  
  // Test 2: Check if API route exists
  log('\nTest 2: Testing API route...', 'blue');
  try {
    const response = await axios.post(fullURL, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    log('✅ API route works!', 'green');
    log(`   Status: ${response.status}`, 'yellow');
    log(`   Response:`, 'yellow');
    console.log(response.data);
    
  } catch (error) {
    log('❌ API route failed!', 'red');
    
    if (axios.isAxiosError(error)) {
      log('\n📋 Error Analysis:', 'cyan');
      log(`   Message: ${error.message}`, 'yellow');
      log(`   Code: ${error.code || 'N/A'}`, 'yellow');
      
      if (error.config) {
        log('\n📤 Request Details:', 'cyan');
        log(`   Method: ${error.config.method?.toUpperCase()}`, 'yellow');
        log(`   URL: ${error.config.url}`, 'yellow');
        log(`   BaseURL: ${error.config.baseURL || 'N/A'}`, 'yellow');
        log(`   Timeout: ${error.config.timeout}ms`, 'yellow');
      } else {
        log('\n⚠️  No request config (request setup failed)', 'yellow');
      }
      
      if (error.response) {
        log('\n📥 Response Details:', 'cyan');
        log(`   Status: ${error.response.status}`, 'yellow');
        log(`   Status Text: ${error.response.statusText}`, 'yellow');
        log(`   Data:`, 'yellow');
        console.log(error.response.data);
        
        // Specific error diagnosis
        log('\n🔍 Diagnosis:', 'cyan');
        if (error.response.status === 404) {
          log('   ⚠️  API route not found', 'red');
          log('   💡 Check if file exists: app/api/auth/signup/route.ts', 'yellow');
        } else if (error.response.status === 500) {
          log('   ⚠️  Server error', 'red');
          log('   💡 Check server console for error details', 'yellow');
        } else if (error.response.status === 400) {
          log('   ⚠️  Bad request - validation error', 'red');
          log('   💡 Check request data format', 'yellow');
        } else if (error.response.status === 409) {
          log('   ⚠️  Conflict - email already exists', 'yellow');
          log('   💡 This is expected behavior', 'yellow');
        }
      } else {
        log('\n📥 No Response Received', 'cyan');
        
        // Network error diagnosis
        log('\n🔍 Diagnosis:', 'cyan');
        if (error.code === 'ECONNABORTED') {
          log('   ⚠️  Request timeout', 'red');
          log('   💡 Server is too slow or not responding', 'yellow');
          log('   💡 Try increasing timeout or check server performance', 'yellow');
        } else if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          log('   ⚠️  Network error', 'red');
          log('   💡 Possible causes:', 'yellow');
          log('      - Server not running (npm run dev)', 'cyan');
          log('      - Wrong baseURL or endpoint', 'cyan');
          log('      - CORS blocking request', 'cyan');
          log('      - Firewall blocking connection', 'cyan');
        } else if (error.code === 'ECONNREFUSED') {
          log('   ⚠️  Connection refused', 'red');
          log('   💡 Server is not running on port 3000', 'yellow');
          log('   💡 Start server with: npm run dev', 'yellow');
        } else {
          log('   ⚠️  Unknown network error', 'red');
          log(`   💡 Error code: ${error.code}`, 'yellow');
        }
      }
    } else {
      log('\n❌ Unknown error type:', 'red');
      console.log(error);
    }
  }
  
  // Test 3: Test with invalid data
  log('\n\nTest 3: Testing validation (should fail)...', 'blue');
  try {
    await axios.post(fullURL, {
      name: 'A', // Too short
      email: 'invalid-email',
      password: '123', // Too short
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    log('⚠️  Validation should have failed but didn\'t', 'yellow');
    
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 400) {
      log('✅ Validation working correctly!', 'green');
      log(`   Error: ${JSON.stringify(error.response.data)}`, 'yellow');
    } else {
      log('❌ Unexpected error during validation test', 'red');
    }
  }
  
  // Summary
  log('\n========================================', 'blue');
  log('  Test Summary', 'blue');
  log('========================================\n', 'blue');
  
  log('✅ Tests completed!', 'green');
  log('\n💡 Next Steps:', 'cyan');
  log('   1. If server is not reachable: npm run dev', 'yellow');
  log('   2. If API route not found: Check app/api/auth/signup/route.ts', 'yellow');
  log('   3. If validation errors: Check request data format', 'yellow');
  log('   4. Check browser Network tab for more details', 'yellow');
  log('');
}

// Run tests
testServerConnection().catch((error) => {
  log('\n❌ Test suite failed:', 'red');
  log(`   ${error.message}`, 'red');
  log('');
  process.exit(1);
});
