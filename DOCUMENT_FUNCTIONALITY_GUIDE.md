# 📄 Document Functionality - Complete Guide

## ✅ What's Working

All document functionality is **fully operational**:

1. ✅ **Create Documents** - Upload PDF/DOCX files with metadata
2. ✅ **View Documents** - Display document details and preview
3. ✅ **List Documents** - See all documents with filtering
4. ✅ **Update Documents** - Rename and edit metadata
5. ✅ **Delete Documents** - Remove documents and files
6. ✅ **PDF/DOCX Parsing** - Extract text from uploaded files
7. ✅ **Real-time Updates** - Documents appear instantly after creation

---

## 🚀 Quick Start

### 1. Upload a Document

```typescript
// Frontend: Click "Upload Document" button
// Fill in:
- File: Select PDF/DOCX/TXT file
- Title: Document name
- Tags: Comma-separated tags (optional)

// Backend API: POST /api/documents
const formData = new FormData();
formData.append('file', file);
formData.append('title', 'My Document');
formData.append('tags', JSON.stringify(['tag1', 'tag2']));

const response = await fetch('/api/documents', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

### 2. View Document

```typescript
// Navigate to: /documents/[id]
// Or click on any document card

// Backend API: GET /api/documents/[id]
const response = await fetch(`/api/documents/${documentId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 3. Update Document

```typescript
// Click "Rename" button on document view page

// Backend API: PATCH /api/documents/[id]
const response = await fetch(`/api/documents/${documentId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    title: 'New Title',
    tags: ['new', 'tags'],
    description: 'Updated description',
  }),
});
```

### 4. Delete Document

```typescript
// Click "Delete" button on document view page

// Backend API: DELETE /api/documents/[id]
const response = await fetch(`/api/documents/${documentId}`, {
  method: 'DELETE',
  headers: { Authorization: `Bearer ${token}` },
});
```

---

## 📁 File Structure

```
app/
├── documents/
│   ├── page.tsx                    # Document list page
│   └── [id]/
│       └── page.tsx                # Document view page
└── api/
    └── documents/
        ├── route.ts                # GET (list) / POST (create)
        └── [id]/
            └── route.ts            # GET / PATCH / DELETE

components/
└── documents/
    ├── DocumentCard.tsx            # Document card component
    └── UploadDocumentModal.tsx     # Upload modal

models/
└── DocumentModel.ts                # MongoDB schema

lib/
├── document-processor.ts           # PDF/DOCX text extraction
├── file-upload.ts                  # File storage service
└── search-service.ts               # Search indexing

public/
└── uploads/                        # Uploaded files storage
```

---

## 🔧 API Endpoints

### 1. List Documents
```http
GET /api/documents
Authorization: Bearer <token>
Query Params:
  - workspaceId (optional): Filter by workspace

Response:
{
  "success": true,
  "data": [
    {
      "id": "...",
      "title": "Document Title",
      "fileName": "file.pdf",
      "fileType": "application/pdf",
      "fileSize": 12345,
      "tags": ["tag1", "tag2"],
      "workspace": "Workspace Name",
      "workspaceId": "...",
      "uploadedAt": "2024-01-01T00:00:00.000Z",
      "url": "/uploads/..."
    }
  ],
  "count": 1
}
```

### 2. Create Document
```http
POST /api/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (FormData):
  - file: File (required)
  - title: string (required)
  - tags: JSON array (optional)
  - description: string (optional)
  - workspaceId: string (optional)

Response:
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "...",
    "title": "Document Title",
    "fileName": "file.pdf",
    "fileType": "application/pdf",
    "fileSize": 12345,
    "tags": ["tag1", "tag2"],
    "url": "/uploads/..."
  }
}
```

### 3. View Document
```http
GET /api/documents/[id]
Authorization: Bearer <token>

Response:
{
  "success": true,
  "document": {
    "id": "...",
    "title": "Document Title",
    "description": "...",
    "fileName": "file.pdf",
    "fileType": "application/pdf",
    "size": 12345,
    "uploadedAt": "2024-01-01T00:00:00.000Z",
    "url": "/uploads/...",
    "tags": ["tag1", "tag2"],
    "workspace": "Workspace Name",
    "extractedText": "...",
    "viewCount": 5
  }
}
```

### 4. Update Document
```http
PATCH /api/documents/[id]
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "title": "New Title",
  "tags": ["new", "tags"],
  "description": "Updated description"
}

Response:
{
  "success": true,
  "message": "Document updated successfully",
  "document": {
    "id": "...",
    "title": "New Title",
    "tags": ["new", "tags"],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. Delete Document
```http
DELETE /api/documents/[id]
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Document deleted successfully"
}
```

---

## 🎨 Frontend Features

### Document List Page (`/documents`)

**Features:**
- ✅ Display all user documents
- ✅ Search by title/filename
- ✅ Filter by tags
- ✅ Filter by file type
- ✅ Sort by uploaded/updated/title
- ✅ Upload new documents
- ✅ Real-time stats (total, types, tags)
- ✅ Responsive grid layout

**Components:**
- `DocumentCard` - Individual document display
- `UploadDocumentModal` - Upload interface

### Document View Page (`/documents/[id]`)

**Features:**
- ✅ Document metadata display
- ✅ File preview (PDF iframe, images)
- ✅ Download button
- ✅ Rename functionality
- ✅ Delete functionality
- ✅ Share functionality
- ✅ AI summary (if available)
- ✅ Tags display
- ✅ View count tracking

**Preview Support:**
- ✅ PDF - Full iframe preview
- ✅ Images - Direct image display
- ✅ DOCX - Download prompt
- ✅ Other - File info with download

---

## 🔍 PDF/DOCX Parsing

### Supported Formats

1. **PDF** - Uses `pdf-parse` library
   - Extracts all text content
   - Handles multi-page documents
   - Error handling for encrypted PDFs

2. **DOCX** - Uses `mammoth` library
   - Extracts raw text
   - Preserves basic formatting
   - Handles complex documents

3. **TXT** - Direct text reading
   - UTF-8 encoding
   - No special processing needed

### Text Extraction Flow

```typescript
// 1. Upload file
const uploadResult = await fileUploadService.uploadFile(file);

// 2. Extract text
const buffer = Buffer.from(await file.arrayBuffer());
const fileExt = file.name.split('.').pop()?.toLowerCase();
const extracted = await documentProcessor.extractText(buffer, fileExt);

// 3. Save to database
const document = new DocumentModel({
  title,
  fileUrl: uploadResult.fileUrl,
  extractedText: extracted.text,
  // ... other fields
});

// 4. Index for search
await searchService.indexDocument({
  id: document._id.toString(),
  type: 'document',
  title: document.title,
  content: extracted.text,
  // ... other fields
});
```

---

## 🧪 Testing

### Run Test Suite

```bash
# Make sure dev server is running
npm run dev

# In another terminal, run tests
node test-document-functionality.js
```

### Test Coverage

1. ✅ Login authentication
2. ✅ Create document with file upload
3. ✅ List documents
4. ✅ View document by ID
5. ✅ Update document metadata
6. ✅ Delete document
7. ✅ Verify 404 after deletion

### Manual Testing

1. **Create Document:**
   - Go to `/documents`
   - Click "Upload Document"
   - Select a PDF/DOCX file
   - Fill in title and tags
   - Click "Upload Document"
   - ✅ Document should appear in list immediately

2. **View Document:**
   - Click on any document card
   - ✅ Should navigate to `/documents/[id]`
   - ✅ Should show document preview
   - ✅ Should show metadata
   - ✅ No "Not Found" errors

3. **Update Document:**
   - On document view page, click "Rename"
   - Enter new title
   - Click "Rename"
   - ✅ Title should update immediately

4. **Delete Document:**
   - On document view page, click "Delete"
   - Confirm deletion
   - ✅ Should redirect to `/documents`
   - ✅ Document should be removed from list

---

## 🐛 Troubleshooting

### Issue: "Document not found"

**Cause:** Invalid document ID or access denied

**Solution:**
1. Check if document ID is valid MongoDB ObjectId
2. Verify user has access to the workspace
3. Check if document exists in database

### Issue: "Failed to upload document"

**Cause:** File upload or processing error

**Solution:**
1. Check if `public/uploads` directory exists
2. Verify file size is within limits
3. Check file type is supported
4. Review server logs for errors

### Issue: "PDF preview not showing"

**Cause:** Browser PDF viewer issues

**Solution:**
1. Check if file URL is accessible
2. Try downloading the file
3. Check browser console for errors
4. Verify PDF is not corrupted

### Issue: "Text extraction failed"

**Cause:** Unsupported file format or corrupted file

**Solution:**
1. Verify file format is PDF/DOCX/TXT
2. Check if file is corrupted
3. Try re-uploading the file
4. Review extraction logs

---

## 🔐 Security

### Authorization

- ✅ All endpoints require authentication
- ✅ Users can only access documents in their workspaces
- ✅ Workspace membership is verified on every request
- ✅ Document ownership is tracked

### File Storage

- ✅ Files stored in `public/uploads` with unique names
- ✅ Original filenames preserved in metadata
- ✅ File types validated on upload
- ✅ Files deleted when document is deleted

### Data Validation

- ✅ Required fields validated (title, file)
- ✅ MongoDB ObjectId validation
- ✅ File type validation
- ✅ User authorization checks

---

## 📊 Database Schema

```typescript
interface IDocument {
  title: string;                    // Required
  description?: string;
  workspace: ObjectId;              // Required
  author: ObjectId;                 // Required
  fileUrl: string;                  // Required
  fileName: string;                 // Required
  fileType: string;                 // Required
  fileSize: number;                 // Required
  extractedText?: string;           // From PDF/DOCX parsing
  summary?: {
    content: string;
    keyPoints: string[];
    topics: string[];
    sentiment: string;
  };
  tags: string[];
  category?: string;
  isPinned: boolean;
  isArchived: boolean;
  collaborators: ObjectId[];
  viewCount: number;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🎯 Key Features Summary

### ✅ Create Documents
- Upload PDF, DOCX, TXT files
- Automatic text extraction
- Tag and categorize documents
- Workspace association
- Search indexing

### ✅ View Documents
- Full document preview
- Metadata display
- AI summary generation
- Download functionality
- View count tracking

### ✅ Manage Documents
- Rename documents
- Update tags and description
- Delete documents and files
- Share documents
- Filter and search

### ✅ Real-time Updates
- Documents appear instantly after creation
- No page refresh needed
- Optimistic UI updates
- Error handling and rollback

---

## 🚀 Next Steps (Optional Enhancements)

1. **Cloud Storage** - Move from local storage to S3/CloudFlare
2. **Real-time Collaboration** - Socket.io for live updates
3. **Version Control** - Track document versions
4. **Advanced Search** - Meilisearch/Elasticsearch integration
5. **OCR Support** - Extract text from scanned PDFs
6. **Document Annotations** - Add comments and highlights
7. **Batch Operations** - Upload/delete multiple documents
8. **Export Options** - Export to different formats

---

## 📝 Summary

**All document functionality is working correctly:**

✅ Users can create documents (PDF/DOCX) and see them instantly  
✅ Users can view document details without "Not Found" errors  
✅ PDF/DOCX content is properly parsed and displayed  
✅ Documents can be updated and deleted  
✅ Real-time updates reflect database state  
✅ Authorization and security are properly implemented  

**No issues found. System is production-ready!** 🎉
