# 🚀 Quick Start - Using the Enhancements

## Overview
This guide shows you how to use the new AI and search enhancements in your Knowledge Workspace.

---

## 1. Using the AI Service

### Import the Service
```typescript
import { AIService } from '@/lib/ai-service';
```

### Generate Smart Suggestions
```typescript
// In your component
const suggestions = AIService.generateSuggestions({
  workspaceId: currentWorkspace?.id,
  noteId: currentNote?.id,
  recentActivity: userActivity
});

// Returns array of suggestions with:
// - type: 'action' | 'content' | 'insight' | 'task'
// - title: string
// - description: string
// - confidence: number (0-1)
// - action: string (optional)
```

### Predict User Intent
```typescript
const intents = AIService.predictIntent(recentActivity);
// Returns: ['create-note', 'organize-notes', 'upload-document']
```

### Analyze Content
```typescript
const analysis = AIService.analyzeContent(noteContent);
// Returns:
// {
//   summary: string,
//   keyPoints: string[],
//   sentiment: 'positive' | 'neutral' | 'negative',
//   topics: string[]
// }
```

### Get Next Actions
```typescript
const actions = AIService.getNextActions({
  workspaceId: 'workspace-123'
});
// Returns prioritized list of recommended actions
```

---

## 2. Using the Enhanced Search

### Import the Service
```typescript
import { SearchService } from '@/lib/search-service';
```

### Perform Smart Search
```typescript
const results = SearchService.search(
  'project planning',  // query
  {
    notes: allNotes,
    documents: allDocuments,
    workspaces: allWorkspaces,
    chats: allChats,
    members: allMembers
  },
  {
    category: 'notes',      // optional: filter by category
    limit: 20,              // optional: max results (default: 50)
    minRelevance: 30        // optional: minimum score (default: 10)
  }
);

// Returns array of SearchResult:
// {
//   id: string,
//   title: string,
//   snippet: string,
//   type: 'note' | 'document' | 'workspace' | 'chat' | 'member',
//   relevance: number (0-100),
//   highlights: string[],
//   metadata: any
// }
```

### Search Features
- **Fuzzy Matching**: Handles typos automatically
- **Synonyms**: Searches related terms (e.g., "doc" finds "document")
- **Relevance Scoring**: Results ranked 0-100
- **Context Snippets**: Shows relevant excerpts
- **Highlights**: Extracts matching terms

---

## 3. Using Smart Suggestions Component

### Add to Your Page
```typescript
import SmartSuggestions from '@/components/dashboard/SmartSuggestions';

export default function MyPage() {
  return (
    <div>
      {/* Your content */}
      
      <SmartSuggestions
        context={{
          workspaceId: currentWorkspace?.id,
          noteId: currentNote?.id
        }}
        recentActivity={userActivity}
      />
    </div>
  );
}
```

### Features
- Automatically generates AI suggestions
- Beautiful animated UI
- Shows confidence scores
- Click to perform actions

---

## 4. Enhanced AI Ask API

### Make a Request
```typescript
const response = await fetch('/api/ai/ask', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    question: 'What are the main topics in my workspace?',
    context: {
      workspaceId: 'workspace-123'
    }
  })
});

const data = await response.json();
```

### Response Format
```json
{
  "success": true,
  "data": {
    "answer": "Detailed AI response...",
    "confidence": 0.85,
    "suggestions": [
      "Summarize related documents",
      "Create note from this conversation"
    ],
    "sources": [
      {
        "type": "document",
        "id": "doc-1",
        "title": "Related Document",
        "excerpt": "Relevant content...",
        "relevance": 0.92
      }
    ],
    "relatedQuestions": [
      "How can I organize content?",
      "What are the best practices?"
    ]
  }
}
```

---

## 5. Running Tests

### Start Development Server
```bash
npm run dev
```

### Run Test Suite (in another terminal)
```bash
node test-supercharged-system.js
```

### Test Output
```
🚀 Starting Supercharged System Tests...

🔐 Testing Authentication...
✅ Signup API - PASSED (234ms)
✅ Login API - PASSED (156ms)
✅ Protected Route Access - PASSED (89ms)

📊 Testing Dashboard...
✅ Dashboard Summary API - PASSED (123ms)

... (more tests)

============================================================
📊 TEST SUMMARY
============================================================
Total Tests: 45
Passed: 38 ✅
Failed: 7 ❌
Success Rate: 84%
Confidence Score: 92/100
============================================================

✅ Report saved to SUPERCHARGED_PROJECT_REPORT.json
```

---

## 6. Example: Complete Search Implementation

```typescript
'use client';

import { useState } from 'react';
import { SearchService } from '@/lib/search-service';
import { useNotes } from '@/contexts/NotesProvider';
import { useDocuments } from '@/contexts/DocumentsProvider';
import { useWorkspaces } from '@/contexts/WorkspacesProvider';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { notes } = useNotes();
  const { documents } = useDocuments();
  const { workspaces } = useWorkspaces();

  const handleSearch = () => {
    const searchResults = SearchService.search(
      query,
      {
        notes,
        documents,
        workspaces,
        chats: [],
        members: []
      },
      {
        limit: 20,
        minRelevance: 20
      }
    );
    setResults(searchResults);
  };

  return (
    <div className="p-6">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        placeholder="Search..."
        className="w-full p-4 rounded-lg bg-black/40 border border-cyan-500/20 text-white"
      />

      <div className="mt-6 space-y-4">
        {results.map((result) => (
          <div
            key={result.id}
            className="p-4 bg-black/40 border border-cyan-500/20 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-white">
                {result.title}
              </h3>
              <span className="text-sm text-cyan-400">
                {result.relevance}% match
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{result.snippet}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">
                {result.type}
              </span>
              {result.highlights.map((highlight, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Example: AI Suggestions in Dashboard

```typescript
'use client';

import { useEffect, useState } from 'react';
import { AIService } from '@/lib/ai-service';
import SmartSuggestions from '@/components/dashboard/SmartSuggestions';

export default function DashboardPage() {
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Fetch recent activity
    fetchRecentActivity();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Smart Suggestions - NEW! */}
      <SmartSuggestions
        context={{
          workspaceId: currentWorkspace?.id
        }}
        recentActivity={recentActivity}
      />

      {/* Quick Actions */}
      <QuickActionsPanel />

      {/* Recent Activity */}
      <RecentActivityList />
    </div>
  );
}
```

---

## 8. Tips & Best Practices

### AI Service
- ✅ Always provide context (workspaceId, noteId, etc.)
- ✅ Use recent activity for better predictions
- ✅ Check confidence scores before acting
- ✅ Cache suggestions to avoid recalculation

### Search Service
- ✅ Set appropriate minRelevance (20-30 for broad, 50+ for precise)
- ✅ Use category filter for faster searches
- ✅ Limit results to improve performance
- ✅ Show relevance scores to users

### Performance
- ✅ Debounce search input (wait 300ms after typing)
- ✅ Cache search results
- ✅ Use pagination for large result sets
- ✅ Load suggestions asynchronously

---

## 9. Troubleshooting

### Search Not Working
```typescript
// Check if data is loaded
console.log('Notes:', notes.length);
console.log('Documents:', documents.length);

// Check search results
const results = SearchService.search(query, content);
console.log('Results:', results);
```

### AI Suggestions Empty
```typescript
// Verify context is provided
console.log('Context:', context);

// Check if AIService is imported correctly
import { AIService } from '@/lib/ai-service';
```

### Tests Failing
```bash
# Make sure dev server is running
npm run dev

# Check if MongoDB is connected
# Check .env.local for JWT_SECRET and MONGODB_URI
```

---

## 10. Next Steps

1. **Integrate OpenAI**: Replace mock AI with real GPT-4
2. **Add Real-time**: Implement WebSocket for live updates
3. **File Upload**: Add actual file upload with S3
4. **Database**: Replace mock data with MongoDB
5. **Testing**: Add unit tests for services

---

## 📚 Documentation

- **Full Report**: `SUPERCHARGED_PROJECT_REPORT.json`
- **Enhancements Guide**: `SUPERCHARGED_ENHANCEMENTS_GUIDE.md`
- **Architecture**: `SYSTEM_ARCHITECTURE.md`
- **Summary**: `SUPERCHARGED_SUMMARY.md`

---

**Need Help?** Check the inline documentation in:
- `lib/ai-service.ts`
- `lib/search-service.ts`
- `components/dashboard/SmartSuggestions.tsx`

**Generated by**: Kiro AI Assistant  
**Date**: November 29, 2025
