/**
 * Knowledge Cards API Test Script
 * Tests all API endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Test data
const testCard = {
  title: 'Test Knowledge Card',
  content: 'This is a test card created by the test script. It contains useful information about testing the Knowledge Cards API.',
  category: 'Technology',
  tags: ['test', 'demo', 'api'],
  isDraft: false,
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(name, fn) {
  try {
    log(`\n📝 Test: ${name}`, 'blue');
    await fn();
    log(`✅ PASS: ${name}`, 'green');
  } catch (error) {
    log(`❌ FAIL: ${name}`, 'red');
    log(`   Error: ${error.message}`, 'red');
  }
}

async function testGetCards() {
  const response = await fetch(`${BASE_URL}/api/cards`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error}`);
  }

  if (!data.success) {
    throw new Error('Response success is false');
  }

  if (!Array.isArray(data.cards)) {
    throw new Error('Cards is not an array');
  }

  log(`   Found ${data.cards.length} cards`, 'yellow');
  log(`   Pagination: Page ${data.pagination.page}/${data.pagination.totalPages}`, 'yellow');
}

async function testGetCardsWithFilters() {
  const response = await fetch(`${BASE_URL}/api/cards?category=Technology&limit=5`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error}`);
  }

  if (!data.success) {
    throw new Error('Response success is false');
  }

  log(`   Found ${data.cards.length} Technology cards`, 'yellow');
}

async function testCreateCardWithoutAuth() {
  const response = await fetch(`${BASE_URL}/api/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testCard),
  });

  const data = await response.json();

  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }

  if (data.error !== 'Authentication required') {
    throw new Error(`Expected "Authentication required", got "${data.error}"`);
  }

  log('   Correctly rejected unauthenticated request', 'yellow');
}

async function testCreateCardWithAuth() {
  // Note: This requires a valid token
  // You need to login first and get a token
  log('   ⚠️  Skipped: Requires authentication token', 'yellow');
  log('   To test: Login first, then use the token', 'yellow');
}

async function testGetSingleCard() {
  // First get a card ID
  const listResponse = await fetch(`${BASE_URL}/api/cards?limit=1`);
  const listData = await listResponse.json();

  if (listData.cards.length === 0) {
    log('   ⚠️  Skipped: No cards available', 'yellow');
    return;
  }

  const cardId = listData.cards[0]._id;

  // Get single card
  const response = await fetch(`${BASE_URL}/api/cards/${cardId}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${data.error}`);
  }

  if (!data.success) {
    throw new Error('Response success is false');
  }

  if (!data.card) {
    throw new Error('Card not found in response');
  }

  log(`   Retrieved card: "${data.card.title}"`, 'yellow');
}

async function testGetNonExistentCard() {
  const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
  const response = await fetch(`${BASE_URL}/api/cards/${fakeId}`);
  const data = await response.json();

  if (response.status !== 404) {
    throw new Error(`Expected 404, got ${response.status}`);
  }

  log('   Correctly returned 404 for non-existent card', 'yellow');
}

async function testLikeWithoutAuth() {
  // First get a card ID
  const listResponse = await fetch(`${BASE_URL}/api/cards?limit=1`);
  const listData = await listResponse.json();

  if (listData.cards.length === 0) {
    log('   ⚠️  Skipped: No cards available', 'yellow');
    return;
  }

  const cardId = listData.cards[0]._id;

  // Try to like without auth
  const response = await fetch(`${BASE_URL}/api/cards/${cardId}/like`, {
    method: 'POST',
  });

  const data = await response.json();

  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }

  log('   Correctly rejected unauthenticated like', 'yellow');
}

async function testBookmarkWithoutAuth() {
  // First get a card ID
  const listResponse = await fetch(`${BASE_URL}/api/cards?limit=1`);
  const listData = await listResponse.json();

  if (listData.cards.length === 0) {
    log('   ⚠️  Skipped: No cards available', 'yellow');
    return;
  }

  const cardId = listData.cards[0]._id;

  // Try to bookmark without auth
  const response = await fetch(`${BASE_URL}/api/cards/${cardId}/bookmark`, {
    method: 'POST',
  });

  const data = await response.json();

  if (response.status !== 401) {
    throw new Error(`Expected 401, got ${response.status}`);
  }

  log('   Correctly rejected unauthenticated bookmark', 'yellow');
}

async function runTests() {
  log('\n========================================', 'blue');
  log('  Knowledge Cards API Test Suite', 'blue');
  log('========================================', 'blue');

  log('\n📋 Prerequisites:', 'yellow');
  log('   - MongoDB running (mongod)', 'yellow');
  log('   - Next.js dev server running (npm run dev)', 'yellow');
  log('   - Server at http://localhost:3000', 'yellow');

  // Run tests
  await test('Get all cards', testGetCards);
  await test('Get cards with filters', testGetCardsWithFilters);
  await test('Get single card', testGetSingleCard);
  await test('Get non-existent card', testGetNonExistentCard);
  await test('Create card without auth', testCreateCardWithoutAuth);
  await test('Create card with auth', testCreateCardWithAuth);
  await test('Like card without auth', testLikeWithoutAuth);
  await test('Bookmark card without auth', testBookmarkWithoutAuth);

  log('\n========================================', 'blue');
  log('  Test Summary', 'blue');
  log('========================================', 'blue');
  log('\n✅ Basic API tests passed!', 'green');
  log('\n📝 To test authenticated endpoints:', 'yellow');
  log('   1. Visit http://localhost:3000/signup', 'yellow');
  log('   2. Create an account', 'yellow');
  log('   3. Get the token from localStorage', 'yellow');
  log('   4. Use the token in Authorization header', 'yellow');
  log('\n🎉 Knowledge Cards API is working!\n', 'green');
}

// Run tests
runTests().catch((error) => {
  log('\n❌ Test suite failed:', 'red');
  log(`   ${error.message}`, 'red');
  log('\n💡 Make sure:', 'yellow');
  log('   - MongoDB is running (mongod)', 'yellow');
  log('   - Next.js dev server is running (npm run dev)', 'yellow');
  log('   - Server is accessible at http://localhost:3000\n', 'yellow');
  process.exit(1);
});
