# 🔌 API Documentation - AI-Powered Knowledge Workspace

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except auth) require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔐 Authentication

### Sign Up
Create a new user account.

**Endpoint:** `POST /auth/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login
Authenticate existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

---

## 🤖 AI Features

### Ask AI Question
Ask AI a question about your workspace content.

**Endpoint:** `POST /ai/ask`

**Request Body:**
```json
{
  "question": "What are my recent notes about?",
  "conversationId": "optional_conversation_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "conversation_id",
    "content": "Based on your recent notes, you've been working on...",
    "sources": [
      {
        "type": "note",
        "id": "note_id",
        "title": "Project Planning",
        "excerpt": "Meeting notes about..."
      }
    ]
  }
}
```

### Generate Content
Generate content using AI.

**Endpoint:** `POST /ai/generate`

**Request Body:**
```json
{
  "prompt": "Create a guide about implementing AI in web applications",
  "category": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "title": "Implementing AI in Modern Web Applications",
  "content": "Artificial Intelligence has revolutionized...",
  "tags": ["ai", "web-development", "implementation", "guide"],
  "message": "Content generated successfully"
}
```

### Summarize Document
Get AI-generated summary of a document.

**Endpoint:** `GET /ai/summarize-document?id={documentId}`

**Response:**
```json
{
  "success": true,
  "summary": {
    "summary": "This document provides a comprehensive overview...",
    "keyPoints": [
      "Digital-first marketing approach",
      "Focus on social media engagement",
      "Budget allocation across channels"
    ],
    "topics": ["Marketing", "Strategy", "Social Media"],
    "sentiment": "positive",
    "readingTime": "5 minutes"
  }
}
```

### List AI Conversations
Get all AI conversation history.

**Endpoint:** `GET /ai/conversations`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conversation_id",
      "title": "Project Planning Discussion",
      "messages": [
        {
          "id": "message_id",
          "role": "user",
          "content": "What are the key milestones?",
          "timestamp": "2025-11-29T10:00:00Z"
        },
        {
          "id": "message_id",
          "role": "assistant",
          "content": "Based on your documents...",
          "timestamp": "2025-11-29T10:00:05Z",
          "sources": []
        }
      ],
      "createdAt": "2025-11-29T10:00:00Z",
      "updatedAt": "2025-11-29T10:00:05Z"
    }
  ]
}
```

---

## 🔍 Search

### Advanced Search
Search across notes, documents, and workspaces with fuzzy matching.

**Endpoint:** `GET /search`

**Query Parameters:**
- `q` (required): Search query
- `types` (optional): Comma-separated types (note,document,workspace)
- `workspaceId` (optional): Filter by workspace
- `limit` (optional): Number of results (default: 20)
- `semantic` (optional): Use semantic search (true/false)

**Example:**
```
GET /search?q=project%20plan&types=note,document&semantic=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "notes": [
      {
        "id": "note_id",
        "type": "note",
        "title": "Project Planning Notes",
        "snippet": "Meeting notes about project plan...",
        "score": 8.5,
        "metadata": {
          "workspace": { "name": "Marketing" },
          "tags": ["planning", "project"]
        }
      }
    ],
    "documents": [],
    "workspaces": []
  },
  "total": 1,
  "query": "project plan"
}
```

---

## 📝 Notes

### List Notes
Get all notes for the user.

**Endpoint:** `GET /notes`

**Query Parameters:**
- `workspaceId` (optional): Filter by workspace
- `limit` (optional): Number of results (default: 50)
- `skip` (optional): Skip results for pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "note_id",
      "title": "Project Planning Notes",
      "content": "Meeting notes about...",
      "tags": ["planning", "meeting"],
      "workspace": "Marketing Campaign",
      "workspaceId": "workspace_id",
      "createdAt": "2025-11-29T10:00:00Z",
      "updatedAt": "2025-11-29T10:00:00Z",
      "author": {
        "id": "user_id",
        "name": "John Doe"
      },
      "isPinned": false,
      "category": "Planning",
      "aiGenerated": false
    }
  ],
  "count": 1
}
```

### Create Note
Create a new note with AI-generated tags.

**Endpoint:** `POST /notes`

**Request Body:**
```json
{
  "title": "AI Implementation Guide",
  "content": "This guide covers machine learning, neural networks...",
  "workspaceId": "workspace_id",
  "tags": ["ai", "guide"],
  "category": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Note created successfully",
  "data": {
    "id": "note_id",
    "title": "AI Implementation Guide",
    "content": "This guide covers...",
    "tags": ["ai", "guide", "machine-learning", "neural-networks"],
    "workspace": "Tech Workspace",
    "workspaceId": "workspace_id",
    "createdAt": "2025-11-29T10:00:00Z",
    "updatedAt": "2025-11-29T10:00:00Z",
    "author": {
      "id": "user_id",
      "name": "John Doe"
    },
    "isPinned": false,
    "category": "Technology",
    "aiGenerated": false
  }
}
```

---

## 📄 Documents

### Upload Document
Upload and process a PDF or DOCX file.

**Endpoint:** `POST /documents/upload`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file` (required): PDF or DOCX file (max 10MB)
- `workspaceId` (optional): Workspace ID
- `title` (optional): Document title
- `description` (optional): Document description

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded and processed successfully",
  "data": {
    "id": "document_id",
    "title": "Marketing Strategy Q1 2025",
    "description": "Comprehensive marketing plan",
    "workspace": "Marketing Campaign",
    "workspaceId": "workspace_id",
    "fileName": "marketing-strategy.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576,
    "summary": {
      "content": "This document outlines...",
      "keyPoints": ["Digital-first approach", "Social media focus"],
      "topics": ["Marketing", "Strategy"],
      "sentiment": "positive"
    },
    "tags": ["marketing", "strategy", "q1", "2025"],
    "createdAt": "2025-11-29T10:00:00Z"
  }
}
```

### List Documents
Get all documents for the user.

**Endpoint:** `GET /documents`

**Query Parameters:**
- `workspaceId` (optional): Filter by workspace
- `limit` (optional): Number of results
- `skip` (optional): Skip results for pagination

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "document_id",
      "title": "Marketing Strategy",
      "description": "Q1 2025 marketing plan",
      "workspace": "Marketing Campaign",
      "fileName": "strategy.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048576,
      "tags": ["marketing", "strategy"],
      "createdAt": "2025-11-29T10:00:00Z"
    }
  ],
  "count": 1
}
```

---

## 🏢 Workspaces

### List Workspaces
Get all workspaces for the user.

**Endpoint:** `GET /workspaces`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "workspace_id",
      "name": "Marketing Campaign",
      "description": "Q1 2025 marketing materials",
      "members": 5,
      "documents": 12,
      "notes": 8,
      "createdAt": "2025-11-22T10:00:00Z",
      "updatedAt": "2025-11-29T10:00:00Z",
      "owner": {
        "id": "user_id",
        "name": "John Doe"
      },
      "tags": ["marketing", "q1"],
      "settings": {
        "visibility": "private",
        "allowMemberInvites": false,
        "defaultNotePermission": "edit"
      }
    }
  ],
  "count": 1
}
```

### Create Workspace
Create a new workspace.

**Endpoint:** `POST /workspaces`

**Request Body:**
```json
{
  "name": "Product Development",
  "description": "New feature specifications",
  "tags": ["product", "development"],
  "settings": {
    "visibility": "team",
    "allowMemberInvites": true,
    "defaultNotePermission": "edit"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Workspace created successfully",
  "data": {
    "id": "workspace_id",
    "name": "Product Development",
    "description": "New feature specifications",
    "members": 1,
    "documents": 0,
    "notes": 0,
    "createdAt": "2025-11-29T10:00:00Z",
    "updatedAt": "2025-11-29T10:00:00Z",
    "owner": {
      "id": "user_id",
      "name": "John Doe"
    },
    "tags": ["product", "development"],
    "settings": {
      "visibility": "team",
      "allowMemberInvites": true,
      "defaultNotePermission": "edit"
    }
  }
}
```

---

## ⚠️ Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🧪 Testing

Use the provided test suite to validate all endpoints:

```bash
node test-ai-system.js
```

Or test individual endpoints using curl:

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Ask AI (with token)
curl -X POST http://localhost:3000/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"question":"What are my recent notes about?"}'

# Search
curl "http://localhost:3000/api/search?q=project%20plan" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Additional Resources

- **QUICK_START_AI.md** - Quick start guide
- **AI_IMPLEMENTATION_COMPLETE.md** - Full setup guide
- **TRANSFORMATION_COMPLETE_REPORT.md** - Feature details
- **test-ai-system.js** - Automated test suite

---

*API Documentation - AI-Powered Knowledge Workspace*
*Version: 1.0.0*
*Last Updated: November 29, 2025*
