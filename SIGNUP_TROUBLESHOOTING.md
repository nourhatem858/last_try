# Signup API Troubleshooting Guide

## 🔧 Common Issues & Solutions

### Issue 1: "No response from server"

**Symptoms:**
- Frontend shows "No response from server"
- Network tab shows failed request
- Console shows connection error

**Solutions:**

#### A. Check Next.js is Running
```bash
# Make sure dev server is running
npm run dev

# Should show:
# ▲ Next.js 16.0.4
# - Local: http://localhost:3000
```

#### B. Check API Route Exists
```bash
# Verify file exists
ls -la app/api/auth/signup/route.ts

# Should show the file
```

#### C. Check MongoDB Connection
```bash
# Test MongoDB
mongosh

# If error, start MongoDB
mongod

# Or use MongoDB Atlas
```

#### D. Check Environment Variables
```bash
# Verify .env.local exists
cat .env.local

# Should have:
# MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
# JWT_SECRET=your-secret-key
```

### Issue 2: "Cannot find module 'bcryptjs'"

**Solution:**

```bash
# Install dependencies
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken

# Restart Next.js
npm run dev
```

### Issue 3: "MONGODB_URI not defined"

**Solution:**

```bash
# Create .env.local
echo "MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace" > .env.local
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env.local

# Restart Next.js
npm run dev
```

### Issue 4: "MongooseError: Operation buffering timed out"

**Cause:** MongoDB not running or wrong connection string

**Solution:**

```bash
# Option 1: Start local MongoDB
mongod

# Option 2: Use MongoDB Atlas
# Update .env.local with Atlas connection string:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```

### Issue 5: "Email already registered"

**Solution:**

```bash
# Clear test users from database
mongosh
use ai-knowledge-workspace
db.users.deleteMany({ email: /test/ })
exit
```

### Issue 6: "Internal Server Error (500)"

**Check Terminal Logs:**

Look for error messages in your Next.js terminal:

```
❌ Signup error: [error message]
```

**Common causes:**
- MongoDB not connected
- Invalid JWT_SECRET
- Missing dependencies
- Database validation error

**Solution:**

```bash
# 1. Check all dependencies installed
npm list bcryptjs jsonwebtoken mongoose

# 2. Check .env.local
cat .env.local

# 3. Restart with clean cache
rm -rf .next
npm run dev
```

## 🧪 Testing the API

### Method 1: Using cURL

```bash
# Test valid signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 201 Created
# {"success":true,"token":"...","user":{...}}
```

### Method 2: Using Test Script

```bash
# Run the test script
node test-signup-api.js

# Should show:
# ✅ PASS for valid signup
# ✅ PASS for validation errors
```

### Method 3: Using Browser

1. Start Next.js: `npm run dev`
2. Visit: `http://localhost:3000/signup`
3. Fill form and submit
4. Check browser console (F12)
5. Check Network tab for API call

## 📊 Expected Logs

### Successful Signup

**Terminal (Next.js):**
```
📝 Signup request: { name: 'Test User', email: 'test@example.com' }
🔌 Creating new MongoDB connection...
✅ MongoDB connected successfully
✅ User created successfully: test@example.com
```

**Browser Console:**
```
📤 API Request: POST /api/auth/signup
✅ API Response: 201 /api/auth/signup
```

### Failed Signup (Duplicate Email)

**Terminal:**
```
📝 Signup request: { name: 'Test User', email: 'test@example.com' }
✅ Using existing MongoDB connection
❌ Signup error: [duplicate key error]
```

**Browser Console:**
```
📤 API Request: POST /api/auth/signup
❌ API Error: { status: 409, message: 'Email already registered' }
```

## 🔍 Debugging Steps

### Step 1: Check Dependencies

```bash
npm list bcryptjs jsonwebtoken mongoose

# Should show:
# ├── bcryptjs@2.4.3
# ├── jsonwebtoken@9.0.2
# └── mongoose@8.x.x
```

### Step 2: Check Environment

```bash
# Print environment variables
node -e "console.log(process.env.MONGODB_URI)"
node -e "console.log(process.env.JWT_SECRET)"

# Should show your values (not undefined)
```

### Step 3: Test MongoDB Connection

```bash
# Test connection
mongosh mongodb://localhost:27017/ai-knowledge-workspace

# Should connect without errors
```

### Step 4: Check API Route

```bash
# Verify file exists and is valid TypeScript
cat app/api/auth/signup/route.ts

# Check for syntax errors
npx tsc --noEmit
```

### Step 5: Check Network

```bash
# Test if port 3000 is accessible
curl http://localhost:3000

# Should return HTML (Next.js page)
```

## 🛠️ Quick Fixes

### Fix 1: Reset Everything

```bash
# Stop Next.js (Ctrl+C)
# Clear cache
rm -rf .next node_modules package-lock.json

# Reinstall
npm install

# Reinstall signup dependencies
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken

# Restart
npm run dev
```

### Fix 2: Use MongoDB Atlas (Avoid Local Issues)

```bash
# 1. Go to https://cloud.mongodb.com
# 2. Create free cluster
# 3. Get connection string
# 4. Update .env.local:

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Fix 3: Simplify for Testing

If still having issues, test without MongoDB first:

```typescript
// In app/api/auth/signup/route.ts
// Comment out MongoDB parts and use mock data

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password } = body;

  // Validation...

  // MOCK: Skip MongoDB for testing
  const user = {
    id: `user_${Date.now()}`,
    name: name.trim(),
    email: email.toLowerCase(),
    role: 'user',
  };

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return NextResponse.json({
    success: true,
    token,
    user,
  }, { status: 201 });
}
```

## ✅ Verification Checklist

Run through this checklist:

- [ ] Next.js running (`npm run dev`)
- [ ] MongoDB running (`mongosh` connects)
- [ ] .env.local exists with MONGODB_URI and JWT_SECRET
- [ ] Dependencies installed (bcryptjs, jsonwebtoken, mongoose)
- [ ] API route file exists (app/api/auth/signup/route.ts)
- [ ] User model exists (models/User.ts)
- [ ] MongoDB connection utility exists (lib/mongodb.ts)
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:3000/signup
- [ ] Browser console shows no errors
- [ ] Terminal shows no errors

## 📞 Still Having Issues?

### Check These:

1. **Node.js Version**
```bash
node --version
# Should be v18+ for Next.js 16
```

2. **MongoDB Version**
```bash
mongod --version
# Should be v4.4+ recommended
```

3. **Port Conflicts**
```bash
# Check if port 3000 is in use
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Kill process if needed
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

4. **File Permissions**
```bash
# Ensure files are readable
chmod +r app/api/auth/signup/route.ts
chmod +r lib/mongodb.ts
chmod +r models/User.ts
```

## 🎯 Success Criteria

You'll know it's working when:

1. ✅ Form submits without "No response" error
2. ✅ Terminal shows: "✅ User created successfully"
3. ✅ Browser redirects to `/dashboard`
4. ✅ localStorage has `token` and `user`
5. ✅ MongoDB has new user: `db.users.find()`

## 💡 Pro Tips

1. **Always check terminal logs** - They show the real errors
2. **Use MongoDB Atlas** - Eliminates local MongoDB issues
3. **Test API with cURL first** - Isolates frontend issues
4. **Check browser Network tab** - Shows actual request/response
5. **Clear .next folder** - Fixes caching issues

## 🎉 When It Works

You'll see this flow:

```
User submits form
  ↓
📤 API Request: POST /api/auth/signup
  ↓
📝 Signup request: { name: '...', email: '...' }
  ↓
🔌 Creating new MongoDB connection...
  ↓
✅ MongoDB connected successfully
  ↓
✅ User created successfully: test@example.com
  ↓
✅ API Response: 201 /api/auth/signup
  ↓
Redirect to /dashboard
```

**If you see this, everything is working perfectly!** 🎊
