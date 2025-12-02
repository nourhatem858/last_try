# 📇 Document Processor - Quick Reference Card

## 🎯 The Fix

```typescript
// ❌ BEFORE (Broken)
import pdfParse from 'pdf-parse';  // Error!

// ✅ AFTER (Fixed)
const pdfParse = (await import('pdf-parse')).default;  // Works!
```

## 🚀 Quick Usage

```typescript
import { processDocument } from '@/lib/document-processor';

const result = await processDocument(buffer, fileType);
console.log(result.text);  // Extracted text
```

## 📦 Functions

```typescript
// PDF extraction
extractTextFromPDF(buffer: Buffer): Promise<{ text: string }>

// DOCX extraction
extractTextFromDOCX(buffer: Buffer): Promise<{ text: string }>

// Universal processor
processDocument(buffer: Buffer, fileType: string): Promise<ExtractedContent>

// Class-based
new DocumentProcessor().extractText(buffer, fileType)
```

## 📄 Supported Types

- ✅ PDF (`application/pdf`)
- ✅ DOCX (`application/vnd.openxmlformats-officedocument.wordprocessingml.document`)
- ✅ DOC (`application/msword`)
- ✅ TXT (`text/plain`)

## 🔥 Complete Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await processDocument(buffer, file.type);
  
  return NextResponse.json({ 
    text: result.text,
    wordCount: result.metadata?.wordCount 
  });
}
```

## ⚡ Error Handling

```typescript
try {
  const result = await processDocument(buffer, fileType);
} catch (error) {
  console.error('Failed:', error.message);
  // Descriptive error messages:
  // - "Failed to extract text from PDF: ..."
  // - "Failed to extract text from DOCX: ..."
  // - "Unsupported file type: ..."
}
```

## 📊 Return Type

```typescript
interface ExtractedContent {
  text: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
    language?: string;
  };
}
```

## 🧪 Test

```bash
node test-document-processor.js
```

## 📚 Documentation

- `DOCUMENT_PROCESSOR_COMPLETE.md` - Full docs
- `DOCUMENT_PROCESSOR_QUICK_START.md` - Quick start
- `DOCUMENT_PROCESSOR_BEFORE_AFTER.md` - Comparison

## ✅ Status

- ✅ Import error fixed
- ✅ ESM compatible
- ✅ Type-safe
- ✅ Production-ready
- ✅ Well-documented

---

**Ready to use!** 🎉
