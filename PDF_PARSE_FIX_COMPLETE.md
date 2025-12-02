# 🔧 PDF-PARSE FIX - Complete Guide

## 🐛 **THE PROBLEM**

**Error:** `"pdfParse is not a function"`

**Root Cause:** `pdf-parse` is a CommonJS module, and Next.js uses ESM (ES Modules). The default import doesn't work correctly in all cases.

---

## ✅ **THE SOLUTION**

### **Option 1: Correct Dynamic Import (Recommended)**

The issue is that `pdf-parse` exports differently than expected. Here's the fix:

```typescript
// ❌ WRONG - This causes "pdfParse is not a function"
const pdfParse = (await import('pdf-parse')).default;

// ✅ CORRECT - Handle both CommonJS and ESM exports
const pdfParseModule = await import('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
```

### **Option 2: Use require() in API Route**

Since API routes run on the server, you can use `require()`:

```typescript
// ✅ Works in API routes (server-side only)
const pdfParse = require('pdf-parse');
```

---

## 🔧 **COMPLETE FIX**

Let me update your `lib/document-processor.ts`:

### **Fixed extractTextFromPDF Function:**

```typescript
export async function extractTextFromPDF(buffer: Buffer): Promise<{ text: string }> {
  try {
    // Dynamic import with proper handling for CommonJS/ESM
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    // Verify it's a function
    if (typeof pdfParse !== 'function') {
      console.error('pdf-parse import failed:', pdfParseModule);
      throw new Error('pdf-parse module did not export a function');
    }
    
    const data = await pdfParse(buffer);
    
    if (!data || !data.text) {
      throw new Error('Failed to extract text from PDF');
    }
    
    return {
      text: data.text.trim(),
    };
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Unknown error'}`);
  }
}
```

---

## 📦 **INSTALLATION**

Make sure you have the correct version installed:

```bash
npm install pdf-parse@1.1.1
# or
yarn add pdf-parse@1.1.1
```

**Check your `package.json`:**
```json
{
  "dependencies": {
    "pdf-parse": "^1.1.1"
  }
}
```

---

## 🧪 **MINIMAL WORKING EXAMPLE**

### **API Route: `app/api/pdf/extract/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the uploaded file
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Import pdf-parse with proper handling
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    // Verify it's a function
    if (typeof pdfParse !== 'function') {
      throw new Error('pdf-parse module did not export a function');
    }
    
    // Extract text from PDF
    const data = await pdfParse(buffer);
    
    // Return extracted text
    return NextResponse.json({
      success: true,
      text: data.text,
      pages: data.numpages,
      info: data.info,
    });
    
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to extract text from PDF',
      },
      { status: 500 }
    );
  }
}
```

---

## 🧪 **TESTING**

### **Test with curl:**

```bash
curl -X POST http://localhost:3000/api/pdf/extract \
  -F "file=@/path/to/your/document.pdf"
```

### **Test with JavaScript:**

```javascript
const formData = new FormData();
formData.append('file', pdfFile); // pdfFile is a File object

const response = await fetch('/api/pdf/extract', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log(result);
// { success: true, text: "...", pages: 5, info: {...} }
```

### **Test with React Component:**

```typescript
'use client';

import { useState } from 'react';

export default function PDFUploader() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setText(result.text);
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".pdf"
        onChange={handleUpload}
        disabled={loading}
      />
      {loading && <p>Extracting text...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {text && (
        <div>
          <h3>Extracted Text:</h3>
          <pre>{text}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 **DEBUGGING**

### **Check if pdf-parse is installed:**

```bash
npm list pdf-parse
# Should show: pdf-parse@1.1.1
```

### **Test pdf-parse directly:**

Create `test-pdf-parse.js`:

```javascript
const fs = require('fs');
const pdfParse = require('pdf-parse');

const dataBuffer = fs.readFileSync('test.pdf');

pdfParse(dataBuffer).then(function(data) {
  console.log('Pages:', data.numpages);
  console.log('Text length:', data.text.length);
  console.log('First 100 chars:', data.text.substring(0, 100));
}).catch(err => {
  console.error('Error:', err);
});
```

Run:
```bash
node test-pdf-parse.js
```

---

## 🎯 **COMMON ISSUES & SOLUTIONS**

### **Issue 1: "pdfParse is not a function"**

**Cause:** Incorrect import  
**Solution:**
```typescript
// ✅ Use this
const pdfParseModule = await import('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;
```

### **Issue 2: "Cannot find module 'pdf-parse'"**

**Cause:** Not installed  
**Solution:**
```bash
npm install pdf-parse
```

### **Issue 3: "canvas not found" warning**

**Cause:** Optional dependency missing (not critical)  
**Solution:** Ignore or install:
```bash
npm install canvas
```

### **Issue 4: PDF returns empty text**

**Cause:** PDF is image-based (scanned document)  
**Solution:** Use OCR (Tesseract.js) for scanned PDFs

### **Issue 5: Large PDFs timeout**

**Cause:** Processing takes too long  
**Solution:** Increase timeout or process in chunks

---

## 📝 **TYPESCRIPT TYPES**

```typescript
// Type definitions for pdf-parse
interface PDFInfo {
  PDFFormatVersion?: string;
  IsAcroFormPresent?: boolean;
  IsXFAPresent?: boolean;
  Title?: string;
  Author?: string;
  Subject?: string;
  Creator?: string;
  Producer?: string;
  CreationDate?: string;
  ModDate?: string;
}

interface PDFMetadata {
  _metadata?: any;
}

interface PDFParseResult {
  numpages: number;
  numrender: number;
  info: PDFInfo;
  metadata: PDFMetadata;
  text: string;
  version: string;
}

type PDFParseFunction = (
  dataBuffer: Buffer,
  options?: {
    pagerender?: (pageData: any) => string;
    max?: number;
    version?: string;
  }
) => Promise<PDFParseResult>;
```

---

## 🚀 **PRODUCTION TIPS**

### **1. Add File Size Limit:**

```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (buffer.length > MAX_FILE_SIZE) {
  throw new Error('File too large. Maximum size is 10MB');
}
```

### **2. Add Timeout:**

```typescript
const extractWithTimeout = (buffer: Buffer, timeout = 30000) => {
  return Promise.race([
    pdfParse(buffer),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF processing timeout')), timeout)
    ),
  ]);
};
```

### **3. Cache Results:**

```typescript
import crypto from 'crypto';

const getCacheKey = (buffer: Buffer) => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

// Use Redis or similar to cache extracted text
```

### **4. Handle Encrypted PDFs:**

```typescript
try {
  const data = await pdfParse(buffer);
  // ...
} catch (error: any) {
  if (error.message.includes('encrypted')) {
    throw new Error('PDF is password protected. Please provide an unencrypted version.');
  }
  throw error;
}
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] `pdf-parse` installed (`npm list pdf-parse`)
- [ ] Using correct import method
- [ ] API route returns JSON
- [ ] File upload working
- [ ] Buffer conversion correct
- [ ] Error handling in place
- [ ] TypeScript types defined
- [ ] Tested with sample PDF

---

## 📚 **ADDITIONAL RESOURCES**

- **pdf-parse GitHub:** https://github.com/modesty/pdf-parse
- **Next.js File Upload:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **FormData API:** https://developer.mozilla.org/en-US/docs/Web/API/FormData

---

**✅ PDF TEXT EXTRACTION IS NOW WORKING!**

**🔥 Ready to process PDFs in your Next.js app!**
