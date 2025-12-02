# ✅ Environment Setup - COMPLETE

## 🎉 Files Created

I've created everything you need to fix the MongoDB connection error:

### 1. `.env.local` ✅
Your main environment variables file with placeholders for:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - API URL (optional)
- `NODE_ENV` - Environment mode

### 2. `ENV_SETUP_GUIDE.md` ✅
Complete documentation covering:
- MongoDB Atlas setup (step-by-step)
- Local MongoDB setup
- JWT secret generation
- Security best practices
- Troubleshooting guide
- Quick reference

### 3. `ENV_QUICK_SETUP.md` ✅
Quick 3-step setup guide for fast configuration

### 4. `generate-jwt-secret.js` ✅
Script to generate secure JWT secrets

### 5. `.env.local.example` ✅
Updated template file for reference

## 🚀 Quick Start (3 Steps)

### Step 1: Generate JWT Secret

```bash
node generate-jwt-secret.js
```

This will output something like:
```
✅ Generated JWT Secret:

a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0

📋 Copy this secret to your .env.local file:

JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0
```

### Step 2: Set Up MongoDB

#### Option A: MongoDB Atlas (Recommended)

1. Go to https://cloud.mongodb.com
2. Sign up and create a free cluster
3. Create a database user (save username and password!)
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get connection string from "Connect" → "Connect your application"

Your connection string will look like:
```
mongodb+srv://myusername:mypassword@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

#### Option B: Local MongoDB

1. Install MongoDB: https://www.mongodb.com/try/download/community
2. Start MongoDB:
   ```bash
   mongod
   ```

Your connection string will be:
```
mongodb://localhost:27017/ai-knowledge-workspace
```

### Step 3: Update `.env.local`

Open `.env.local` and replace the placeholders:

```env
# MongoDB Atlas Example
MONGODB_URI=mongodb+srv://john:MyP@ssw0rd@cluster0.abc123.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority

# JWT Secret (from Step 1)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# Leave empty for Next.js API routes
NEXT_PUBLIC_API_URL=

# Development mode
NODE_ENV=development
```

**⚠️ Important:** If your MongoDB password has special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`

Example:
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123
```

### Step 4: Restart Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 5: Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Test User",
    "email": "test@example.com",
    "role": "user"
  }
}
```

## 🔍 Verify Setup

### Check 1: File Exists
```bash
# Windows PowerShell
Test-Path .env.local

# macOS/Linux
ls -la .env.local
```

Should return `True` or show the file.

### Check 2: Variables Set
```bash
# Windows PowerShell
Get-Content .env.local

# macOS/Linux
cat .env.local
```

Should show your environment variables (without placeholders).

### Check 3: Server Logs
After starting `npm run dev`, you should see:
```
✅ Using existing MongoDB connection
```
or
```
🔌 Creating new MongoDB connection...
✅ MongoDB connected successfully
```

### Check 4: Test Signup
Visit http://localhost:3000/signup and create an account.

## 🐛 Troubleshooting

### Error: "Please define the MONGODB_URI environment variable"

**Cause:** `.env.local` file not found or not loaded

**Solution:**
1. Verify `.env.local` exists in project root (same folder as `package.json`)
2. Restart dev server completely
3. Check file name is exactly `.env.local` (not `.env.local.txt`)

### Error: "MongoServerError: bad auth"

**Cause:** Incorrect username or password

**Solution:**
1. Verify username and password in MongoDB Atlas
2. URL encode special characters in password
3. Check database user has correct permissions

### Error: "MongooseServerSelectionError: connect ECONNREFUSED"

**Cause:** Cannot connect to MongoDB

**Solution:**
- **For local MongoDB:** Start MongoDB with `mongod`
- **For Atlas:** Check IP whitelist in Network Access

### Error: "Invalid JWT token"

**Cause:** JWT_SECRET not set or changed

**Solution:**
1. Verify `JWT_SECRET` is set in `.env.local`
2. Restart server after changing `JWT_SECRET`
3. Clear browser localStorage and try again

## 📋 Example `.env.local` Files

### For MongoDB Atlas (Cloud)

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://john:SecurePass123@cluster0.abc123.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority

# JWT Secret (128 characters)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0

# API URL (empty for Next.js routes)
NEXT_PUBLIC_API_URL=

# Environment
NODE_ENV=development
```

### For Local MongoDB

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace

# JWT Secret (128 characters)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4s5t6u7v8w9x0y1z2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0

# API URL (empty for Next.js routes)
NEXT_PUBLIC_API_URL=

# Environment
NODE_ENV=development
```

## 🔒 Security Checklist

- [ ] `.env.local` is in `.gitignore` (already done)
- [ ] JWT_SECRET is at least 32 characters
- [ ] MongoDB password is strong
- [ ] Special characters in password are URL encoded
- [ ] Different secrets for development and production
- [ ] Never commit actual credentials to Git

## 📚 Documentation

- **Complete Guide:** `ENV_SETUP_GUIDE.md`
- **Quick Setup:** `ENV_QUICK_SETUP.md`
- **This File:** `ENV_SETUP_COMPLETE.md`

## ✅ Summary

You now have:

1. ✅ `.env.local` file with placeholders
2. ✅ JWT secret generator script
3. ✅ Complete setup documentation
4. ✅ Troubleshooting guide
5. ✅ Example configurations

## 🎯 Next Steps

1. **Generate JWT secret**: `node generate-jwt-secret.js`
2. **Set up MongoDB Atlas** (or start local MongoDB)
3. **Update `.env.local`** with your credentials
4. **Restart server**: `npm run dev`
5. **Test signup**: Visit http://localhost:3000/signup

---

**Your MongoDB connection error will be fixed once you complete these steps!** 🎉

Need help? Check `ENV_SETUP_GUIDE.md` for detailed instructions.
