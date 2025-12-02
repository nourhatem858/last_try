/**
 * Simple PDF Upload Test
 * Tests the /api/pdf/extract endpoint
 */

const fs = require('fs');
const path = require('path');

async function testPDFExtraction() {
  console.log('🧪 Testing PDF Extraction API\n');

  // Check if test PDF exists
  const testPDFPath = path.join(__dirname, 'test.pdf');
  
  if (!fs.existsSync(testPDFPath)) {
    console.log('⚠️  No test.pdf found. Creating a simple test...\n');
    console.log('Please place a PDF file named "test.pdf" in the project root to test.\n');
    console.log('For now, testing with FormData structure...\n');
  }

  try {
    // Dynamic import for fetch (Node 18+)
    const fetch = (await import('node-fetch')).default;
    const FormData = (await import('form-data')).default;

    const formData = new FormData();
    
    if (fs.existsSync(testPDFPath)) {
      const fileBuffer = fs.readFileSync(testPDFPath);
      formData.append('file', fileBuffer, {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

      console.log('📤 Uploading PDF to http://localhost:3000/api/pdf/extract\n');

      const response = await fetch('http://localhost:3000/api/pdf/extract', {
        method: 'POST',
        body: formData,
        headers: formData.getHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ SUCCESS!\n');
        console.log('📊 Metadata:');
        console.log('  - Title:', data.metadata?.title);
        console.log('  - Pages:', data.metadata?.pages);
        console.log('  - Words:', data.metadata?.wordCount);
        console.log('  - Author:', data.metadata?.author);
        console.log('\n📄 Text Preview:');
        console.log(data.text?.substring(0, 200) + '...\n');
      } else {
        console.log('❌ FAILED:', data.error);
      }
    } else {
      console.log('📝 Manual Test Instructions:\n');
      console.log('1. Start the dev server: npm run dev');
      console.log('2. Visit: http://localhost:3000/test-pdf');
      console.log('3. Upload a PDF file');
      console.log('4. Verify text extraction works\n');
    }

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('  1. Dev server is running (npm run dev)');
    console.log('  2. Server is accessible at http://localhost:3000');
    console.log('  3. pdf-parse is installed (npm install pdf-parse@2.4.5)');
  }
}

testPDFExtraction();
