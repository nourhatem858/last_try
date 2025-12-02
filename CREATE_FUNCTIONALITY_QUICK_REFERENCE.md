# 🚀 Create Note & Document - Quick Reference

## ⚡ Quick Commands

```bash
# Start server
npm run dev

# Test functionality
node test-create-functionality.js

# Create test user (if needed)
node create-test-user.js
```

---

## 📝 Create Note

### Frontend Code
```typescript
const handleCreateNote = async (data: { 
  title: string; 
  content: string; 
  tags: string[]; 
  color: string 
}) => {
  const response = await fetch('/api/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    setNotes([result.data, ...notes]); // Add to list immediately
  }
};
```

### API Request
```json
POST /api/notes
Headers: { "Authorization": "Bearer <token>" }
Body: {
  "title": "My Note",
  "content": "Note content...",
  "tags": ["tag1", "tag2"],
  "workspaceId": "optional"
}
```

### API Response
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "...",
    "title": "My Note",
    "content": "Note content...",
    "tags": ["tag1", "tag2"],
    "workspace": "Personal",
    "createdAt": "2025-11-30T..."
  }
}
```

---

## 📄 Create Document

### Frontend Code
```typescript
const handleUploadDocument = async (data: { 
  file: File; 
  title: string; 
  tags: string[] 
}) => {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('title', data.title);
  formData.append('tags', JSON.stringify(data.tags));

  const response = await fetch('/api/documents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (response.ok) {
    const result = await response.json();
    setDocuments([result.data, ...documents]); // Add to list immediately
  }
};
```

### API Request
```
POST /api/documents
Headers: { "Authorization": "Bearer <token>" }
Body: FormData {
  file: [File],
  title: "My Document",
  tags: ["tag1", "tag2"],
  workspaceId: "optional"
}
```

### API Response
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "...",
    "title": "My Document",
    "fileName": "document.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "workspace": "Personal",
    "uploadedAt": "2025-11-30T..."
  }
}
```

---

## 🔐 Authentication

### Check if User is Logged In
```typescript
const token = localStorage.getItem('token');
if (!token) {
  toast.error("Please log in first.");
  router.push('/login');
  return;
}
```

### Send Token in Headers
```typescript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## ❌ Error Handling

### Frontend Validation
```typescript
// Check empty title
if (!title || !title.trim()) {
  setError('Note title is required');
  return;
}

// Check file selected
if (!selectedFile) {
  setError('Please select a file to upload');
  return;
}
```

### Backend Validation
```typescript
// Check auth
if (!token) {
  return NextResponse.json(
    { success: false, error: 'Unauthorized' },
    { status: 401 }
  );
}

// Check required fields
if (!title || !title.trim()) {
  return NextResponse.json(
    { success: false, error: 'Note title is required' },
    { status: 400 }
  );
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🎨 UI Components

### Create Note Modal
```typescript
<CreateNoteModal
  isOpen={showCreateModal}
  onClose={() => setShowCreateModal(false)}
  onCreate={handleCreateNote}
/>
```

### Upload Document Modal
```typescript
<UploadDocumentModal
  isOpen={showUploadModal}
  onClose={() => setShowUploadModal(false)}
  onUpload={handleUploadDocument}
/>
```

---

## 📊 Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success (GET) | Data retrieved |
| 201 | Created | Item created successfully |
| 400 | Bad Request | Check required fields |
| 401 | Unauthorized | Login required |
| 403 | Forbidden | No workspace access |
| 500 | Server Error | Check server logs |

---

## 🧪 Testing Checklist

### Create Note
- [ ] Open /notes page
- [ ] Click "Create Note"
- [ ] Fill title: "Test"
- [ ] Fill content: "Content"
- [ ] Add tags: "test"
- [ ] Click "Create Note"
- [ ] ✅ Note appears immediately
- [ ] ✅ Modal closes
- [ ] ✅ Stats update

### Create Document
- [ ] Open /documents page
- [ ] Click "Upload Document"
- [ ] Select file
- [ ] Fill title: "Test"
- [ ] Add tags: "test"
- [ ] Click "Upload Document"
- [ ] ✅ Document appears immediately
- [ ] ✅ Modal closes
- [ ] ✅ Stats update

### Error Cases
- [ ] Empty title → Error shown
- [ ] No file → Error shown
- [ ] Not logged in → Redirect to login
- [ ] Invalid token → 401 error

---

## 🔍 Debugging

### Check Token
```javascript
// In browser console
localStorage.getItem('token')
```

### Check API Response
```javascript
// In browser console (Network tab)
// Look for POST /api/notes or /api/documents
// Check Response tab for data
```

### Check Server Logs
```bash
# In terminal running npm run dev
# Look for console.log output
# Check for errors
```

---

## 📁 Key Files

```
API Routes:
  app/api/notes/route.ts
  app/api/documents/route.ts

Components:
  components/notes/CreateNoteModal.tsx
  components/documents/UploadDocumentModal.tsx

Pages:
  app/notes/page.tsx
  app/documents/page.tsx

Models:
  models/Note.ts
  models/DocumentModel.ts

Services:
  lib/mongodb.ts
  lib/search-service.ts
  lib/document-processor.ts
```

---

## 🎯 Common Issues & Solutions

### Issue: "Unauthorized" error
```typescript
// Solution: Check if user is logged in
const token = localStorage.getItem('token');
if (!token) {
  router.push('/login');
}
```

### Issue: Note/Document not appearing
```typescript
// Solution: Refresh the list after creation
const result = await response.json();
setNotes([result.data, ...notes]); // Add to beginning
```

### Issue: File upload fails
```typescript
// Solution: Check file size and type
if (file.size > 10 * 1024 * 1024) {
  setError('File too large (max 10MB)');
  return;
}
```

---

## ✅ Success Criteria

| Requirement | Status |
|-------------|--------|
| Save to database | ✅ |
| Appear immediately | ✅ |
| Error handling | ✅ |
| User ID association | ✅ |
| Theme consistency | ✅ |
| Empty field handling | ✅ |

---

## 🚀 Everything Works!

The Create Note and Create Document functionality is **fully implemented and tested**. Just run the server and start creating! 🎉
