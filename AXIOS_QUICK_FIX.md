# ⚡ Axios Empty Error Object - Quick Fix

## 🐛 Problem
```
❌ API Error: {}
```

## ✅ Solution Applied

I've updated your `lib/axios.ts` with enhanced error handling that safely logs ALL error information.

## 🚀 Quick Test

### Step 1: Run Test Script
```bash
node test-axios-debug.js
```

This will:
- ✅ Check if server is running
- ✅ Test API route connectivity
- ✅ Test validation
- ✅ Diagnose common issues

### Step 2: Check Browser Console

The new error handler will show:
```
❌ API Error Details
  Error Type: AxiosError
  Message: Network Error
  Code: ERR_NETWORK
  Request: {
    method: POST
    url: /api/auth/signup
    baseURL: 
    fullURL: /api/auth/signup
    timeout: 30000
  }
  ⚠️  No response received
  🌐 Network error - Possible causes:
     - Server not running (check npm run dev)
     - CORS blocking request
     - Wrong baseURL or API path
```

## 🔍 Common Issues & Fixes

### Issue 1: Server Not Running
**Error:** `Network Error` or `ECONNREFUSED`

**Fix:**
```bash
npm run dev
```

### Issue 2: Wrong API Path
**Error:** `404 Not Found`

**Fix:** Check API route exists at `app/api/auth/signup/route.ts`

### Issue 3: Wrong baseURL
**Error:** `Network Error` with wrong URL in logs

**Fix:** Check `.env.local`:
```env
# For Next.js API routes (recommended)
NEXT_PUBLIC_API_URL=

# For external API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Issue 4: CORS Error
**Error:** `Network Error` + CORS message in console

**Fix:** Add CORS headers to API route (already done in signup route)

### Issue 5: Timeout
**Error:** `timeout of 30000ms exceeded`

**Fix:** Increase timeout in `lib/axios.ts`:
```typescript
timeout: 60000, // 60 seconds
```

## 📋 Debugging Checklist

When you see empty error `{}`:

1. **Check if server is running**
   ```bash
   npm run dev
   ```

2. **Run test script**
   ```bash
   node test-axios-debug.js
   ```

3. **Check browser Network tab**
   - Press F12
   - Go to Network tab
   - Look for failed requests

4. **Check console logs**
   - Look for "📤 API Request" log
   - Look for "❌ API Error Details" group

5. **Test API directly**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```

## 🎯 What Changed

### Before (Empty Error)
```typescript
console.error('❌ API Error:', {
  url: error.config?.url,        // undefined
  status: error.response?.status, // undefined
  message: error.message,         // undefined
});
// Output: ❌ API Error: {}
```

### After (Complete Error Info)
```typescript
if (axios.isAxiosError(error)) {
  console.log('Error Type:', 'AxiosError');
  console.log('Message:', error.message);
  console.log('Code:', error.code || 'N/A');
  
  if (error.config) {
    console.log('Request:', { /* full details */ });
  } else {
    console.warn('⚠️  No request config');
  }
  
  if (error.response) {
    console.log('Response:', { /* full details */ });
  } else {
    console.warn('⚠️  No response received');
    // Diagnose network issues
  }
}
// Output: Complete error information with diagnosis
```

## 📚 Documentation

- **Complete Guide:** `AXIOS_ERROR_DEBUG_GUIDE.md`
- **Test Script:** `test-axios-debug.js`
- **This File:** `AXIOS_QUICK_FIX.md`

## ✅ Summary

Your axios error handler now:
- ✅ Safely checks all error properties
- ✅ Logs complete error information
- ✅ Diagnoses common issues
- ✅ Provides helpful suggestions
- ✅ Never shows empty `{}`

**Test it now:**
```bash
node test-axios-debug.js
```

Your error logging will show complete information! 🚀
