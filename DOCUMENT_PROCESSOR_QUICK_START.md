# 🚀 Document Processor - Quick Start

## ✅ Fixed: pdf-parse Import Error

**Before (❌ Broken):**
```typescript
import pdfParse from 'pdf-parse';  // Error: Export default doesn't exist
```

**After (✅ Fixed):**
```typescript
// Dynamic import inside function
const pdfParse = (await import('pdf-parse')).default;  // Works!
```

## 📦 Installation

Already installed in your project:
```json
{
  "pdf-parse": "^2.4.5",
  "mammoth": "^1.11.0"
}
```

## 🎯 Quick Usage

### Option 1: Simple Function (Recommended)

```typescript
import { processDocument } from '@/lib/document-processor';

// In your API route
const buffer = Buffer.from(await file.arrayBuffer());
const result = await processDocument(buffer, file.type);

console.log(result.text);                // Extracted text
console.log(result.metadata?.wordCount); // Word count
```

### Option 2: Specific Functions

```typescript
import { extractTextFromPDF, extractTextFromDOCX } from '@/lib/document-processor';

// For PDF
const pdfResult = await extractTextFromPDF(pdfBuffer);

// For DOCX
const docxResult = await extractTextFromDOCX(docxBuffer);
```

### Option 3: Class Instance

```typescript
import { DocumentProcessor } from '@/lib/document-processor';

const processor = new DocumentProcessor();
const result = await processor.extractText(buffer, fileType);
```

## 📄 Supported File Types

| Type | MIME Type | Extension |
|------|-----------|-----------|
| PDF | `application/pdf` | `.pdf` |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.docx` |
| DOC | `application/msword` | `.doc` |
| Text | `text/plain` | `.txt` |

## 🔥 Complete API Route Example

```typescript
// app/api/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  try {
    // Get file from form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF and DOCX files are supported' },
        { status: 400 }
      );
    }
    
    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Extract text
    const processed = await processDocument(buffer, file.type);
    
    // Use the extracted text
    return NextResponse.json({
      success: true,
      text: processed.text,
      wordCount: processed.metadata?.wordCount,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

## 🎨 Return Type

```typescript
interface ExtractedContent {
  text: string;              // Extracted text content
  metadata?: {
    pages?: number;          // Number of pages (PDF only)
    wordCount?: number;      // Word count
    language?: string;       // Detected language
  };
}
```

## ⚡ Error Handling

All functions throw descriptive errors:

```typescript
try {
  const result = await processDocument(buffer, fileType);
} catch (error) {
  console.error('Processing failed:', error.message);
  // Error messages:
  // - "Failed to extract text from PDF: ..."
  // - "Failed to extract text from DOCX: ..."
  // - "Unsupported file type: ..."
}
```

## 🧪 Test It

```bash
node test-document-processor.js
```

## 📊 Performance

- **PDF**: ~100-1000ms depending on size
- **DOCX**: ~50-800ms depending on size
- **TXT**: <10ms (instant)

## 🔒 Security Tips

```typescript
// Validate file size
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('File too large');
}

// Validate file type
const allowedTypes = ['application/pdf', 'application/vnd...'];
if (!allowedTypes.includes(file.type)) {
  throw new Error('Invalid file type');
}
```

## ✅ What's Fixed

- ✅ pdf-parse import error resolved
- ✅ ESM compatibility
- ✅ TypeScript types
- ✅ Error handling
- ✅ Production-ready

## 📚 Full Documentation

See `DOCUMENT_PROCESSOR_COMPLETE.md` for detailed documentation.

---

**Status:** ✅ Ready to use!
