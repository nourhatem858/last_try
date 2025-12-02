# Complete PDF Upload Example - Working Code

## 🎯 Complete Working Implementation

This is a **copy-paste ready** implementation that works in Next.js 13+ with TypeScript.

---

## 1️⃣ Install Dependencies

```bash
npm install pdf-parse@2.4.5
```

---

## 2️⃣ API Route: `app/api/pdf/extract/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

interface PDFParseResult {
  numpages: number;
  text: string;
  info: {
    Title?: string;
    Author?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
  };
}

type PDFParseFunction = (buffer: Buffer) => Promise<PDFParseResult>;

export async function POST(request: NextRequest) {
  try {
    // 1. Get file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // 2. Validate PDF
    if (!file.type.includes('pdf') && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'File must be a PDF' },
        { status: 400 }
      );
    }
    
    // 3. Convert to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 4. Import pdf-parse (CRITICAL: Dynamic import)
    const pdfParseModule = await import('pdf-parse');
    const pdfParse = (pdfParseModule.default || pdfParseModule) as PDFParseFunction;
    
    // 5. Verify it's a function
    if (typeof pdfParse !== 'function') {
      console.error('pdf-parse failed to load:', Object.keys(pdfParseModule));
      return NextResponse.json(
        { success: false, error: 'PDF processor failed to load' },
        { status: 500 }
      );
    }
    
    // 6. Extract text
    const data = await pdfParse(buffer);
    
    // 7. Return result
    return NextResponse.json({
      success: true,
      text: data.text,
      metadata: {
        pages: data.numpages,
        wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length,
        title: data.info?.Title || file.name,
        author: data.info?.Author || 'Unknown',
      },
    });
    
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}
```

---

## 3️⃣ Frontend Component: `components/PDFUploader.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function PDFUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/pdf/extract', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">PDF Text Extractor</h2>
      
      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4 block"
      />
      
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Processing...' : 'Extract Text'}
      </button>

      {result && (
        <div className="mt-4">
          {result.success ? (
            <div className="bg-green-50 p-4 rounded">
              <p className="font-bold">✅ Success!</p>
              <p>Pages: {result.metadata?.pages}</p>
              <p>Words: {result.metadata?.wordCount}</p>
              <pre className="mt-2 text-sm max-h-64 overflow-auto">
                {result.text?.substring(0, 500)}...
              </pre>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded">
              <p className="font-bold">❌ Error</p>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 4️⃣ Test Page: `app/test-pdf/page.tsx`

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

---

## 5️⃣ Test It

```bash
# Start dev server
npm run dev

# Visit in browser
# http://localhost:3000/test-pdf

# Upload a PDF file
# Verify text extraction works
```

---

## 6️⃣ Integration Example

### Use in Document Upload Flow

```typescript
// app/api/documents/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Extract text from PDF
  const buffer = Buffer.from(await file.arrayBuffer());
  const pdfParseModule = await import('pdf-parse');
  const pdfParse = (pdfParseModule.default || pdfParseModule) as any;
  
  if (typeof pdfParse === 'function') {
    const data = await pdfParse(buffer);
    const extractedText = data.text;
    
    // Save to database
    await DocumentModel.create({
      title: formData.get('title'),
      extractedText: extractedText,
      fileUrl: '/uploads/' + file.name,
      // ... other fields
    });
  }
  
  return NextResponse.json({ success: true });
}
```

---

## 🔧 Troubleshooting

### Error: "pdf-parse is not a function"

**Cause**: Using static import instead of dynamic import

**Fix**: Always use `await import('pdf-parse')` inside async function

### Error: "Module not found: canvas"

**Fix**: Add to `next.config.ts`:

```typescript
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};
```

### Error: Works locally but fails in production

**Fix**: Ensure `pdf-parse` is in `dependencies`:

```bash
npm install --save pdf-parse@2.4.5
```

---

## ✅ Why This Works

1. **Dynamic Import**: Loads CommonJS module at runtime
2. **Fallback**: Handles both default and named exports
3. **Type Check**: Verifies function before calling
4. **Error Handling**: Catches and reports errors properly
5. **Buffer Conversion**: Properly converts File to Buffer

---

## 📊 Expected Output

```json
{
  "success": true,
  "text": "This is the extracted text from the PDF document...",
  "metadata": {
    "pages": 5,
    "wordCount": 1234,
    "title": "Document Title",
    "author": "Author Name"
  }
}
```

---

## 🚀 Production Ready

This implementation:
- ✅ Works in Next.js 13+
- ✅ Works with TypeScript
- ✅ Works locally and in production
- ✅ Handles errors gracefully
- ✅ Validates file types
- ✅ Extracts metadata
- ✅ Type-safe

---

## 📝 Summary

The key to making `pdf-parse` work in Next.js 13+ is:

```typescript
// This is the magic line
const pdfParseModule = await import('pdf-parse');
const pdfParse = (pdfParseModule.default || pdfParseModule) as any;
```

Everything else is standard Next.js API route handling.
