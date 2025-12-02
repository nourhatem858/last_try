# 🚀 Developer Quick Reference

## 🔧 What Was Fixed

### 1. Notifications Badge (CRITICAL)
**Before**: Always showed "2" (hardcoded)  
**After**: Shows real count from MongoDB, hides when 0

**API**: `GET /api/notifications`
```typescript
// Returns real notifications from database
const notifications = await Notification.find({ user: userId });
```

### 2. Sidebar Counters (CRITICAL)
**Before**: Showed fake numbers (Notes: 12, Docs: 8)  
**After**: Real MongoDB counts, shows 0 when empty

**API**: `GET /api/stats`
```typescript
// Returns real counts using countDocuments()
{
  workspaces: 0,
  notes: 0,
  documents: 0,
  notifications: 0
}
```

### 3. Note View Page (CRITICAL)
**Before**: Crashed on invalid IDs  
**After**: Proper validation and error messages

**API**: `GET /api/notes/[id]`
- ✅ Validates ObjectId format
- ✅ Returns 400 for invalid IDs
- ✅ Returns 404 for not found

### 4. Document System (CRITICAL)
**Before**: Upload folder didn't exist  
**After**: Auto-creates folder, full viewer page

**New Page**: `/documents/[id]`
- ✅ View document details
- ✅ Download functionality
- ✅ Share functionality
- ✅ Extracted text preview

### 5. Members System (PARTIAL)
**API Works**: `POST /api/members` saves correctly  
**Frontend Needs**: Call `fetchMembers()` after adding

```typescript
// Add this after successful POST
await fetchMembers(); // Refresh list
```

### 6. Auth Flow (ALREADY GOOD)
- ✅ Login returns 404 for invalid email
- ✅ Login returns 401 for wrong password
- ✅ Signup returns 409 for duplicate email

### 7. Architecture (IMPROVED)
**New Files**:
- `lib/logger.ts` - Centralized logging
- `lib/env-validator.ts` - Environment validation
- `app/api/stats/route.ts` - Stats endpoint

---

## 📡 API Endpoints

### Authentication
```
POST /api/auth/signup    - Create account
POST /api/auth/login     - Login
GET  /api/auth/me        - Get current user
```

### Notes
```
GET    /api/notes        - List notes
POST   /api/notes        - Create note
GET    /api/notes/[id]   - Get note (✅ FIXED)
PATCH  /api/notes/[id]   - Update note
DELETE /api/notes/[id]   - Delete note
```

### Documents
```
GET    /api/documents        - List documents
POST   /api/documents        - Upload document
GET    /api/documents/[id]   - Get document (✅ FIXED)
PATCH  /api/documents/[id]   - Update document
DELETE /api/documents/[id]   - Delete document
```

### Stats & Dashboard
```
GET /api/stats              - Get counts (✅ NEW)
GET /api/dashboard/summary  - Dashboard data (✅ FIXED)
GET /api/notifications      - Get notifications (✅ FIXED)
```

### Members
```
GET  /api/members?workspaceId=xxx  - List members
POST /api/members                  - Add member
```

---

## 🔍 Common Issues & Solutions

### Issue: Notification badge shows wrong number
**Solution**: Badge now uses real MongoDB data. If empty, it hides.

### Issue: Sidebar shows fake counts
**Solution**: Now uses `/api/stats` endpoint with real MongoDB counts.

### Issue: "Error Loading Note"
**Solution**: API now validates ObjectId and returns proper errors.

### Issue: Cannot upload documents
**Solution**: Upload folder auto-creates. Just upload normally.

### Issue: Members don't appear after adding
**Solution**: Call `fetchMembers()` after successful POST.

---

## 🧪 Testing Commands

### Test Notifications
```javascript
// In browser console after login
fetch('/api/notifications', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Notifications:', d));
```

### Test Stats
```javascript
fetch('/api/stats', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Stats:', d));
```

### Test Note View
```javascript
// Replace NOTE_ID with actual ID
fetch('/api/notes/NOTE_ID', {
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
})
.then(r => r.json())
.then(d => console.log('Note:', d));
```

---

## 🛠️ Development Workflow

### 1. Start Development Server
```bash
npm run dev
```

### 2. Check Environment Variables
```bash
# Required in .env.local
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
```

### 3. Monitor Logs
- Browser Console: Frontend errors
- Terminal: API errors and logs
- Look for ✅ (success) and ❌ (error) emojis

### 4. Test Features
1. Login
2. Check notification badge (should be 0 or hidden)
3. Check sidebar counts (should be 0 initially)
4. Create a note
5. View the note
6. Upload a document
7. View the document

---

## 📦 File Structure

```
app/
├── api/
│   ├── auth/              # Login, signup
│   ├── notes/             # Notes CRUD
│   │   └── [id]/          # ✅ FIXED - ObjectId validation
│   ├── documents/         # Documents CRUD
│   │   └── [id]/          # ✅ FIXED - Proper error handling
│   ├── notifications/     # ✅ FIXED - Real MongoDB data
│   ├── stats/             # ✅ NEW - Stats endpoint
│   └── dashboard/
│       └── summary/       # ✅ FIXED - Real counts
├── notes/
│   └── [id]/              # Note view page
├── documents/
│   └── [id]/              # ✅ NEW - Document view page
└── ...

components/
└── dashboard/
    ├── TopNavbar.tsx      # ✅ FIXED - Real notifications
    └── SidebarNav.tsx     # ✅ FIXED - Real counts

lib/
├── mongodb.ts             # Database connection
├── logger.ts              # ✅ NEW - Logging utility
├── env-validator.ts       # ✅ NEW - Env validation
└── file-upload.ts         # File upload service

models/
├── User.ts
├── Note.ts
├── DocumentModel.ts
├── Notification.ts
└── Workspace.ts
```

---

## 🎯 Quick Fixes Applied

| Component | Fix | Impact |
|-----------|-----|--------|
| Notifications API | Removed hardcoded data | Badge shows real count |
| Stats API | Created new endpoint | Sidebar shows real counts |
| Note API | Added ObjectId validation | No more crashes |
| Document Page | Created viewer page | Can view documents |
| TopNavbar | Auto-refresh notifications | Real-time updates |
| SidebarNav | Auto-refresh counts | Real-time updates |
| Logger | Centralized logging | Better debugging |
| Env Validator | Startup validation | Catches config errors |

---

## 🚨 Important Notes

1. **Auto-Refresh**: Notifications and stats refresh every 30 seconds
2. **Error Handling**: All APIs return proper status codes (400, 401, 403, 404, 500)
3. **Validation**: ObjectId validation before all MongoDB queries
4. **Logging**: Use `logger` utility for consistent logging
5. **Environment**: App validates env vars on startup

---

## 💡 Pro Tips

### Use Logger
```typescript
import { logger } from '@/lib/logger';

logger.info('User action', { userId, action: 'create_note' });
logger.error('API failed', error);
logger.apiRequest('POST', '/api/notes', userId);
```

### Check MongoDB Counts
```javascript
// In MongoDB shell
db.notifications.countDocuments({ user: ObjectId("USER_ID") })
db.notes.countDocuments({ author: ObjectId("USER_ID") })
db.documents.countDocuments({ author: ObjectId("USER_ID") })
```

### Debug Auth Issues
```javascript
// Check token in browser console
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

---

## 🎉 You're All Set!

Your app now has:
- ✅ Real notification counts
- ✅ Real sidebar counts
- ✅ Working note viewer
- ✅ Working document viewer
- ✅ Proper error handling
- ✅ Production-grade architecture

**Happy coding! 🚀**
