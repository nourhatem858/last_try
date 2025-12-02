# 🔍 Axios Error Debugging Guide - Next.js 16

## 🐛 Problem: Empty Error Object `{}`

When you see `❌ API Error: {}`, it means the error object properties are undefined. Here's why and how to fix it.

## 📋 Possible Causes

### 1. **Network Request Never Sent**
- Axios interceptor error before request
- Invalid URL format
- CORS preflight blocked
- Browser extension blocking request

### 2. **Request Sent But No Response**
- Network timeout
- Server not running
- Wrong baseURL
- DNS resolution failure

### 3. **Response Received But Not Parsed**
- Non-JSON response from API
- Response parsing error
- Axios version incompatibility

### 4. **Error Object Structure Changed**
- Axios error doesn't have `response` or `config`
- Error thrown before request configured
- Custom error thrown (not AxiosError)

## 🔍 Why `error.response` and `error.config` Are Undefined

### Scenario 1: Network Error (No Response)
```typescript
// When server is unreachable
error.response = undefined  // No response received
error.config = {...}        // Request config exists
error.message = "Network Error"
```

### Scenario 2: Request Setup Error
```typescript
// When request fails before sending
error.response = undefined  // No response
error.config = undefined    // Config not set yet
error.message = "Request failed"
```

### Scenario 3: Timeout Error
```typescript
// When request times out
error.response = undefined  // No response received
error.config = {...}        // Request config exists
error.code = "ECONNABORTED"
error.message = "timeout of 30000ms exceeded"
```

### Scenario 4: CORS Error
```typescript
// When CORS blocks request
error.response = undefined  // Browser blocks response
error.config = {...}        // Request config exists
error.message = "Network Error"
```

## 🛠️ How to Debug Each Issue

### Debug 1: Check if Request is Sent

**Add this to request interceptor:**
```typescript
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('🚀 REQUEST DETAILS:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });
    return config;
  }
);
```

**What to check:**
- Is `fullURL` correct? (e.g., `http://localhost:3000/api/auth/signup`)
- Is method correct? (POST, GET, etc.)
- Are headers present?

### Debug 2: Check Network Tab

**Open Browser DevTools:**
1. Press F12
2. Go to "Network" tab
3. Try the request again
4. Look for the request

**If request is RED:**
- Click on it
- Check "Headers" tab for URL
- Check "Response" tab for error
- Check "Console" tab for CORS errors

**If request is NOT in Network tab:**
- Request never sent (check console for errors)
- URL is malformed
- Axios interceptor blocked it

### Debug 3: Check API Route Path

**Common mistakes:**
```typescript
// ❌ Wrong - double slash
axios.post('/api//auth/signup')

// ❌ Wrong - missing leading slash
axios.post('api/auth/signup')

// ❌ Wrong - wrong path
axios.post('/api/signup')  // Should be /api/auth/signup

// ✅ Correct
axios.post('/api/auth/signup')
```

**Test API route directly:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

### Debug 4: Check Axios baseURL

**Check your .env.local:**
```env
# ❌ Wrong - includes /api
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# ❌ Wrong - external URL when using Next.js routes
NEXT_PUBLIC_API_URL=http://localhost:5000

# ✅ Correct - empty for Next.js API routes
NEXT_PUBLIC_API_URL=

# ✅ Correct - full URL for external API
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Test baseURL:**
```typescript
console.log('Base URL:', axiosInstance.defaults.baseURL);
console.log('Full URL:', `${axiosInstance.defaults.baseURL}/api/auth/signup`);
```

### Debug 5: Check API Response Format

**API must return JSON:**
```typescript
// ✅ Correct - Next.js API route
return NextResponse.json({ success: true });

// ❌ Wrong - plain text
return new Response('Success');

// ❌ Wrong - HTML
return new Response('<html>...</html>');
```

**Test response format:**
```bash
curl -i http://localhost:3000/api/auth/signup
```

Look for:
```
Content-Type: application/json
```

### Debug 6: Check if Server is Running

**Test server:**
```bash
# Test if server responds
curl http://localhost:3000

# Test specific API route
curl http://localhost:3000/api/auth/signup
```

**Check Next.js dev server:**
```bash
npm run dev
```

Should show:
```
✓ Ready in 2.3s
○ Local:   http://localhost:3000
```

## 🔧 Complete Fix for axios.ts

Here's a bulletproof error handler that logs ALL error information:

```typescript
// Response interceptor - Enhanced error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error: unknown) => {
    // Comprehensive error logging
    console.group('❌ API Error Details');
    
    // Check if it's an Axios error
    if (axios.isAxiosError(error)) {
      console.log('Error Type:', 'AxiosError');
      console.log('Message:', error.message);
      console.log('Code:', error.code);
      
      // Request details
      if (error.config) {
        console.log('Request:', {
          method: error.config.method?.toUpperCase(),
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL: error.config.baseURL 
            ? `${error.config.baseURL}${error.config.url}`
            : error.config.url,
          headers: error.config.headers,
          data: error.config.data,
        });
      } else {
        console.log('Request:', 'No config available (request not sent)');
      }
      
      // Response details
      if (error.response) {
        console.log('Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else {
        console.log('Response:', 'No response (network error or timeout)');
      }
      
      // Network error details
      if (!error.response && !error.request) {
        console.log('Network:', 'Request setup failed');
      } else if (!error.response) {
        console.log('Network:', 'No response received (timeout, CORS, or server down)');
      }
      
    } else if (error instanceof Error) {
      console.log('Error Type:', 'Standard Error');
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
    } else {
      console.log('Error Type:', 'Unknown');
      console.log('Error:', error);
    }
    
    console.groupEnd();
    
    // Handle specific error cases
    if (axios.isAxiosError(error)) {
      // Handle 401 Unauthorized
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          console.warn('🔒 Unauthorized - Redirecting to login');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      // Handle 403 Forbidden
      if (error.response?.status === 403) {
        console.error('🚫 Access forbidden');
      }
      
      // Handle 500 Server Error
      if (error.response?.status === 500) {
        console.error('💥 Server error occurred');
      }
      
      // Handle network errors
      if (!error.response) {
        console.error('🌐 Network error - Check if server is running');
      }
    }
    
    return Promise.reject(error);
  }
);
```

## 🎯 Quick Debugging Checklist

When you see empty error object `{}`:

1. **Check Console for Request Log**
   - [ ] Is "📤 API Request" logged?
   - [ ] What's the full URL?

2. **Check Network Tab**
   - [ ] Is request in Network tab?
   - [ ] What's the status code?
   - [ ] What's the response?

3. **Check Server**
   - [ ] Is `npm run dev` running?
   - [ ] Can you access http://localhost:3000?

4. **Check API Route**
   - [ ] Does `/api/auth/signup/route.ts` exist?
   - [ ] Does it export a POST function?

5. **Check Environment**
   - [ ] Is `.env.local` configured?
   - [ ] Is `NEXT_PUBLIC_API_URL` empty or correct?

6. **Test API Directly**
   ```bash
   curl -X POST http://localhost:3000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```

## 🔍 Common Error Patterns

### Pattern 1: Empty Error Object
```
❌ API Error: {}
```
**Cause:** Error properties are undefined
**Fix:** Use enhanced error handler above

### Pattern 2: Network Error
```
❌ API Error: {
  message: "Network Error",
  config: {...},
  response: undefined
}
```
**Cause:** Server not reachable
**Fix:** Check if server is running

### Pattern 3: Timeout Error
```
❌ API Error: {
  message: "timeout of 30000ms exceeded",
  code: "ECONNABORTED",
  response: undefined
}
```
**Cause:** Request took too long
**Fix:** Increase timeout or optimize API

### Pattern 4: 404 Not Found
```
❌ API Error: {
  status: 404,
  message: "Request failed with status code 404"
}
```
**Cause:** API route doesn't exist
**Fix:** Check API route path

### Pattern 5: CORS Error
```
❌ API Error: {
  message: "Network Error"
}
Console: "CORS policy: No 'Access-Control-Allow-Origin' header"
```
**Cause:** CORS blocking request
**Fix:** Add CORS headers to API route

## 📝 Testing Script

Create `test-axios-debug.js`:

```javascript
const axios = require('axios');

async function testAPI() {
  console.log('🧪 Testing API Connection...\n');
  
  const baseURL = 'http://localhost:3000';
  const endpoint = '/api/auth/signup';
  const fullURL = `${baseURL}${endpoint}`;
  
  console.log('Testing URL:', fullURL);
  console.log('');
  
  try {
    const response = await axios.post(fullURL, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    
    console.log('✅ Success!');
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    
  } catch (error) {
    console.log('❌ Error caught!');
    
    if (axios.isAxiosError(error)) {
      console.log('\n📋 Error Details:');
      console.log('Message:', error.message);
      console.log('Code:', error.code);
      
      if (error.config) {
        console.log('\n📤 Request:');
        console.log('  URL:', error.config.url);
        console.log('  Method:', error.config.method);
        console.log('  BaseURL:', error.config.baseURL);
      }
      
      if (error.response) {
        console.log('\n📥 Response:');
        console.log('  Status:', error.response.status);
        console.log('  Data:', error.response.data);
      } else {
        console.log('\n📥 Response: None (network error)');
      }
      
      // Diagnosis
      console.log('\n🔍 Diagnosis:');
      if (!error.response && !error.request) {
        console.log('  ⚠️  Request setup failed');
      } else if (!error.response) {
        console.log('  ⚠️  No response received');
        console.log('  💡 Check if server is running: npm run dev');
      } else if (error.response.status === 404) {
        console.log('  ⚠️  API route not found');
        console.log('  💡 Check if /app/api/auth/signup/route.ts exists');
      } else if (error.response.status === 500) {
        console.log('  ⚠️  Server error');
        console.log('  💡 Check server logs for details');
      }
    } else {
      console.log('Unknown error:', error);
    }
  }
}

testAPI();
```

Run:
```bash
node test-axios-debug.js
```

## 🎉 Summary

The empty error object `{}` happens when:
1. Error properties are undefined
2. Error is not an AxiosError
3. Request fails before being sent
4. Network error with no response

**Solution:** Use the enhanced error handler that safely checks all properties before logging.

**Next Steps:**
1. Replace your axios.ts with the fixed version
2. Run the test script to verify API connectivity
3. Check browser Network tab for actual requests
4. Use the debugging checklist above

Your error logging will now show complete information! 🚀
