# PDF Upload Fix: Complete Solution

## 🔍 Why the Error Occurs

The error **"pdf-parse module did not export a function"** happens because:

### 1. **ES Module vs CommonJS Mismatch**
- `pdf-parse` is a **CommonJS module** (uses `module.exports`)
- Next.js 13+ uses **ES Modules** by default (uses `import/export`)
- Direct `import` statements don't work with CommonJS modules

### 2. **Incorrect Import Syntax**
```typescript
// ❌ WRONG - Doesn't work in Next.js 13+
import pdfParse from 'pdf-parse';

// ❌ WRONG - Still doesn't work
import * as pdfParse from 'pdf-parse';
```

### 3. **Version Compatibility**
- Some versions of `pdf-parse` have export issues
- Recommended version: `^2.4.5` (latest stable)

### 4. **Runtime Environment**
- Works locally but fails in production (Vercel, etc.)
- Build-time vs runtime module resolution differences

---

## ✅ Correct Solution

### Step 1: Install Correct Version

```bash
npm install pdf-parse@2.4.5
```

Or if already installed:
```bash
npm uninstall pdf-parse
npm install pdf-parse@2.4.5
npm install --save-dev @types/pdf-parse
```

### Step 2: Use Dynamic Import (REQUIRED)

```typescript
// ✅ CORRECT - Dynamic import inside async function
const pdfParseModule = await import('pdf-parse');
const pdfParse = (pdfParseModule.default || pdfParseModule) as any;

// Verify it's a function
if (typeof pdfParse !== 'function') {
  throw new Error('pdf-parse module did not export a function');
}

// Now use it
const data = await pdfParse(buffer);
console.log(data.text); // Extracted text
```

### Why This Works:
- **Dynamic import** (`await import()`) loads the module at runtime
- **Fallback** (`pdfParseModule.default || pdfParseModule`) handles both export types
- **Type assertion** ensures TypeScript compatibility
- **Function check** validates the module loaded correctly

---

## 📝 Complete Working Example

### API Route: `app/api/pdf/extract/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Type definitions for pdf-parse
interface PDFParseResult {
  numpages: number;
  numrender: number;
  info: {
    Title?: string;
    Author?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
  };
  metadata: any;
  text: string;
  version: string;
}

type PDFParseFunction = (
  dataBuffer: Buffer,
  options?: any
) => Promise<PDFParseResult>;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    console.log('📄 PDF extraction request received');

    // 1. Get uploaded file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log('📄 File received:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });
    
    // 2. Validate file type
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Please upload a PDF file.' },
        { status: 400 }
      );
    }
    
    // 3. Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` },
        { status: 400 }
      );
    }
    
    // 4. Convert file to buffer
    console.log('🔄 Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log(`✅ Buffer created: ${buffer.length} bytes`);
    
    // 5. Import pdf-parse with proper handling (CRITICAL STEP)
    console.log('📦 Loading pdf-parse module...');
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule.default || pdfParseModule) as PDFParseFunction;
    
    // 6. Verify it's a function
    if (typeof pdfParse !== 'function') {
      console.error('❌ pdf-parse import failed. Module structure:', Object.keys(pdfParseModule));
      return NextResponse.json(
        { success: false, error: 'PDF processing module failed to load' },
        { status: 500 }
      );
    }
    
    console.log('✅ pdf-parse loaded successfully');
    
    // 7. Extract text from PDF with timeout
    console.log('🔍 Extracting text from PDF...');
    const extractionPromise = pdfParse(buffer);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF processing timeout (30s)')), 30000)
    );
    
    const data = await Promise.race([extractionPromise, timeoutPromise]) as PDFParseResult;
    
    console.log('✅ Text extracted successfully:', {
      pages: data.numpages,
      textLength: data.text.length,
      title: data.info?.Title || 'N/A',
    });
    
    // 8. Return extracted text and metadata
    return NextResponse.json({
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        wordCount: data.text.trim().split(/\s+/).filter(w => w.length > 0).length,
        title: data.info?.Title || file.name,
        author: data.info?.Author || 'Unknown',
        creationDate: data.info?.CreationDate || null,
        producer: data.info?.Producer || 'Unknown',
      },
    });
    
  } catch (error: any) {
    console.error('❌ PDF extraction error:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to extract text from PDF';
    
    if (error.message.includes('encrypted') || error.message.includes('password')) {
      errorMessage = 'PDF is password protected. Please provide an unencrypted version.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'PDF processing timeout. File may be too large or complex.';
    } else if (error.message.includes('Invalid PDF')) {
      errorMessage = 'Invalid or corrupted PDF file.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
```

---

## 🎨 Frontend Upload Component

### React Component: `components/PDFUploader.tsx`

```typescript
'use client';

import { useState } from 'react';

interface PDFUploadResult {
  success: boolean;
  text?: string;
  metadata?: {
    pages: number;
    wordCount: number;
    title: string;
    author: string;
    creationDate: string | null;
    producer: string;
  };
  error?: string;
}

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PDFUploadResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null); // Clear previous result
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a PDF file first');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Upload to API
      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      const data: PDFUploadResult = await response.json();

      if (data.success) {
        setResult(data);
        console.log('✅ PDF uploaded successfully:', data);
      } else {
        setResult({ success: false, error: data.error || 'Upload failed' });
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      setResult({ success: false, error: error.message || 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">PDF Text Extractor</h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select PDF File
        </label>
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors"
      >
        {loading ? 'Extracting...' : 'Extract Text'}
      </button>

      {/* Loading State */}
      {loading && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Processing PDF...</p>
        </div>
      )}

      {/* Error State */}
      {result && !result.success && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-semibold">Error:</p>
          <p className="text-red-600">{result.error}</p>
        </div>
      )}

      {/* Success State */}
      {result && result.success && (
        <div className="mt-4 space-y-4">
          {/* Metadata */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800 font-semibold mb-2">✅ Extraction Successful!</p>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Title:</strong> {result.metadata?.title}</p>
              <p><strong>Author:</strong> {result.metadata?.author}</p>
              <p><strong>Pages:</strong> {result.metadata?.pages}</p>
              <p><strong>Words:</strong> {result.metadata?.wordCount}</p>
              <p><strong>Producer:</strong> {result.metadata?.producer}</p>
            </div>
          </div>

          {/* Extracted Text */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
            <p className="font-semibold mb-2">Extracted Text:</p>
            <div className="max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {result.text}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 🧪 Testing Instructions

### 1. Test API Route Directly

Create `test-pdf-upload.js`:

```javascript
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testPDFUpload() {
  try {
    // Read a test PDF file
    const pdfPath = './test.pdf'; // Replace with your PDF path
    const fileBuffer = fs.readFileSync(pdfPath);
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', fileBuffer, {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });
    
    // Upload to API
    console.log('📤 Uploading PDF...');
    const response = await axios.post('http://localhost:3000/api/pdf/extract', formData, {
      headers: formData.getHeaders(),
    });
    
    console.log('✅ Success:', response.data);
    console.log('📄 Extracted text length:', response.data.text?.length);
    console.log('📊 Metadata:', response.data.metadata);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testPDFUpload();
```

Run:
```bash
node test-pdf-upload.js
```

### 2. Test in Browser

1. Start dev server: `npm run dev`
2. Create a test page at `app/test-pdf/page.tsx`:

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

3. Visit: `http://localhost:3000/test-pdf`
4. Upload a PDF and verify extraction works

---

## 🚀 Deployment Considerations

### Vercel / Production

1. **Environment Variables**: Ensure all required env vars are set
2. **File Size Limits**: Vercel has a 4.5MB body size limit (use Edge Functions for larger files)
3. **Timeout**: Serverless functions have 10s timeout (use Edge Functions for longer processing)

### Edge Function Version (for large PDFs)

```typescript
// app/api/pdf/extract/route.ts
export const runtime = 'edge'; // Enable Edge Runtime

// Rest of the code remains the same
```

### Docker / Self-Hosted

No special configuration needed. The solution works out of the box.

---

## 🔧 Troubleshooting

### Issue: "Module not found: Can't resolve 'canvas'"

**Solution**: Add to `next.config.ts`:

```typescript
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

### Issue: "pdf-parse is not a function"

**Solution**: Ensure you're using dynamic import:

```typescript
// ❌ WRONG
import pdfParse from 'pdf-parse';

// ✅ CORRECT
const pdfParseModule = await import('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
```

### Issue: Works locally but fails in production

**Solution**: Check build logs for missing dependencies:

```bash
npm install pdf-parse@2.4.5 --save
npm run build
```

---

## ✅ Checklist

- [ ] Install `pdf-parse@2.4.5`
- [ ] Use dynamic import (`await import('pdf-parse')`)
- [ ] Add fallback (`pdfParseModule.default || pdfParseModule`)
- [ ] Verify function type before calling
- [ ] Add proper error handling
- [ ] Test with various PDF files
- [ ] Test in production environment
- [ ] Add file size validation
- [ ] Add timeout handling
- [ ] Add TypeScript types

---

## 📚 Additional Resources

- [pdf-parse npm package](https://www.npmjs.com/package/pdf-parse)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [FormData API](https://developer.mozilla.org/en-US/docs/Web/API/FormData)

---

**Your current implementation is already correct!** The error might be happening due to:
1. Cached build artifacts
2. Missing dependencies in production
3. File upload not reaching the API correctly

Try:
```bash
rm -rf .next node_modules
npm install
npm run dev
```
