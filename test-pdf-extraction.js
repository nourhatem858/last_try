/**
 * PDF Extraction Test Script
 * Tests the pdf-parse fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 PDF Extraction Test');
console.log('======================\n');

async function testPDFParse() {
  try {
    // Test 1: Check if pdf-parse is installed
    console.log('📦 Test 1: Checking pdf-parse installation...');
    try {
      const pdfParse = require('pdf-parse');
      console.log('✅ pdf-parse is installed');
      console.log(`   Type: ${typeof pdfParse}`);
    } catch (err) {
      console.log('❌ pdf-parse is NOT installed');
      console.log('\n📝 Please install it:');
      console.log('   npm install pdf-parse');
      return;
    }

    // Test 2: Test with a sample PDF (if exists)
    console.log('\n📄 Test 2: Testing PDF extraction...');
    
    // Check if test PDF exists
    const testPDFPath = path.join(__dirname, 'test.pdf');
    if (!fs.existsSync(testPDFPath)) {
      console.log('⚠️  No test.pdf found in project root');
      console.log('   Create a test.pdf file to test extraction');
      console.log('   Or test via the API route');
      return;
    }

    const pdfParse = require('pdf-parse');
    const dataBuffer = fs.readFileSync(testPDFPath);
    
    console.log(`   File size: ${dataBuffer.length} bytes`);
    console.log('   Extracting text...');
    
    const data = await pdfParse(dataBuffer);
    
    console.log('✅ Text extracted successfully!');
    console.log(`   Pages: ${data.numpages}`);
    console.log(`   Text length: ${data.text.length} characters`);
    console.log(`   Word count: ${data.text.trim().split(/\s+/).length}`);
    
    if (data.info) {
      console.log(`   Title: ${data.info.Title || 'N/A'}`);
      console.log(`   Author: ${data.info.Author || 'N/A'}`);
    }
    
    console.log('\n📝 First 200 characters:');
    console.log('   ' + data.text.substring(0, 200).replace(/\n/g, ' '));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Make sure pdf-parse is installed: npm install pdf-parse');
    console.error('   2. Check if test.pdf exists and is valid');
    console.error('   3. Try with a different PDF file');
  }
}

async function testAPIRoute() {
  console.log('\n🌐 Test 3: Testing API Route...');
  
  try {
    const response = await fetch('http://localhost:3000/api/pdf/extract');
    console.log('⚠️  Server is running but no file uploaded');
    console.log('   Use the PDFUploader component or curl to test');
  } catch (err) {
    console.log('⚠️  Server is not running or API route not accessible');
    console.log('   Start server: npm run dev');
    console.log('   Then test with: curl -X POST http://localhost:3000/api/pdf/extract -F "file=@test.pdf"');
  }
}

// Run tests
(async () => {
  await testPDFParse();
  await testAPIRoute();
  
  console.log('\n');
  console.log('═══════════════════════════════════════');
  console.log('📚 DOCUMENTATION');
  console.log('═══════════════════════════════════════');
  console.log('Read: PDF_PARSE_FIX_COMPLETE.md');
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('1. Start server: npm run dev');
  console.log('2. Test API: curl -X POST http://localhost:3000/api/pdf/extract -F "file=@test.pdf"');
  console.log('3. Or use the PDFUploader component in your app');
  console.log('═══════════════════════════════════════\n');
})();
