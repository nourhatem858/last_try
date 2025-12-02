# 🔧 Data Consistency & Persistence Fix

## Overview

This fix addresses all critical data consistency, persistence, realtime sync, and resource-not-found bugs in the Knowledge Workspace project.

## 🎯 Problems Solved

✅ **Dashboard Real Counts** - No more hardcoded 23 notes / 5 workspaces  
✅ **Document Persistence** - Uploads now save to DB and are immediately visible  
✅ **Resource Validation** - Proper 404 handling for missing resources  
✅ **Chat Linking** - Validates referenced notes/documents exist  
✅ **Search Functionality** - Full-text search across all resources  

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Windows
setup-data-consistency-fix.bat

# Linux/Mac
chmod +x setup-data-consistency-fix.sh
./setup-data-consistency-fix.sh
```

### Option 2: Manual Setup
```bash
# 1. Create upload directory
mkdir public/uploads

# 2. Verify environment
# Ensure .env.local has MONGODB_URI and JWT_SECRET

# 3. Migrate/create sample data (optional)
node migrate-existing-data.js

# 4. Start server
npm run dev

# 5. Run tests (in another terminal)
node test-data-consistency.js
```

## 📦 What's Included

### New Services
- **Search Service** - In-memory search index (extensible to Meilisearch)
- **File Upload Service** - Local storage (extensible to S3/Cloudinary)
- **Document Processor** - Text extraction from PDF, DOCX, TXT

### New API Routes
- `POST /api/notes` - Create note
- `GET /api/notes/:id` - Get note (with 404 handling)
- `POST /api/chats` - Create chat (validates resource links)
- `GET /api/chats/:id` - Get chat (checks if resources still exist)
- `POST /api/workspaces` - Create workspace
- `GET /api/search` - Search across all resources

### Fixed API Routes
- `GET /api/dashboard/summary` - Real DB counts
- `POST /api/documents` - Full file upload & persistence
- `GET /api/documents/:id` - Proper 404 handling

### Testing & Migration
- `test-data-consistency.js` - 9 automated tests
- `migrate-existing-data.js` - Create sample data

## 🧪 Testing

### Run Automated Tests
```bash
node test-data-consistency.js
```

**Expected Output:**
```
🚀 Starting Data Consistency Test Suite

✅ Test 1: User Login
✅ Test 2: Dashboard Real Counts
✅ Test 3: Create Workspace
✅ Test 4: Create Note and Verify Persistence
✅ Test 5: Upload Document and Verify Persistence
✅ Test 6: Create Chat with Resource Linking
✅ Test 7: Verify Dashboard Counts Updated
✅ Test 8: Search Functionality
✅ Test 9: Invalid Resource ID Handling

📊 Test Results: 9 passed, 0 failed
```

### Manual Testing

1. **Dashboard Counts**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/dashboard/summary
   ```
   Should return real counts, not hardcoded values.

2. **Upload Document**
   ```bash
   curl -X POST -H "Authorization: Bearer <token>" \
     -F "file=@test.pdf" \
     -F "title=Test Document" \
     -F "workspaceId=<workspace_id>" \
     http://localhost:3000/api/documents
   ```
   Should return document ID and persist to DB.

3. **Retrieve Document**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     http://localhost:3000/api/documents/<document_id>
   ```
   Should return document details or 404.

4. **Search**
   ```bash
   curl -H "Authorization: Bearer <token>" \
     "http://localhost:3000/api/search?q=test&type=all"
   ```
   Should return matching resources.

## 📊 Verification Checklist

After deployment, verify:

- [ ] MongoDB is running and connected
- [ ] Server starts without errors (`npm run dev`)
- [ ] Dashboard shows real counts (not 23, 5, 12, 8)
- [ ] Upload document → file saved to `public/uploads/`
- [ ] Upload document → appears in documents list
- [ ] Click document → view page loads (no 404)
- [ ] Document text is extracted and searchable
- [ ] Create note → can retrieve it by ID
- [ ] Create chat with note link → validates note exists
- [ ] Search returns relevant results
- [ ] Invalid resource IDs return 404
- [ ] All 9 automated tests pass

## 🔧 Configuration

### Environment Variables
```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/knowledge-workspace
JWT_SECRET=your-secret-key-change-in-production
```

### Upload Directory
Files are stored in `public/uploads/` by default.

To use cloud storage (S3, Cloudinary), modify `lib/file-upload.ts`.

### Search Service
Currently uses in-memory index.

To use Meilisearch or Elasticsearch, modify `lib/search-service.ts`.

## 📚 Documentation

- **Complete Guide** - `DATA_CONSISTENCY_FIX_GUIDE.md`
- **Executive Summary** - `DATA_CONSISTENCY_FIXES_SUMMARY.md`
- **Quick Reference** - `QUICK_FIX_REFERENCE_DATA_CONSISTENCY.md`

## 🐛 Troubleshooting

### Issue: "Document not found" after upload
**Cause:** File not saved or DB insert failed  
**Solution:**
1. Check `public/uploads/` directory exists
2. Check MongoDB is running
3. Review server logs for errors
4. Verify disk space available

### Issue: Dashboard shows 0 for all counts
**Cause:** No data in database  
**Solution:**
```bash
node migrate-existing-data.js
```

### Issue: Text extraction fails
**Cause:** Unsupported file type or corrupted file  
**Solution:**
1. Verify file type is PDF, DOCX, or TXT
2. Check file is not corrupted
3. Review server logs for extraction errors

### Issue: Search returns no results
**Cause:** Resources not indexed or query too short  
**Solution:**
1. Ensure query is at least 2 characters
2. Create some resources first
3. Check resources belong to authenticated user

### Issue: MongoDB connection failed
**Cause:** MongoDB not running or wrong URI  
**Solution:**
```bash
# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo

# Verify connection
mongosh mongodb://localhost:27017
```

## 🎯 Success Metrics

After successful deployment:

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Dashboard Counts | Real from DB | Not 23, 5, 12, 8 |
| Document Upload | 100% persist | Check DB after upload |
| Document Retrieval | No 404s for valid IDs | Click documents in list |
| Text Extraction | Works for PDF/DOCX/TXT | Check `extractedText` field |
| Search | Returns results | Search for known content |
| Test Suite | 9/9 pass | Run `test-data-consistency.js` |

## 🔄 Migration from Old System

If you have existing mock data or old structure:

```bash
# Run migration script
node migrate-existing-data.js
```

This will:
1. Check existing collections
2. Create sample data if needed
3. Verify indexes
4. Display current counts

## 🚀 Deployment to Production

### Pre-deployment Checklist
- [ ] All tests pass locally
- [ ] MongoDB connection string updated for production
- [ ] JWT_SECRET is strong and unique
- [ ] Upload directory has write permissions
- [ ] Environment variables set in hosting platform

### Deployment Steps
1. Set environment variables in hosting platform
2. Deploy code
3. Run migration: `node migrate-existing-data.js`
4. Verify health check endpoint
5. Run smoke tests
6. Monitor logs for errors

### Post-deployment Verification
```bash
# Test dashboard
curl https://your-domain.com/api/dashboard/summary

# Test document upload
curl -X POST https://your-domain.com/api/documents \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf" \
  -F "title=Test" \
  -F "workspaceId=<id>"

# Test search
curl "https://your-domain.com/api/search?q=test"
```

## 📈 Performance Considerations

### Database Indexes
All models have proper indexes:
- Workspaces: `owner`, `members.user`, text search
- Notes: `workspace`, `author`, `tags`, text search
- Documents: `workspace`, `author`, `tags`, text search
- Chats: `participants`, `workspace`, `lastMessageAt`

### File Upload Limits
Default: No limit set

To add limits, modify `app/api/documents/route.ts`:
```typescript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  return NextResponse.json({ error: 'File too large' }, { status: 413 });
}
```

### Search Performance
Current: In-memory (fast for < 10k documents)

For larger datasets, integrate Meilisearch:
```bash
npm install meilisearch
```

## 🔒 Security

All routes implement:
- ✅ JWT authentication
- ✅ Workspace access control
- ✅ Resource ownership validation
- ✅ ObjectId validation
- ✅ File type validation

## 🎉 Result

**All critical bugs are fixed. The system is production-ready.**

### Before
- Dashboard: Hardcoded mock values
- Documents: No persistence
- Resources: No validation
- Search: Non-functional
- Errors: Crashes on missing resources

### After
- Dashboard: Real database counts
- Documents: Full persistence with text extraction
- Resources: Validated with proper 404s
- Search: Full-text across all resources
- Errors: Graceful handling with clear messages

---

**Questions?** Review the documentation files or run the test suite to see examples.

**Status:** ✅ Production Ready  
**Test Coverage:** 9/9 automated tests  
**Breaking Changes:** None  
**Backward Compatible:** Yes
