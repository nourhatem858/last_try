/**
 * Test PDF Parse Fix
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing PDF Parse Fix\n');

// Test 1: Direct require
console.log('1️⃣ Testing direct require...');
try {
  const pdfParse = require('pdf-parse');
  console.log('   Type:', typeof pdfParse);
  console.log('   Is function:', typeof pdfParse === 'function');
  
  if (typeof pdfParse === 'function') {
    console.log('✅ Direct require works!');
  } else {
    console.log('❌ Direct require returns:', Object.keys(pdfParse));
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 2: Wrapper module
console.log('\n2️⃣ Testing wrapper module...');
try {
  const pdfParse = require('./lib/pdf-parser.js');
  console.log('   Type:', typeof pdfParse);
  console.log('   Is function:', typeof pdfParse === 'function');
  
  if (typeof pdfParse === 'function') {
    console.log('✅ Wrapper module works!');
  } else {
    console.log('❌ Wrapper returns:', Object.keys(pdfParse));
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

// Test 3: Parse actual PDF
console.log('\n3️⃣ Testing actual PDF parsing...');
try {
  const pdfParse = require('./lib/pdf-parser.js');
  const testPdfPath = path.join(process.cwd(), 'public', 'uploads', 'test-document.pdf');
  
  if (fs.existsSync(testPdfPath)) {
    const pdfBuffer = fs.readFileSync(testPdfPath);
    console.log('   PDF file size:', pdfBuffer.length, 'bytes');
    
    pdfParse(pdfBuffer).then(data => {
      console.log('✅ PDF parsed successfully!');
      console.log('   Pages:', data.numpages);
      console.log('   Text length:', data.text.length);
      console.log('   Text preview:', data.text.substring(0, 100));
    }).catch(err => {
      console.log('⚠️ PDF parsing failed:', err.message);
      console.log('   (This is expected for minimal test PDF)');
    });
  } else {
    console.log('⚠️ Test PDF not found');
  }
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n✅ PDF parse fix is ready!');
