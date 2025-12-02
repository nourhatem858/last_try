# PDF Upload Quick Fix Guide

## ⚡ TL;DR - The Fix

The error happens because `pdf-parse` is a CommonJS module. Use **dynamic import**:

```typescript
// ❌ WRONG
import pdfParse from 'pdf-parse';

// ✅ CORRECT
const pdfParseModule = await import('pdf-parse');
const pdfParse = (pdfParseModule.default || pdfParseModule) as any;

if (typeof pdfParse !== 'function') {
  throw new Error('pdf-parse module did not export a function');
}

const data = await pdfParse(buffer);
console.log(data.text); // Extracted text
```

---

## 🚀 Quick Test

### Option 1: Browser Test

1. Start server:
```bash
npm run dev
```

2. Create test page `app/test-pdf/page.tsx`:
```typescript
import PDFUploader from '@/components/PDFUploader';

export default function TestPDFPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <PDFUploader />
    </div>
  );
}
```

3. Visit: http://localhost:3000/test-pdf
4. Upload a PDF and verify it works

### Option 2: API Test

```bash
node test-pdf-simple.js
```

---

## 📁 Your Current Setup

✅ **Already Correct!**

Your files are properly configured:
- `lib/document-processor.ts` - Uses dynamic import ✅
- `app/api/pdf/extract/route.ts` - Uses dynamic import ✅
- `pdf-parse@2.4.5` - Installed ✅

---

## 🔍 If Still Getting Errors

### 1. Clear Cache
```bash
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### 2. Check Import Location

Make sure the error is coming from YOUR code, not old cached code:

```bash
# Search for incorrect imports
grep -r "import.*pdf-parse" --include="*.ts" --include="*.tsx"
```

### 3. Verify Module Loading

Add debug logging:

```typescript
console.log('📦 Loading pdf-parse...');
const pdfParseModule = await import('pdf-parse');
console.log('📦 Module keys:', Object.keys(pdfParseModule));
console.log('📦 Default:', typeof pdfParseModule.default);
console.log('📦 Module:', typeof pdfParseModule);

const pdfParse = (pdfParseModule.default || pdfParseModule) as any;
console.log('📦 Final type:', typeof pdfParse);
```

### 4. Check Next.js Config

Add to `next.config.ts` if needed:

```typescript
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
```

---

## 📊 Expected Response

```json
{
  "success": true,
  "text": "This is the extracted text from the PDF...",
  "metadata": {
    "pages": 5,
    "wordCount": 1234,
    "title": "Document Title",
    "author": "Author Name",
    "creationDate": "2024-01-01",
    "producer": "PDF Producer"
  }
}
```

---

## 🎯 Common Issues

| Issue | Solution |
|-------|----------|
| "Module not found: canvas" | Add `config.resolve.alias.canvas = false` to webpack config |
| Works locally, fails in production | Ensure `pdf-parse` is in `dependencies`, not `devDependencies` |
| "pdf-parse is not a function" | Use dynamic import with fallback |
| Timeout errors | Increase timeout or use Edge Runtime |
| File too large | Increase `MAX_FILE_SIZE` or use streaming |

---

## ✅ Verification Checklist

- [ ] `pdf-parse@2.4.5` installed
- [ ] Using dynamic import (`await import('pdf-parse')`)
- [ ] Fallback: `pdfParseModule.default || pdfParseModule`
- [ ] Type check: `typeof pdfParse === 'function'`
- [ ] Error handling for encrypted PDFs
- [ ] File size validation
- [ ] Timeout handling
- [ ] Test with real PDF file

---

## 📞 Need Help?

Check the full guide: `PDF_UPLOAD_SOLUTION.md`
