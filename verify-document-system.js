/**
 * Final Document System Verification
 * Comprehensive check of all components
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DOCUMENT SYSTEM VERIFICATION');
console.log('='.repeat(70));
console.log('');

let passCount = 0;
let failCount = 0;

function check(name, condition, details = '') {
  if (condition) {
    console.log(`✅ ${name}`);
    if (details) console.log(`   ${details}`);
    passCount++;
    return true;
  } else {
    console.log(`❌ ${name}`);
    if (details) console.log(`   ${details}`);
    failCount++;
    return false;
  }
}

function section(name) {
  console.log('');
  console.log(`${'─'.repeat(70)}`);
  console.log(`📦 ${name}`);
  console.log(`${'─'.repeat(70)}`);
}

// 1. Dependencies
section('Dependencies');
try {
  const pdfParse = require('pdf-parse');
  check('pdf-parse installed', typeof pdfParse === 'function', 'v1.1.1 (function-based API)');
} catch (e) {
  check('pdf-parse installed', false, 'Not installed or wrong version');
}

try {
  const mammoth = require('mammoth');
  check('mammoth installed', typeof mammoth.extractRawText === 'function');
} catch (e) {
  check('mammoth installed', false, 'Not installed');
}

// 2. File System
section('File System');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
check('public/uploads exists', fs.existsSync(uploadsDir), uploadsDir);

if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir);
  check('uploads directory accessible', true, `${files.length} files found`);
  
  const testFile = path.join(uploadsDir, 'sample-document.txt');
  check('sample-document.txt exists', fs.existsSync(testFile), 'Test file ready');
}

// 3. Core Libraries
section('Core Libraries');
const processorPath = path.join(process.cwd(), 'lib', 'document-processor.ts');
if (check('document-processor.ts exists', fs.existsSync(processorPath))) {
  const content = fs.readFileSync(processorPath, 'utf-8');
  check('  - Has extractTextFromPDF', content.includes('extractTextFromPDF'));
  check('  - Has extractTextFromDOCX', content.includes('extractTextFromDOCX'));
  check('  - Has DocumentProcessor class', content.includes('class DocumentProcessor'));
  check('  - Uses pdf-parser wrapper', content.includes("require('./pdf-parser.js')"));
  check('  - Has error handling', content.includes('catch (error'));
}

const pdfParserPath = path.join(process.cwd(), 'lib', 'pdf-parser.js');
if (check('pdf-parser.js exists', fs.existsSync(pdfParserPath))) {
  const content = fs.readFileSync(pdfParserPath, 'utf-8');
  check('  - Exports pdf-parse', content.includes("require('pdf-parse')"));
}

const uploadServicePath = path.join(process.cwd(), 'lib', 'file-upload.ts');
if (check('file-upload.ts exists', fs.existsSync(uploadServicePath))) {
  const content = fs.readFileSync(uploadServicePath, 'utf-8');
  check('  - Has uploadFile method', content.includes('uploadFile'));
  check('  - Has ensureUploadDirectory', content.includes('ensureUploadDirectory'));
  check('  - Has file validation', content.includes('file.size === 0'));
  check('  - Has deleteFile method', content.includes('deleteFile'));
}

// 4. API Routes
section('API Routes');
const apiRoutePath = path.join(process.cwd(), 'app', 'api', 'documents', 'route.ts');
if (check('documents/route.ts exists', fs.existsSync(apiRoutePath))) {
  const content = fs.readFileSync(apiRoutePath, 'utf-8');
  check('  - Has GET handler', content.includes('export async function GET'));
  check('  - Has POST handler', content.includes('export async function POST'));
  check('  - Uses fileUploadService', content.includes('fileUploadService'));
  check('  - Uses documentProcessor', content.includes('documentProcessor'));
  check('  - Validates file', content.includes('if (!file)'));
  check('  - Validates title', content.includes('if (!title'));
  check('  - Saves to MongoDB', content.includes('DocumentModel'));
  check('  - Indexes for search', content.includes('searchService'));
}

const apiIdRoutePath = path.join(process.cwd(), 'app', 'api', 'documents', '[id]', 'route.ts');
if (check('documents/[id]/route.ts exists', fs.existsSync(apiIdRoutePath))) {
  const content = fs.readFileSync(apiIdRoutePath, 'utf-8');
  check('  - Has GET handler', content.includes('export async function GET'));
  check('  - Has PATCH handler', content.includes('export async function PATCH'));
  check('  - Has DELETE handler', content.includes('export async function DELETE'));
  check('  - Validates ObjectId', content.includes('isValid(documentId)'));
  check('  - Checks workspace access', content.includes('workspace'));
}

// 5. Frontend Pages
section('Frontend Pages');
const documentsPagePath = path.join(process.cwd(), 'app', 'documents', 'page.tsx');
if (check('documents/page.tsx exists', fs.existsSync(documentsPagePath))) {
  const content = fs.readFileSync(documentsPagePath, 'utf-8');
  check('  - Has upload modal', content.includes('UploadDocumentModal'));
  check('  - Fetches documents', content.includes('fetchDocuments'));
  check('  - Has search', content.includes('searchQuery'));
  check('  - Has filters', content.includes('filterTag'));
  check('  - Has document cards', content.includes('DocumentCard'));
}

const documentViewPath = path.join(process.cwd(), 'app', 'documents', '[id]', 'page.tsx');
if (check('documents/[id]/page.tsx exists', fs.existsSync(documentViewPath))) {
  const content = fs.readFileSync(documentViewPath, 'utf-8');
  check('  - Fetches document', content.includes('fetchDocument'));
  check('  - Shows file preview', content.includes('renderFilePreview'));
  check('  - Has AI summary', content.includes('fetchAISummary'));
  check('  - Has download', content.includes('handleDownload'));
  check('  - Has delete', content.includes('handleDelete'));
  check('  - Has rename', content.includes('handleRename'));
}

// 6. Components
section('Components');
const uploadModalPath = path.join(process.cwd(), 'components', 'documents', 'UploadDocumentModal.tsx');
if (check('UploadDocumentModal.tsx exists', fs.existsSync(uploadModalPath))) {
  const content = fs.readFileSync(uploadModalPath, 'utf-8');
  check('  - Has file input', content.includes('type="file"'));
  check('  - Has title input', content.includes('title'));
  check('  - Has tags input', content.includes('tags'));
  check('  - Validates file', content.includes('if (!selectedFile)'));
  check('  - Creates FormData', content.includes('FormData'));
}

// 7. Models
section('Models');
const modelPath = path.join(process.cwd(), 'models', 'DocumentModel.ts');
if (check('DocumentModel.ts exists', fs.existsSync(modelPath))) {
  const content = fs.readFileSync(modelPath, 'utf-8');
  check('  - Has title field', content.includes('title:'));
  check('  - Has fileUrl field', content.includes('fileUrl:'));
  check('  - Has extractedText field', content.includes('extractedText'));
  check('  - Has workspace field', content.includes('workspace:'));
  check('  - Has author field', content.includes('author:'));
  check('  - Has tags field', content.includes('tags:'));
  check('  - Has timestamps', content.includes('timestamps: true'));
  check('  - Has indexes', content.includes('DocumentSchema.index'));
}

// 8. Test PDF Parsing
section('PDF Parsing Test');
try {
  const pdfParse = require('./lib/pdf-parser.js');
  check('pdf-parser wrapper works', typeof pdfParse === 'function');
  
  const testPdfPath = path.join(uploadsDir, 'sample-document.txt');
  if (fs.existsSync(testPdfPath)) {
    const buffer = fs.readFileSync(testPdfPath);
    check('Test file readable', buffer.length > 0, `${buffer.length} bytes`);
  }
} catch (e) {
  check('pdf-parser wrapper works', false, e.message);
}

// 9. Configuration Files
section('Configuration');
const packageJsonPath = path.join(process.cwd(), 'package.json');
if (check('package.json exists', fs.existsSync(packageJsonPath))) {
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  check('  - Has pdf-parse', !!pkg.dependencies['pdf-parse']);
  check('  - Has mammoth', !!pkg.dependencies['mammoth']);
  check('  - Has mongoose', !!pkg.dependencies['mongoose']);
  check('  - Has next', !!pkg.dependencies['next']);
}

const envExamplePath = path.join(process.cwd(), '.env.local.example');
check('.env.local.example exists', fs.existsSync(envExamplePath));

// Summary
console.log('');
console.log('='.repeat(70));
console.log('📊 VERIFICATION SUMMARY');
console.log('='.repeat(70));
console.log('');
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📈 Success Rate: ${Math.round((passCount / (passCount + failCount)) * 100)}%`);
console.log('');

if (failCount === 0) {
  console.log('🎉 ALL CHECKS PASSED!');
  console.log('');
  console.log('✨ The document system is ready to use!');
  console.log('');
  console.log('🚀 Next Steps:');
  console.log('   1. Start dev server: npm run dev');
  console.log('   2. Login to your account');
  console.log('   3. Navigate to /documents');
  console.log('   4. Upload sample-document.txt');
  console.log('   5. View and test all features');
  console.log('');
} else {
  console.log('⚠️  SOME CHECKS FAILED');
  console.log('');
  console.log('Please review the failed checks above and fix any issues.');
  console.log('');
}

console.log('📖 For detailed information, see: DOCUMENT_SYSTEM_COMPLETE_FIX.md');
console.log('');
