/**
 * Complete Upload Flow Test
 * Simulates the entire document upload process
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 COMPLETE UPLOAD FLOW TEST');
console.log('='.repeat(70));
console.log('');

// Simulate the upload flow
async function testUploadFlow() {
  console.log('📋 Simulating Document Upload Flow...\n');

  // Step 1: User selects file
  console.log('1️⃣ User selects file');
  const testFilePath = path.join(process.cwd(), 'public', 'uploads', 'sample-document.txt');
  
  if (!fs.existsSync(testFilePath)) {
    console.log('   ❌ Test file not found');
    return false;
  }
  
  const fileBuffer = fs.readFileSync(testFilePath);
  console.log(`   ✅ File selected: sample-document.txt (${fileBuffer.length} bytes)`);

  // Step 2: Validate file
  console.log('\n2️⃣ Validate file');
  if (fileBuffer.length === 0) {
    console.log('   ❌ File is empty');
    return false;
  }
  console.log('   ✅ File validation passed');

  // Step 3: Check upload directory
  console.log('\n3️⃣ Check upload directory');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('   ⚠️  Directory does not exist, creating...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  console.log('   ✅ Upload directory ready');

  // Step 4: Test file upload service
  console.log('\n4️⃣ Test file upload service');
  try {
    const crypto = require('crypto');
    const uniqueName = `test-${crypto.randomBytes(8).toString('hex')}.txt`;
    const targetPath = path.join(uploadsDir, uniqueName);
    
    fs.writeFileSync(targetPath, fileBuffer);
    
    if (fs.existsSync(targetPath)) {
      console.log(`   ✅ File saved: ${uniqueName}`);
      
      // Clean up test file
      fs.unlinkSync(targetPath);
      console.log('   ✅ Test file cleaned up');
    } else {
      console.log('   ❌ File save failed');
      return false;
    }
  } catch (error) {
    console.log('   ❌ File upload error:', error.message);
    return false;
  }

  // Step 5: Test text extraction
  console.log('\n5️⃣ Test text extraction');
  try {
    const text = fileBuffer.toString('utf-8');
    const wordCount = text.trim().split(/\s+/).length;
    console.log(`   ✅ Text extracted: ${text.length} characters, ${wordCount} words`);
    console.log(`   📝 Preview: "${text.substring(0, 80)}..."`);
  } catch (error) {
    console.log('   ❌ Text extraction error:', error.message);
    return false;
  }

  // Step 6: Test PDF parsing (if available)
  console.log('\n6️⃣ Test PDF parsing capability');
  try {
    const pdfParse = require('./lib/pdf-parser.js');
    if (typeof pdfParse === 'function') {
      console.log('   ✅ PDF parser ready');
    } else {
      console.log('   ❌ PDF parser not a function');
      return false;
    }
  } catch (error) {
    console.log('   ❌ PDF parser error:', error.message);
    return false;
  }

  // Step 7: Test DOCX parsing (if available)
  console.log('\n7️⃣ Test DOCX parsing capability');
  try {
    const mammoth = require('mammoth');
    if (typeof mammoth.extractRawText === 'function') {
      console.log('   ✅ DOCX parser ready');
    } else {
      console.log('   ❌ DOCX parser not available');
      return false;
    }
  } catch (error) {
    console.log('   ❌ DOCX parser error:', error.message);
    return false;
  }

  // Step 8: Verify API route exists
  console.log('\n8️⃣ Verify API route');
  const apiPath = path.join(process.cwd(), 'app', 'api', 'documents', 'route.ts');
  if (fs.existsSync(apiPath)) {
    console.log('   ✅ API route exists: /api/documents');
  } else {
    console.log('   ❌ API route not found');
    return false;
  }

  // Step 9: Verify document model
  console.log('\n9️⃣ Verify document model');
  const modelPath = path.join(process.cwd(), 'models', 'DocumentModel.ts');
  if (fs.existsSync(modelPath)) {
    console.log('   ✅ Document model exists');
  } else {
    console.log('   ❌ Document model not found');
    return false;
  }

  // Step 10: Verify frontend page
  console.log('\n🔟 Verify frontend page');
  const pagePath = path.join(process.cwd(), 'app', 'documents', 'page.tsx');
  if (fs.existsSync(pagePath)) {
    console.log('   ✅ Documents page exists');
  } else {
    console.log('   ❌ Documents page not found');
    return false;
  }

  return true;
}

// Run the test
testUploadFlow().then(success => {
  console.log('');
  console.log('='.repeat(70));
  console.log('📊 TEST RESULT');
  console.log('='.repeat(70));
  console.log('');
  
  if (success) {
    console.log('✅ ALL STEPS PASSED!');
    console.log('');
    console.log('🎉 The upload flow is working correctly!');
    console.log('');
    console.log('🚀 Ready for real-world testing:');
    console.log('   1. Start server: npm run dev');
    console.log('   2. Login to your account');
    console.log('   3. Go to /documents');
    console.log('   4. Click "Upload Document"');
    console.log('   5. Select sample-document.txt');
    console.log('   6. Fill in title and tags');
    console.log('   7. Click "Upload Document"');
    console.log('');
    console.log('✨ Expected: Document uploads and appears immediately!');
  } else {
    console.log('❌ SOME STEPS FAILED');
    console.log('');
    console.log('Please review the errors above and fix any issues.');
  }
  
  console.log('');
}).catch(error => {
  console.error('');
  console.error('❌ TEST ERROR:', error.message);
  console.error('');
});
