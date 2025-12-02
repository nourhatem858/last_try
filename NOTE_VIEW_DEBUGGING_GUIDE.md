# 🔧 Note View Debugging Guide

## Problem: "No authentication token" and "Request failed: 400"

This guide helps you debug and fix authentication and 400 errors when viewing notes.

---

## ✅ Current Implementation Status

Your code already includes:
- ✅ Token validation on frontend
- ✅ ObjectId format validation
- ✅ Authorization header in fetch requests
- ✅ Comprehensive error handling
- ✅ User-friendly error messages
- ✅ Proper JWT verification on backend

---

## 🔍 Root Cause Analysis

### Issue 1: "No authentication token"
**Possible Causes:**
1. User not logged in
2. Token expired or cleared from localStorage
3. AuthContext not properly initialized
4. Token cleared by logout or browser

### Issue 2: "Request failed: 400"
**Possible Causes:**
1. Invalid note ID format (not a valid MongoDB ObjectId)
2. Note ID contains special characters or is malformed
3. URL parameter not properly extracted

---

## 🛠️ Debugging Steps

### Step 1: Check Token Availability

Open browser console and run:
```javascript
// Check if token exists
console.log('Token:', localStorage.getItem('token'));

// Check if user exists
console.log('User:', localStorage.getItem('user'));

// Check AuthContext
console.log('Auth State:', { token: !!localStorage.getItem('token') });
```

**Expected Result:**
- Token should be a JWT string (e.g., "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
- User should be a JSON string with user data

**If token is null:**
- User needs to login again
- Check if logout was called accidentally
- Check if token expired (JWT tokens have expiration)

---

### Step 2: Verify Note ID Format

Check the URL in browser:
```
http://localhost:3000/notes/[id]
```

**Valid ObjectId format:**
- Exactly 24 hexadecimal characters
- Example: `507f1f77bcf86cd799439011`
- Regex: `/^[0-9a-fA-F]{24}$/`

**Invalid formats:**
- Too short: `123abc`
- Contains special chars: `507f1f77-bcf8-6cd7-9943-9011`
- Contains spaces: `507f1f77 bcf86cd799439011`

**Test in console:**
```javascript
const noteId = '507f1f77bcf86cd799439011'; // Replace with your ID
const isValid = /^[0-9a-fA-F]{24}$/.test(noteId);
console.log('Valid ObjectId:', isValid);
```

---

### Step 3: Monitor Network Requests

1. Open DevTools → Network tab
2. Navigate to note page
3. Find the request to `/api/notes/[id]`
4. Check:
   - **Request Headers:** Should include `Authorization: Bearer <token>`
   - **Response Status:** 200 (success), 400 (bad request), 401 (unauthorized), etc.
   - **Response Body:** JSON with error details

**Example Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Example Response (400 Error):**
```json
{
  "success": false,
  "error": "Invalid note ID",
  "message": "The note ID format is invalid"
}
```

---

### Step 4: Check Backend Logs

Look for console logs in your terminal where Next.js is running:

**Successful Request:**
```
🔍 [API] GET /api/notes/[id] - Starting request
📝 [API] Note ID: 507f1f77bcf86cd799439011
✅ [API] Token verified for user: 123abc456def
🔌 [API] Connecting to MongoDB...
✅ [API] MongoDB connected
🔍 [API] Searching for note: 507f1f77bcf86cd799439011
✅ [API] Note found: My Sample Note
🔐 [API] Checking workspace access...
✅ [API] Access granted
✅ [API] Returning note data successfully
```

**Failed Request (No Token):**
```
🔍 [API] GET /api/notes/[id] - Starting request
📝 [API] Note ID: 507f1f77bcf86cd799439011
❌ [API] No token provided
```

**Failed Request (Invalid ID):**
```
🔍 [API] GET /api/notes/[id] - Starting request
📝 [API] Note ID: invalid-id-123
❌ [API] Invalid ObjectId format: invalid-id-123
```

---

## 🔧 Common Fixes

### Fix 1: User Not Logged In

**Symptom:** Token is null in localStorage

**Solution:**
1. Redirect to login page
2. User logs in
3. Token is stored in localStorage
4. Navigate back to note

**Code (already implemented):**
```typescript
if (!token) {
  console.error('❌ [Frontend] No authentication token');
  setError('Please login to view this note');
  setLoading(false);
  return;
}
```

The error page shows a "Login" button that redirects to `/login`.

---

### Fix 2: Invalid Note ID Format

**Symptom:** 400 error with "Invalid note ID format"

**Solution:**
Frontend validates ID before making request:

```typescript
// ✅ Already implemented in your code
const objectIdRegex = /^[0-9a-fA-F]{24}$/;
if (!objectIdRegex.test(noteId)) {
  console.error('❌ [Frontend] Invalid ObjectId format:', noteId);
  setError('Invalid note ID format');
  setLoading(false);
  return;
}
```

**How to get valid note IDs:**
- From notes list page (`/notes`)
- From database (MongoDB ObjectId)
- From API response when creating a note

---

### Fix 3: Token Expired

**Symptom:** 401 error with "Your session has expired"

**Solution:**
1. Clear old token
2. Redirect to login
3. User logs in again

**Code (already implemented):**
```typescript
if (response.status === 401) {
  setError(data.message || 'Please login to view this note');
}
```

---

### Fix 4: Note Not Found

**Symptom:** 404 error with "Note not found"

**Possible Reasons:**
- Note was deleted
- Note ID is wrong
- Note belongs to different workspace

**Solution:**
Show user-friendly error with "Back to Notes" button (already implemented).

---

### Fix 5: Access Denied

**Symptom:** 403 error with "Access denied"

**Reason:**
User is not a member of the workspace that owns the note.

**Solution:**
1. User needs to be added to workspace
2. Or note needs to be moved to user's workspace

---

## 🧪 Testing Scenarios

### Test 1: Valid Note Access
```bash
# Prerequisites:
# 1. User is logged in
# 2. Note exists in user's workspace
# 3. Note ID is valid ObjectId

# Expected: Note loads successfully
```

### Test 2: No Token
```bash
# Prerequisites:
# 1. Clear localStorage
# 2. Navigate to note page

# Expected: "Please login to view this note" error
```

### Test 3: Invalid Note ID
```bash
# Navigate to: /notes/invalid-id-123

# Expected: "Invalid note ID format" error
```

### Test 4: Note Not Found
```bash
# Navigate to: /notes/507f1f77bcf86cd799439011
# (with non-existent ID)

# Expected: "Note not found" error
```

---

## 📋 Quick Checklist

Before opening a note, verify:

- [ ] User is logged in
- [ ] Token exists in localStorage
- [ ] Note ID is valid ObjectId (24 hex chars)
- [ ] Note exists in database
- [ ] User has access to note's workspace
- [ ] MongoDB is connected
- [ ] Backend server is running

---

## 🔍 Advanced Debugging

### Check JWT Token Validity

Decode your JWT token at [jwt.io](https://jwt.io):

```javascript
// Get token from localStorage
const token = localStorage.getItem('token');
console.log('Token:', token);

// Decode (without verification) to see payload
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token Payload:', payload);
console.log('Expires:', new Date(payload.exp * 1000));
```

**Check if token is expired:**
```javascript
const payload = JSON.parse(atob(token.split('.')[1]));
const isExpired = Date.now() >= payload.exp * 1000;
console.log('Token expired:', isExpired);
```

---

### Test API Directly with curl

```bash
# Get your token
TOKEN="your-jwt-token-here"

# Test API endpoint
curl -X GET \
  http://localhost:3000/api/notes/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response (Success):**
```json
{
  "success": true,
  "note": {
    "id": "507f1f77bcf86cd799439011",
    "title": "My Note",
    "content": "Note content here",
    "tags": ["tag1", "tag2"],
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

## 🎯 Error Response Reference

| Status | Error | Meaning | Solution |
|--------|-------|---------|----------|
| 400 | Invalid note ID | Note ID format is wrong | Use valid 24-char ObjectId |
| 401 | Unauthorized | No token or invalid token | Login again |
| 403 | Access denied | User not in workspace | Join workspace or check permissions |
| 404 | Note not found | Note doesn't exist | Check note ID or create new note |
| 503 | Database connection failed | MongoDB not connected | Check MongoDB connection |
| 500 | Server error | Unexpected error | Check backend logs |

---

## 🚀 Quick Fix Commands

### Clear Auth and Retry
```javascript
// Run in browser console
localStorage.removeItem('token');
localStorage.removeItem('user');
window.location.href = '/login';
```

### Force Refresh Token
```javascript
// Run in browser console
window.location.reload();
```

### Check All Notes
```javascript
// Navigate to notes list
window.location.href = '/notes';
```

---

## 📝 Summary

Your implementation is already robust with:
- ✅ Proper token validation
- ✅ ObjectId format checking
- ✅ Comprehensive error handling
- ✅ User-friendly error messages
- ✅ Detailed logging for debugging

**Most common issues:**
1. **User not logged in** → Redirect to login
2. **Invalid note ID** → Use valid ObjectId from notes list
3. **Token expired** → Login again
4. **Note not found** → Check if note exists

**Next steps:**
1. Check browser console for logs
2. Verify token in localStorage
3. Ensure note ID is valid ObjectId
4. Check backend terminal logs
5. Test with valid note from notes list
