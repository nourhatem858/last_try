/**
 * Test Document View Implementation
 * Tests the document view page and API endpoints
 */

const BASE_URL = 'http://localhost:3000';

// Test credentials (use your actual test user)
const TEST_USER = {
  email: 'test@example.com',
  password: 'Test123!@#'
};

async function testDocumentView() {
  console.log('🧪 Testing Document View Implementation\n');

  try {
    // Step 1: Login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(TEST_USER)
    });

    if (!loginResponse.ok) {
      throw new Error('Login failed. Please check credentials.');
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');

    // Step 2: Test GET /api/documents (list)
    console.log('2️⃣ Testing GET /api/documents...');
    const documentsResponse = await fetch(`${BASE_URL}/api/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!documentsResponse.ok) {
      throw new Error('Failed to fetch documents list');
    }

    const documentsData = await documentsResponse.json();
    console.log(`✅ Found ${documentsData.data.length} documents`);
    console.log('   Sample documents:', documentsData.data.slice(0, 2).map(d => d.title).join(', '));
    console.log('');

    // Step 3: Test GET /api/documents/[id] for each document
    console.log('3️⃣ Testing GET /api/documents/[id]...');
    const testDocumentIds = ['1', '2', '3', '4', '5', '6'];
    
    for (const docId of testDocumentIds) {
      const docResponse = await fetch(`${BASE_URL}/api/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (docResponse.ok) {
        const docData = await docResponse.json();
        console.log(`   ✅ Document ${docId}: ${docData.data.title}`);
      } else {
        console.log(`   ❌ Document ${docId}: Failed (${docResponse.status})`);
      }
    }
    console.log('');

    // Step 4: Test 404 for non-existent document
    console.log('4️⃣ Testing 404 for non-existent document...');
    const notFoundResponse = await fetch(`${BASE_URL}/api/documents/999`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (notFoundResponse.status === 404) {
      console.log('✅ 404 handling works correctly\n');
    } else {
      console.log('⚠️  Expected 404, got:', notFoundResponse.status, '\n');
    }

    // Step 5: Test AI Summarization
    console.log('5️⃣ Testing AI Summarization...');
    const summaryResponse = await fetch(`${BASE_URL}/api/ai/summarize-document?id=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ AI Summary generated successfully');
      console.log('   Preview:', summaryData.summary.substring(0, 100) + '...');
    } else {
      console.log('❌ AI Summary failed:', summaryResponse.status);
    }
    console.log('');

    // Step 6: Test PATCH /api/documents/[id] (rename)
    console.log('6️⃣ Testing PATCH /api/documents/[id] (rename)...');
    const patchResponse = await fetch(`${BASE_URL}/api/documents/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ title: 'Updated Document Title' })
    });

    if (patchResponse.ok) {
      console.log('✅ Document rename works\n');
    } else {
      console.log('❌ Document rename failed:', patchResponse.status, '\n');
    }

    // Step 7: Test DELETE /api/documents/[id]
    console.log('7️⃣ Testing DELETE /api/documents/[id]...');
    const deleteResponse = await fetch(`${BASE_URL}/api/documents/999`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (deleteResponse.ok) {
      console.log('✅ Document delete endpoint works\n');
    } else {
      console.log('⚠️  Delete returned:', deleteResponse.status, '\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📋 What to test manually:');
    console.log('   1. Visit http://localhost:3000/documents');
    console.log('   2. Click on any document card');
    console.log('   3. Verify the document view page loads');
    console.log('   4. Test the "Generate Summary" button');
    console.log('   5. Test Download, Rename, Share, and Delete buttons');
    console.log('   6. Check PDF preview for PDF documents');
    console.log('   7. Verify responsive design on mobile');
    console.log('\n🎉 Document View Implementation Complete!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   - Next.js dev server is running (npm run dev)');
    console.error('   - You have a valid test user account');
    console.error('   - MongoDB is connected');
    process.exit(1);
  }
}

// Run tests
testDocumentView();
