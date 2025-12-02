# Fully Working Signup Flow - Setup Guide

## 🚀 Complete Setup (5 Minutes)

### Step 1: Install Dependencies

```bash
npm install bcryptjs jsonwebtoken mongoose axios
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Environment Variables

Create `.env.local` in your project root:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this

# API URL (leave empty for Next.js API routes)
NEXT_PUBLIC_API_URL=
```

### Step 3: Start MongoDB

#### Option A: Local MongoDB

```bash
# Install MongoDB
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Windows
# Download from https://www.mongodb.com/try/download/community
# Run as service
```

#### Option B: MongoDB Atlas (Recommended - Free)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (free tier)
4. Get connection string
5. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### Step 4: Generate Secure JWT Secret

```bash
# Run this command
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy the output and paste it in .env.local as JWT_SECRET
```

### Step 5: Start Next.js

```bash
npm run dev
```

### Step 6: Test Signup

Visit: `http://localhost:3000/signup`

## ✅ Verification Checklist

### 1. Check MongoDB Connection

```bash
# Test MongoDB is running
mongosh

# Or for MongoDB Atlas, test connection string
mongosh "your-connection-string"
```

### 2. Check Environment Variables

```bash
# Verify .env.local exists
cat .env.local

# Should show:
# MONGODB_URI=...
# JWT_SECRET=...
# NEXT_PUBLIC_API_URL=
```

### 3. Check API Route

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Should return:
# {"success":true,"token":"...","user":{...}}
```

### 4. Check Browser Console

Open browser console (F12) and watch for:
- ✅ `📤 API Request: POST /api/auth/signup`
- ✅ `✅ API Response: 201 /api/auth/signup`
- ❌ If you see errors, check the logs

## 🔧 Troubleshooting

### Issue 1: "No response from server"

**Cause:** MongoDB not connected or API route not found

**Solution:**

```bash
# 1. Check MongoDB is running
mongosh

# 2. Check .env.local exists
ls -la .env.local

# 3. Restart Next.js
npm run dev

# 4. Check API route exists
ls -la app/api/auth/signup/route.ts
```

### Issue 2: "MONGODB_URI not defined"

**Solution:**

```bash
# Create .env.local
echo "MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace" > .env.local
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env.local
echo "NEXT_PUBLIC_API_URL=" >> .env.local

# Restart Next.js
npm run dev
```

### Issue 3: "bcrypt installation error"

**Solution:**

```bash
# Use bcryptjs (pure JavaScript, no compilation needed)
npm uninstall bcrypt
npm install bcryptjs
npm install -D @types/bcryptjs
```

### Issue 4: "Email already registered"

**Solution:**

```bash
# Clear the database
mongosh
use ai-knowledge-workspace
db.users.deleteMany({})
exit
```

### Issue 5: "Cannot find module 'mongoose'"

**Solution:**

```bash
# Install all dependencies
npm install bcryptjs jsonwebtoken mongoose axios
npm install -D @types/bcryptjs @types/jsonwebtoken

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📊 How It Works

### 1. Frontend Flow

```
User fills form → Click "Create Account"
    ↓
Validation (client-side)
    ↓
authService.signup() called
    ↓
Axios POST to /api/auth/signup
    ↓
Receive response (token + user)
    ↓
Save to localStorage
    ↓
Redirect to /dashboard
```

### 2. Backend Flow

```
Receive POST /api/auth/signup
    ↓
Validate input (name, email, password)
    ↓
Connect to MongoDB
    ↓
Check if email exists
    ↓
Hash password (bcrypt)
    ↓
Create user in database
    ↓
Generate JWT token
    ↓
Return {success, token, user}
```

### 3. Data Flow

```typescript
// Frontend sends:
{
  name: "John Doe",
  email: "john@example.com",
  password: "password123"
}

// Backend returns:
{
  success: true,
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  user: {
    id: "507f1f77bcf86cd799439011",
    name: "John Doe",
    email: "john@example.com",
    role: "user"
  }
}
```

## 🔍 Debugging

### Enable Detailed Logging

The API route already has console.log statements. Watch your terminal:

```
📝 Signup request received: { name: 'John Doe', email: 'john@example.com' }
🔌 Connecting to MongoDB...
✅ MongoDB connected
🔍 Checking for existing user...
🔐 Hashing password...
✅ Password hashed
👤 Creating user...
✅ User created: 507f1f77bcf86cd799439011
🎫 Generating JWT token...
✅ JWT token generated
✅ Signup successful for: john@example.com
```

### Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Submit signup form
4. Look for `/api/auth/signup` request
5. Check:
   - Status: Should be 201
   - Response: Should have `success: true`
   - Headers: Should have `Content-Type: application/json`

## 📝 Test Data

Use these for testing:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}

{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePass456"
}

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123456"
}
```

## 🎯 Success Indicators

You'll know it's working when:

1. ✅ Form submits without errors
2. ✅ Console shows: "✅ Signup successful"
3. ✅ Browser redirects to `/dashboard`
4. ✅ localStorage has `token` and `user`
5. ✅ MongoDB has new user document

## 🔐 Security Checklist

- [x] Passwords are hashed (bcrypt, 10 rounds)
- [x] JWT tokens expire (7 days)
- [x] Email uniqueness enforced
- [x] Input validation on backend
- [x] HTTPS in production (configure in deployment)
- [x] Environment variables for secrets
- [x] No passwords in logs

## 🚀 Production Deployment

### Environment Variables (Production)

```env
MONGODB_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/production
JWT_SECRET=generate-a-new-secure-random-string-for-production
NEXT_PUBLIC_API_URL=
NODE_ENV=production
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
```

## ✅ Final Checklist

- [ ] Dependencies installed
- [ ] .env.local created with all variables
- [ ] MongoDB running (local or Atlas)
- [ ] JWT_SECRET generated
- [ ] Next.js running (`npm run dev`)
- [ ] Signup page accessible (`/signup`)
- [ ] API route working (`/api/auth/signup`)
- [ ] Test signup successful
- [ ] User saved in MongoDB
- [ ] Token stored in localStorage
- [ ] Redirect to dashboard works

## 🎉 You're Done!

Your signup flow is now fully working! Test it at:

**http://localhost:3000/signup**

If you encounter any issues, check the troubleshooting section above.
