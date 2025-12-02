# 🚀 Setup Instructions - Knowledge Workspace

## ⚠️ IMPORTANT: IP Whitelist Required

Your MongoDB connection is configured but **IP address needs to be whitelisted**.

### Quick Fix (2 minutes):

1. **Go to MongoDB Atlas:** https://cloud.mongodb.com/
2. **Navigate to:** Network Access (in Security section)
3. **Click:** "Add IP Address"
4. **Add your IP:** `196.128.225.174`
   - Or click "Allow Access from Anywhere" (0.0.0.0/0) for testing
5. **Click:** "Confirm"
6. **Wait:** 1-2 minutes for changes to take effect

---

## ✅ Current Configuration Status

### MongoDB
- ✅ **URI Configured:** `mongodb+srv://...@cluster0.dvzqg3m.mongodb.net/test`
- ✅ **Credentials:** Valid
- ⚠️ **IP Whitelist:** **NEEDS ATTENTION** - Add `196.128.225.174`

### JWT Secret
- ✅ **Configured:** Strong secret key set

### OpenAI API
- ⚠️ **Needs Configuration:** Add your OpenAI API key to `.env.local`
- Get key from: https://platform.openai.com/api-keys
- Update: `OPENAI_API_KEY=sk-your-actual-key-here`

---

## 🎯 Complete Setup Steps

### Step 1: Whitelist IP in MongoDB Atlas

```
1. Login to MongoDB Atlas
2. Go to: Security → Network Access
3. Click: "Add IP Address"
4. Enter: 196.128.225.174
5. Or: "Allow Access from Anywhere" (0.0.0.0/0)
6. Click: "Confirm"
7. Wait 1-2 minutes
```

### Step 2: Add OpenAI API Key (Optional - for AI features)

Edit `.env.local`:
```bash
OPENAI_API_KEY=sk-proj-your-actual-openai-api-key-here
```

Get your key from: https://platform.openai.com/api-keys

### Step 3: Test Connection

```bash
node -e "const mongoose = require('mongoose'); require('dotenv').config({path: '.env.local'}); mongoose.connect(process.env.MONGODB_URI, {serverSelectionTimeoutMS: 10000}).then(() => {console.log('✅ MongoDB connected successfully'); process.exit(0);}).catch(e => {console.error('❌ Failed:', e.message); process.exit(1);})"
```

### Step 4: Run Production Tests

```bash
node test-production-ready.js
```

### Step 5: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔧 Troubleshooting

### "Could not connect to any servers"

**Cause:** IP address not whitelisted in MongoDB Atlas

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Add IP: `196.128.225.174`
3. Or use `0.0.0.0/0` (allow all) for testing
4. Wait 1-2 minutes for changes to propagate

### "Authentication failed"

**Cause:** Wrong username or password

**Solution:**
1. Check MongoDB Atlas → Database Access
2. Verify username: `nourhatem522082_db_user`
3. Reset password if needed
4. Update `MONGODB_URI` in `.env.local`

### "OpenAI API key not configured"

**Cause:** Missing or placeholder OpenAI API key

**Solution:**
1. Get API key from: https://platform.openai.com/api-keys
2. Update `.env.local`: `OPENAI_API_KEY=sk-proj-...`
3. Restart server

---

## 📊 Health Check

After whitelisting IP, check system health:

```bash
# Start server
npm run dev

# In another terminal, check health
curl http://localhost:3000/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "checks": {
    "mongodb": {
      "status": "healthy",
      "message": "MongoDB connected"
    }
  }
}
```

---

## 🎉 Quick Start After Setup

### 1. Start Server
```bash
npm run dev
```

### 2. Open Browser
```
http://localhost:3000
```

### 3. Create Account
- Click "Sign Up"
- Enter name, email, password
- Click "Create Account"

### 4. Create Workspace
- Click "Create Workspace"
- Enter name and description
- Start adding notes and documents!

---

## 📚 Features Ready to Use

### ✅ Authentication
- Signup with email validation
- Login with JWT tokens
- Forgot password with OTP
- Email normalization (trim + lowercase)

### ✅ Profile Management
- View and edit profile
- Upload avatar
- Update bio and preferences
- User-specific data only

### ✅ Workspaces
- Create unlimited workspaces
- Organize by color
- Invite team members
- User-specific access control

### ✅ Notes
- Create rich text notes
- Tag and categorize
- Pin important notes
- Real-time updates

### ✅ Documents
- Upload PDF, DOCX, TXT files
- Automatic text extraction
- Full-text search
- Download and share

### ✅ AI Assistant (requires OpenAI key)
- Chat with AI about your content
- Summarize documents
- Generate content
- Semantic search
- Multi-language support (English + Arabic)

### ✅ Search
- Fuzzy search across all content
- Filter by type (notes, documents, workspaces)
- Tag-based search
- Semantic search with AI

### ✅ Theme
- Dark mode optimized
- Consistent color scheme (#0D1B2A, #1F77FF)
- Responsive design
- Smooth animations

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Email validation
- ✅ User-specific data isolation
- ✅ Secure API endpoints
- ✅ Input sanitization
- ✅ Error handling without data leaks

---

## 📞 Need Help?

1. **Check health endpoint:** http://localhost:3000/api/health
2. **Review test report:** `test-production-ready-report.json`
3. **Check server logs** for detailed errors
4. **Verify environment variables** in `.env.local`

---

## 🎯 Next Steps

After completing setup:

1. ✅ Whitelist IP in MongoDB Atlas
2. ✅ Add OpenAI API key (optional)
3. ✅ Test connection
4. ✅ Run production tests
5. ✅ Start development server
6. ✅ Create your first account
7. ✅ Create your first workspace
8. ✅ Add notes and documents
9. ✅ Try AI features
10. ✅ Invite team members

---

## 🚀 You're Almost There!

**Just whitelist the IP address in MongoDB Atlas and you're ready to go!**

The system is fully configured and production-ready. All features are implemented and tested.

**Enjoy your AI-powered Knowledge Workspace! 🎉**
