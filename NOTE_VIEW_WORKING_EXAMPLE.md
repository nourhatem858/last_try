# 📘 Note View - Working Example

Complete working example with TypeScript types, error handling, and best practices.

---

## 🎯 Complete Frontend Implementation

### TypeScript Types

```typescript
// types/note.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  workspace?: string;
  workspaceId?: string;
  author?: string;
  isPinned: boolean;
  isArchived?: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteResponse {
  success: boolean;
  note?: Note;
  error?: string;
  message?: string;
}

export interface NotesListResponse {
  success: boolean;
  notes?: Note[];
  error?: string;
  message?: string;
}
```

---

### Frontend Page Component

```typescript
// app/notes/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Note, NoteResponse } from '@/types/note';

export default function NoteViewPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const noteId = params?.id as string;

  useEffect(() => {
    // Validate note ID exists
    if (!noteId) {
      setError('Note ID is missing');
      setLoading(false);
      return;
    }
    
    // Validate ObjectId format (24 hex characters)
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(noteId)) {
      setError('Invalid note ID format');
      setLoading(false);
      return;
    }
    
    // Check authentication
    if (!token) {
      setError('Please login to view this note');
      setLoading(false);
      return;
    }
    
    fetchNote();
  }, [noteId, token]);

  const fetchNote = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Make API request with Authorization header
      const response = await fetch(`/api/notes/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      // Parse JSON response
      const data: NoteResponse = await response.json();

      // Handle errors
      if (!response.ok) {
        if (response.status === 400) {
          setError(data.message || 'Invalid note ID format');
        } else if (response.status === 401) {
          setError(data.message || 'Please login to view this note');
        } else if (response.status === 403) {
          setError(data.message || 'You do not have permission to view this note');
        } else if (response.status === 404) {
          setError(data.message || 'This note does not exist or has been deleted');
        } else {
          setError(data.message || 'Failed to load note');
        }
        return;
      }

      // Validate response structure
      if (data.success && data.note) {
        setNote(data.note);
      } else {
        setError(data.error || data.message || 'Failed to load note');
      }
    } catch (err: any) {
      console.error('Fetch note error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error}</p>
        <button onClick={() => router.push('/notes')}>
          Back to Notes
        </button>
        {error.includes('login') && (
          <button onClick={() => router.push('/login')}>
            Login
          </button>
        )}
      </div>
    );
  }

  // Success state
  if (!note) return null;

  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
      <div>
        <span>Author: {note.author}</span>
        <span>Workspace: {note.workspace}</span>
        <span>Created: {new Date(note.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
```

---

## 🔧 Complete Backend Implementation

### API Route Handler

```typescript
// app/api/notes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const noteId = params.id;
    
    // 1. Check authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Authentication token is required'
        }, 
        { status: 401 }
      );
    }

    // 2. Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token',
          message: 'Your session has expired. Please login again.'
        }, 
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 3. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid note ID',
          message: 'The note ID format is invalid'
        }, 
        { status: 400 }
      );
    }

    // 4. Connect to MongoDB
    await connectDB();

    // 5. Import models
    const Note = (await import('@/models/Note')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    // 6. Find note
    const note = await Note.findById(noteId)
      .populate('workspace', 'name')
      .populate('author', 'name email')
      .lean();

    if (!note) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Note not found',
          message: 'This note does not exist or has been deleted'
        }, 
        { status: 404 }
      );
    }

    // 7. Verify workspace access
    const workspace = await Workspace.findOne({
      _id: note.workspace,
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    if (!workspace) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied',
          message: 'You do not have permission to view this note'
        }, 
        { status: 403 }
      );
    }

    // 8. Return note data
    return NextResponse.json({
      success: true,
      note: {
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        workspace: (note.workspace as any)?.name || 'Unknown',
        workspaceId: note.workspace.toString(),
        author: (note.author as any)?.name || 'Unknown',
        isPinned: note.isPinned || false,
        isArchived: note.isArchived || false,
        color: 'cyan',
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    }, { status: 200 });

  } catch (error: any) {
    console.error('API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        message: 'An unexpected error occurred'
      }, 
      { status: 500 }
    );
  }
}
```

---

## 🧪 Testing Examples

### Test 1: Fetch Note with Valid Token

```typescript
// Browser console or test file
async function testFetchNote() {
  const token = localStorage.getItem('token');
  const noteId = '507f1f77bcf86cd799439011'; // Replace with real ID
  
  const response = await fetch(`/api/notes/${noteId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  console.log('Response:', data);
  
  if (data.success) {
    console.log('✅ Note loaded:', data.note.title);
  } else {
    console.error('❌ Error:', data.message);
  }
}

testFetchNote();
```

**Expected Success Response:**
```json
{
  "success": true,
  "note": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My Sample Note",
    "content": "This is the note content",
    "tags": ["important", "work"],
    "workspace": "My Workspace",
    "workspaceId": "507f1f77bcf86cd799439012",
    "author": "John Doe",
    "isPinned": false,
    "isArchived": false,
    "color": "cyan",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Test 2: Fetch Note Without Token (Should Fail)

```typescript
async function testNoToken() {
  const noteId = '507f1f77bcf86cd799439011';
  
  const response = await fetch(`/api/notes/${noteId}`);
  const data = await response.json();
  
  console.log('Status:', response.status); // Should be 401
  console.log('Response:', data);
}

testNoToken();
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Unauthorized",
  "message": "Authentication token is required"
}
```

---

### Test 3: Fetch Note with Invalid ID (Should Fail)

```typescript
async function testInvalidId() {
  const token = localStorage.getItem('token');
  const invalidId = 'invalid-id-123';
  
  const response = await fetch(`/api/notes/${invalidId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  const data = await response.json();
  
  console.log('Status:', response.status); // Should be 400
  console.log('Response:', data);
}

testInvalidId();
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Invalid note ID",
  "message": "The note ID format is invalid"
}
```

---

## 🔍 Validation Functions

### Frontend ObjectId Validation

```typescript
// utils/validation.ts
export function isValidObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

// Usage
import { isValidObjectId } from '@/utils/validation';

if (!isValidObjectId(noteId)) {
  setError('Invalid note ID format');
  return;
}
```

---

### Backend ObjectId Validation

```typescript
// Using mongoose
import mongoose from 'mongoose';

if (!mongoose.Types.ObjectId.isValid(noteId)) {
  return NextResponse.json(
    { success: false, error: 'Invalid note ID' },
    { status: 400 }
  );
}
```

---

## 🎨 Error Handling Patterns

### Pattern 1: Centralized Error Handler

```typescript
function handleApiError(response: Response, data: any): string {
  const statusMessages: Record<number, string> = {
    400: data.message || 'Invalid request',
    401: data.message || 'Please login to continue',
    403: data.message || 'Access denied',
    404: data.message || 'Resource not found',
    500: data.message || 'Server error',
    503: data.message || 'Service unavailable',
  };
  
  return statusMessages[response.status] || 'An error occurred';
}

// Usage
if (!response.ok) {
  const errorMessage = handleApiError(response, data);
  setError(errorMessage);
  return;
}
```

---

### Pattern 2: Error Boundary Component

```typescript
// components/ErrorBoundary.tsx
interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  onBack?: () => void;
}

export function ErrorDisplay({ error, onRetry, onBack }: ErrorDisplayProps) {
  const getErrorType = (error: string) => {
    if (error.includes('login') || error.includes('Authentication')) {
      return 'auth';
    }
    if (error.includes('not exist') || error.includes('deleted')) {
      return 'notFound';
    }
    if (error.includes('permission') || error.includes('Access denied')) {
      return 'forbidden';
    }
    if (error.includes('Invalid') || error.includes('format')) {
      return 'invalid';
    }
    return 'generic';
  };

  const errorType = getErrorType(error);

  return (
    <div className="error-container">
      <h1>
        {errorType === 'auth' && 'Authentication Required'}
        {errorType === 'notFound' && 'Not Found'}
        {errorType === 'forbidden' && 'Access Denied'}
        {errorType === 'invalid' && 'Invalid Request'}
        {errorType === 'generic' && 'Error'}
      </h1>
      <p>{error}</p>
      <div className="actions">
        {onBack && <button onClick={onBack}>Go Back</button>}
        {onRetry && <button onClick={onRetry}>Try Again</button>}
        {errorType === 'auth' && (
          <button onClick={() => window.location.href = '/login'}>
            Login
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## 📊 Response Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Note fetched successfully |
| 400 | Bad Request | Invalid note ID format |
| 401 | Unauthorized | No token or invalid token |
| 403 | Forbidden | User not in workspace |
| 404 | Not Found | Note doesn't exist |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database connection failed |

---

## 🚀 Best Practices

### 1. Always Validate Input
```typescript
// Frontend
if (!noteId || !isValidObjectId(noteId)) {
  setError('Invalid note ID');
  return;
}

// Backend
if (!mongoose.Types.ObjectId.isValid(noteId)) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
}
```

### 2. Include Authorization Header
```typescript
const response = await fetch(`/api/notes/${noteId}`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### 3. Handle All Error Cases
```typescript
if (!response.ok) {
  switch (response.status) {
    case 400: setError('Invalid request'); break;
    case 401: setError('Please login'); break;
    case 403: setError('Access denied'); break;
    case 404: setError('Not found'); break;
    default: setError('An error occurred');
  }
  return;
}
```

### 4. Provide User-Friendly Messages
```typescript
// ❌ Bad
setError('ERR_INVALID_OBJECTID');

// ✅ Good
setError('The note ID format is invalid. Please check the URL.');
```

### 5. Log for Debugging
```typescript
console.log('🔍 Fetching note:', noteId);
console.log('🔑 Token exists:', !!token);
console.log('📡 Response status:', response.status);
console.log('📦 Response data:', data);
```

---

## 🎯 Quick Reference

### Frontend Checklist
- [ ] Validate note ID format before API call
- [ ] Check token exists before API call
- [ ] Include Authorization header in fetch
- [ ] Handle all error status codes
- [ ] Show user-friendly error messages
- [ ] Provide retry/back buttons

### Backend Checklist
- [ ] Extract and verify JWT token
- [ ] Validate ObjectId format
- [ ] Connect to database
- [ ] Check note exists
- [ ] Verify user has access
- [ ] Return proper status codes
- [ ] Include error messages

### Common Errors
- **No token** → Redirect to login
- **Invalid ID** → Show error, go back to notes list
- **Not found** → Show error, go back to notes list
- **Access denied** → Show error, explain workspace membership
- **Server error** → Show error, provide retry button
