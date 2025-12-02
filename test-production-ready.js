/**
 * Production Readiness Test Suite
 * Tests all critical functionality before deployment
 */

const axios = require('axios');
const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(category, test, status, message = '') {
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  
  log(`${icon} [${category}] ${test}${message ? ': ' + message : ''}`, color);
  
  results.tests.push({ category, test, status, message });
  
  if (status === 'pass') results.passed++;
  else if (status === 'fail') results.failed++;
  else results.warnings++;
}

async function testHealthCheck() {
  log('\n📊 Testing System Health...', 'cyan');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/health`);
    const health = response.data;
    
    // MongoDB Check
    if (health.checks.mongodb?.status === 'healthy') {
      logTest('Health', 'MongoDB Connection', 'pass', health.checks.mongodb.message);
    } else {
      logTest('Health', 'MongoDB Connection', 'fail', health.checks.mongodb?.error || 'Connection failed');
      if (health.checks.mongodb?.suggestions) {
        log(`  Suggestions:`, 'gray');
        health.checks.mongodb.suggestions.forEach(s => log(`    - ${s}`, 'gray'));
      }
    }
    
    // Environment Variables
    if (health.checks.environment?.status === 'healthy') {
      logTest('Health', 'Environment Variables', 'pass');
    } else {
      logTest('Health', 'Environment Variables', 'warn', health.checks.environment?.message);
    }
    
    // OpenAI
    if (health.checks.openai?.status === 'healthy') {
      logTest('Health', 'OpenAI Configuration', 'pass', `Model: ${health.checks.openai.model}`);
    } else {
      logTest('Health', 'OpenAI Configuration', 'warn', health.checks.openai?.message);
    }
    
    // JWT
    if (health.checks.jwt?.status === 'healthy') {
      logTest('Health', 'JWT Secret', 'pass');
    } else {
      logTest('Health', 'JWT Secret', 'warn', health.checks.jwt?.message);
    }
    
    return health.checks.mongodb?.status === 'healthy';
  } catch (error) {
    logTest('Health', 'Health Check API', 'fail', error.message);
    return false;
  }
}

async function testAuthentication() {
  log('\n🔐 Testing Authentication...', 'cyan');
  
  let token = null;
  let userId = null;
  
  // Test Signup
  try {
    const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
      name: 'Test User',
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (signupResponse.data.success) {
      token = signupResponse.data.token;
      userId = signupResponse.data.user.id;
      logTest('Auth', 'Signup', 'pass', `User created: ${TEST_EMAIL}`);
    } else {
      logTest('Auth', 'Signup', 'fail', signupResponse.data.error);
    }
  } catch (error) {
    if (error.response?.data?.error?.includes('already exists')) {
      logTest('Auth', 'Signup', 'warn', 'User already exists (using existing account)');
      // Try to login instead
      try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });
        token = loginResponse.data.token;
        userId = loginResponse.data.user.id;
      } catch (loginError) {
        logTest('Auth', 'Signup/Login', 'fail', 'Could not create or login to test account');
        return null;
      }
    } else {
      logTest('Auth', 'Signup', 'fail', error.response?.data?.error || error.message);
      return null;
    }
  }
  
  // Test Login
  try {
    const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (loginResponse.data.success && loginResponse.data.token) {
      token = loginResponse.data.token;
      logTest('Auth', 'Login', 'pass', 'Token received');
    } else {
      logTest('Auth', 'Login', 'fail', 'No token received');
    }
  } catch (error) {
    logTest('Auth', 'Login', 'fail', error.response?.data?.error || error.message);
  }
  
  // Test Invalid Login
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: 'WrongPassword123!',
    });
    logTest('Auth', 'Invalid Login Protection', 'fail', 'Should reject invalid password');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Auth', 'Invalid Login Protection', 'pass', 'Correctly rejected');
    } else {
      logTest('Auth', 'Invalid Login Protection', 'fail', 'Unexpected error');
    }
  }
  
  // Test Email Trimming/Lowercasing
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: `  ${TEST_EMAIL.toUpperCase()}  `,
      password: TEST_PASSWORD,
    });
    
    if (response.data.success) {
      logTest('Auth', 'Email Normalization', 'pass', 'Handles spaces and case');
    } else {
      logTest('Auth', 'Email Normalization', 'fail', 'Should handle email variations');
    }
  } catch (error) {
    logTest('Auth', 'Email Normalization', 'fail', error.message);
  }
  
  return { token, userId };
}

async function testProfile(token) {
  log('\n👤 Testing Profile...', 'cyan');
  
  if (!token) {
    logTest('Profile', 'All Tests', 'fail', 'No authentication token');
    return;
  }
  
  // Test Profile Fetch
  try {
    const response = await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success && response.data.user) {
      const user = response.data.user;
      logTest('Profile', 'Fetch Profile', 'pass', `Loaded: ${user.email}`);
      
      // Verify it's the current user's profile
      if (user.email === TEST_EMAIL) {
        logTest('Profile', 'User-Specific Data', 'pass', 'Returns only current user');
      } else {
        logTest('Profile', 'User-Specific Data', 'fail', 'Returned wrong user data');
      }
      
      // Check null safety
      const hasNullIssues = Object.values(user).some(v => v === null && typeof v !== 'object');
      if (!hasNullIssues) {
        logTest('Profile', 'Null Value Handling', 'pass', 'No null issues');
      } else {
        logTest('Profile', 'Null Value Handling', 'warn', 'Some null values present');
      }
    } else {
      logTest('Profile', 'Fetch Profile', 'fail', 'No user data returned');
    }
  } catch (error) {
    logTest('Profile', 'Fetch Profile', 'fail', error.response?.data?.error || error.message);
  }
  
  // Test Profile Update
  try {
    const response = await axios.put(
      `${BASE_URL}/api/profile`,
      { name: 'Updated Test User', bio: 'Test bio' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success) {
      logTest('Profile', 'Update Profile', 'pass', 'Profile updated');
    } else {
      logTest('Profile', 'Update Profile', 'fail', 'Update failed');
    }
  } catch (error) {
    logTest('Profile', 'Update Profile', 'fail', error.response?.data?.error || error.message);
  }
}

async function testWorkspaces(token, userId) {
  log('\n📁 Testing Workspaces...', 'cyan');
  
  if (!token) {
    logTest('Workspaces', 'All Tests', 'fail', 'No authentication token');
    return null;
  }
  
  let workspaceId = null;
  
  // Test Create Workspace
  try {
    const response = await axios.post(
      `${BASE_URL}/api/workspaces`,
      {
        name: 'Test Workspace',
        description: 'Automated test workspace',
        color: 'blue',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success && response.data.data) {
      workspaceId = response.data.data.id;
      logTest('Workspaces', 'Create Workspace', 'pass', `ID: ${workspaceId}`);
    } else {
      logTest('Workspaces', 'Create Workspace', 'fail', 'No workspace created');
    }
  } catch (error) {
    logTest('Workspaces', 'Create Workspace', 'fail', error.response?.data?.error || error.message);
  }
  
  // Test List Workspaces
  try {
    const response = await axios.get(`${BASE_URL}/api/workspaces`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      const userWorkspaces = response.data.data.filter(w => w.owner === userId);
      logTest('Workspaces', 'List Workspaces', 'pass', `Found ${response.data.data.length} workspaces`);
      
      if (userWorkspaces.length === response.data.data.length) {
        logTest('Workspaces', 'User-Specific Data', 'pass', 'Only user workspaces returned');
      } else {
        logTest('Workspaces', 'User-Specific Data', 'warn', 'May include shared workspaces');
      }
    } else {
      logTest('Workspaces', 'List Workspaces', 'fail', 'Invalid response');
    }
  } catch (error) {
    logTest('Workspaces', 'List Workspaces', 'fail', error.response?.data?.error || error.message);
  }
  
  return workspaceId;
}

async function testNotes(token, workspaceId) {
  log('\n📝 Testing Notes...', 'cyan');
  
  if (!token || !workspaceId) {
    logTest('Notes', 'All Tests', 'fail', 'Missing token or workspace');
    return;
  }
  
  let noteId = null;
  
  // Test Create Note
  try {
    const response = await axios.post(
      `${BASE_URL}/api/notes`,
      {
        title: 'Test Note',
        content: 'This is a test note created by automated testing',
        workspaceId: workspaceId,
        tags: ['test', 'automated'],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success && response.data.data) {
      noteId = response.data.data.id;
      logTest('Notes', 'Create Note', 'pass', `ID: ${noteId}`);
    } else {
      logTest('Notes', 'Create Note', 'fail', 'No note created');
    }
  } catch (error) {
    logTest('Notes', 'Create Note', 'fail', error.response?.data?.error || error.message);
  }
  
  // Test List Notes
  try {
    const response = await axios.get(`${BASE_URL}/api/notes?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      logTest('Notes', 'List Notes', 'pass', `Found ${response.data.data.length} notes`);
      
      // Check if newly created note appears
      if (noteId && response.data.data.some(n => n.id === noteId)) {
        logTest('Notes', 'Immediate Visibility', 'pass', 'New note appears in list');
      } else if (noteId) {
        logTest('Notes', 'Immediate Visibility', 'fail', 'New note not in list');
      }
    } else {
      logTest('Notes', 'List Notes', 'fail', 'Invalid response');
    }
  } catch (error) {
    logTest('Notes', 'List Notes', 'fail', error.response?.data?.error || error.message);
  }
  
  // Test Get Single Note
  if (noteId) {
    try {
      const response = await axios.get(`${BASE_URL}/api/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success && response.data.data) {
        logTest('Notes', 'Get Note by ID', 'pass', 'Note retrieved');
      } else {
        logTest('Notes', 'Get Note by ID', 'fail', 'Note not found');
      }
    } catch (error) {
      if (error.response?.status === 404) {
        logTest('Notes', 'Get Note by ID', 'fail', 'Note not found (404)');
      } else {
        logTest('Notes', 'Get Note by ID', 'fail', error.response?.data?.error || error.message);
      }
    }
  }
}

async function testDocuments(token, workspaceId) {
  log('\n📄 Testing Documents...', 'cyan');
  
  if (!token || !workspaceId) {
    logTest('Documents', 'All Tests', 'fail', 'Missing token or workspace');
    return;
  }
  
  // Test List Documents
  try {
    const response = await axios.get(`${BASE_URL}/api/documents?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success && Array.isArray(response.data.data)) {
      logTest('Documents', 'List Documents', 'pass', `Found ${response.data.data.length} documents`);
    } else {
      logTest('Documents', 'List Documents', 'fail', 'Invalid response');
    }
  } catch (error) {
    logTest('Documents', 'List Documents', 'fail', error.response?.data?.error || error.message);
  }
}

async function testAI(token) {
  log('\n🤖 Testing AI Features...', 'cyan');
  
  if (!token) {
    logTest('AI', 'All Tests', 'fail', 'No authentication token');
    return;
  }
  
  // Test AI Chat
  try {
    const response = await axios.post(
      `${BASE_URL}/api/ai/chat`,
      {
        message: 'Hello, this is a test message',
        conversationHistory: [],
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    if (response.data.success && response.data.response) {
      logTest('AI', 'Chat Endpoint', 'pass', 'AI responded');
    } else {
      logTest('AI', 'Chat Endpoint', 'fail', 'No AI response');
    }
  } catch (error) {
    if (error.response?.data?.error?.includes('API key')) {
      logTest('AI', 'Chat Endpoint', 'warn', 'OpenAI API key not configured');
    } else {
      logTest('AI', 'Chat Endpoint', 'fail', error.response?.data?.error || error.message);
    }
  }
  
  // Test Search
  try {
    const response = await axios.get(`${BASE_URL}/api/search?q=test`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (response.data.success) {
      logTest('AI', 'Search Endpoint', 'pass', `Found ${response.data.results?.length || 0} results`);
    } else {
      logTest('AI', 'Search Endpoint', 'fail', 'Search failed');
    }
  } catch (error) {
    logTest('AI', 'Search Endpoint', 'fail', error.response?.data?.error || error.message);
  }
}

async function testErrorHandling() {
  log('\n⚠️ Testing Error Handling...', 'cyan');
  
  // Test unauthorized access
  try {
    await axios.get(`${BASE_URL}/api/profile`);
    logTest('Error Handling', 'Unauthorized Access', 'fail', 'Should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Error Handling', 'Unauthorized Access', 'pass', 'Correctly rejected');
    } else {
      logTest('Error Handling', 'Unauthorized Access', 'fail', 'Unexpected error');
    }
  }
  
  // Test invalid token
  try {
    await axios.get(`${BASE_URL}/api/profile`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    logTest('Error Handling', 'Invalid Token', 'fail', 'Should reject invalid token');
  } catch (error) {
    if (error.response?.status === 401) {
      logTest('Error Handling', 'Invalid Token', 'pass', 'Correctly rejected');
    } else {
      logTest('Error Handling', 'Invalid Token', 'fail', 'Unexpected error');
    }
  }
  
  // Test missing required fields
  try {
    await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      // Missing password
    });
    logTest('Error Handling', 'Missing Fields', 'fail', 'Should require all fields');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Error Handling', 'Missing Fields', 'pass', 'Correctly rejected');
    } else {
      logTest('Error Handling', 'Missing Fields', 'fail', 'Unexpected error');
    }
  }
}

function generateReport() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const total = results.passed + results.failed + results.warnings;
  const passRate = total > 0 ? ((results.passed / total) * 100).toFixed(1) : 0;
  
  log(`\nTotal Tests: ${total}`, 'blue');
  log(`✅ Passed: ${results.passed}`, 'green');
  log(`❌ Failed: ${results.failed}`, 'red');
  log(`⚠️  Warnings: ${results.warnings}`, 'yellow');
  log(`\nPass Rate: ${passRate}%`, passRate >= 80 ? 'green' : passRate >= 60 ? 'yellow' : 'red');
  
  // Production readiness assessment
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 PRODUCTION READINESS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const criticalFailed = results.tests.filter(t => 
    t.status === 'fail' && 
    (t.category === 'Health' || t.category === 'Auth')
  ).length;
  
  if (criticalFailed === 0 && results.failed === 0) {
    log('\n✅ READY FOR PRODUCTION', 'green');
    log('All critical systems are operational.', 'green');
  } else if (criticalFailed === 0 && results.failed < 3) {
    log('\n⚠️  MOSTLY READY', 'yellow');
    log('Some non-critical issues detected. Review before deployment.', 'yellow');
  } else {
    log('\n❌ NOT READY FOR PRODUCTION', 'red');
    log('Critical issues detected. Fix before deployment.', 'red');
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      passRate: parseFloat(passRate),
    },
    tests: results.tests,
    productionReady: criticalFailed === 0 && results.failed === 0,
  };
  
  fs.writeFileSync('test-production-ready-report.json', JSON.stringify(report, null, 2));
  log('\n📄 Detailed report saved to: test-production-ready-report.json', 'gray');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

async function runAllTests() {
  log('🚀 Starting Production Readiness Tests...', 'blue');
  log(`Base URL: ${BASE_URL}\n`, 'gray');
  
  try {
    // 1. Health Check (critical)
    const isHealthy = await testHealthCheck();
    
    if (!isHealthy) {
      log('\n⚠️  MongoDB connection failed. Some tests may not work.', 'yellow');
    }
    
    // 2. Authentication
    const auth = await testAuthentication();
    
    // 3. Profile
    if (auth?.token) {
      await testProfile(auth.token);
      
      // 4. Workspaces
      const workspaceId = await testWorkspaces(auth.token, auth.userId);
      
      // 5. Notes
      if (workspaceId) {
        await testNotes(auth.token, workspaceId);
        
        // 6. Documents
        await testDocuments(auth.token, workspaceId);
      }
      
      // 7. AI Features
      await testAI(auth.token);
    }
    
    // 8. Error Handling
    await testErrorHandling();
    
    // Generate final report
    generateReport();
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);
  } catch (error) {
    log(`\n❌ Test suite error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
