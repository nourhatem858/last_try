# 🚀 Production Ready Guide

## Quick Start

### 1️⃣ Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Secret (generate with: node generate-jwt-secret.js)
JWT_SECRET=<your-super-secret-jwt-key-at-least-32-characters-long>

# OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4-turbo-preview

# Environment
NODE_ENV=production
```

**Replace placeholders:**
- `<username>` - Your MongoDB Atlas username
- `<password>` - Your MongoDB Atlas password
- `<cluster>` - Your cluster name (e.g., cluster0.abc123)
- `<database>` - Your database name (e.g., ai-knowledge-workspace)

### 2️⃣ Whitelist IP Address

In MongoDB Atlas:
1. Go to **Network Access**
2. Click **Add IP Address**
3. Add: `196.128.225.174`
4. Or use `0.0.0.0/0` for testing (allow from anywhere)

### 3️⃣ Run Setup Script

**Windows:**
```bash
setup-production.bat
```

**Linux/Mac:**
```bash
chmod +x setup-production.sh
./setup-production.sh
```

This will:
- ✅ Validate environment variables
- ✅ Install dependencies
- ✅ Test MongoDB connection
- ✅ Build the application
- ✅ Run production readiness tests

### 4️⃣ Start the Server

**Development:**
```bash
npm run dev
```

**Production:**
```bash
npm run build
npm start
```

---

## 📊 System Health Check

Check system status at any time:

```bash
curl http://localhost:3000/api/health
```

Or visit: http://localhost:3000/api/health

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-30T...",
  "checks": {
    "mongodb": {
      "status": "healthy",
      "message": "MongoDB connected"
    },
    "environment": {
      "status": "healthy",
      "message": "All required environment variables are set"
    },
    "openai": {
      "status": "healthy",
      "message": "OpenAI API key configured"
    },
    "jwt": {
      "status": "healthy",
      "message": "JWT secret configured"
    }
  },
  "responseTime": "45ms"
}
```

---

## 🧪 Run Tests

### Full Production Test Suite

```bash
node test-production-ready.js
```

**Tests:**
- ✅ MongoDB connection
- ✅ Environment variables
- ✅ Authentication (signup, login, email normalization)
- ✅ Profile (fetch, update, user-specific data)
- ✅ Workspaces (create, list, user-specific)
- ✅ Notes (create, list, immediate visibility)
- ✅ Documents (list, user-specific)
- ✅ AI features (chat, search)
- ✅ Error handling (unauthorized, invalid token, missing fields)

**Report:** `test-production-ready-report.json`

---

## 🔧 Troubleshooting

### MongoDB Connection Failed

**Error:** "MongoDB connection failed. Check credentials and IP whitelist."

**Solutions:**

1. **Check credentials:**
   ```bash
   # Verify MONGODB_URI in .env.local
   # Username and password should not contain special characters without encoding
   ```

2. **Whitelist IP:**
   - Go to MongoDB Atlas → Network Access
   - Add IP: `196.128.225.174`
   - Or use `0.0.0.0/0` (allow all) for testing

3. **Check cluster status:**
   - Verify cluster is running in MongoDB Atlas dashboard
   - Check if cluster is paused (free tier auto-pauses after inactivity)

4. **Test connection:**
   ```bash
   node -e "const mongoose=require('mongoose');require('dotenv').config({path:'.env.local'});mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('Connected')).catch(e=>console.error(e.message))"
   ```

### Authentication Issues

**Problem:** Login fails or returns wrong user data

**Solutions:**

1. **Email normalization:**
   - Emails are automatically trimmed and lowercased
   - `  TEST@EXAMPLE.COM  ` → `test@example.com`

2. **JWT token:**
   - Generate strong secret: `node generate-jwt-secret.js`
   - Update JWT_SECRET in .env.local

3. **Password requirements:**
   - Minimum 8 characters
   - At least one uppercase, lowercase, number

### Profile Shows Wrong User

**Problem:** Profile page shows other users' data

**Solution:** Already fixed! Profile API now:
- ✅ Verifies JWT token
- ✅ Extracts user ID from token
- ✅ Returns only current user's data
- ✅ Handles null values safely

### Notes/Documents Not Appearing

**Problem:** Newly created items don't show in list

**Solution:** Already fixed! APIs now:
- ✅ Filter by current user ID
- ✅ Filter by workspace access
- ✅ Return items immediately after creation
- ✅ Handle "not found" errors gracefully

### AI Features Not Working

**Problem:** AI chat or search fails

**Solutions:**

1. **Check OpenAI API key:**
   ```bash
   # In .env.local
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Verify API key format:**
   - Should start with `sk-`
   - Get from: https://platform.openai.com/api-keys

3. **Check API quota:**
   - Ensure you have credits in OpenAI account
   - Check usage at: https://platform.openai.com/usage

---

## 🎯 Production Checklist

### Before Deployment

- [ ] MongoDB Atlas cluster is running
- [ ] IP address whitelisted in Network Access
- [ ] All environment variables set (no placeholders)
- [ ] JWT secret is strong (32+ characters)
- [ ] OpenAI API key is valid
- [ ] `npm run build` succeeds
- [ ] All tests pass: `node test-production-ready.js`
- [ ] Health check returns "healthy": `/api/health`

### Security

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB password is strong
- [ ] OpenAI API key is kept secret
- [ ] CORS is configured for production domain
- [ ] Rate limiting is enabled (if applicable)
- [ ] HTTPS is enabled in production

### Performance

- [ ] Database indexes are created
- [ ] Static assets are optimized
- [ ] Images are compressed
- [ ] Caching is configured
- [ ] CDN is set up (if applicable)

### Monitoring

- [ ] Error logging is configured
- [ ] Performance monitoring is set up
- [ ] Uptime monitoring is enabled
- [ ] Backup strategy is in place

---

## 📚 API Documentation

### Authentication

**Signup:**
```bash
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Login:**
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Forgot Password:**
```bash
POST /api/auth/forgot-password
{
  "email": "john@example.com"
}
```

### Profile

**Get Profile:**
```bash
GET /api/profile
Authorization: Bearer <token>
```

**Update Profile:**
```bash
PUT /api/profile
Authorization: Bearer <token>
{
  "name": "John Updated",
  "bio": "New bio",
  "avatar": "data:image/png;base64,..."
}
```

### Workspaces

**List Workspaces:**
```bash
GET /api/workspaces
Authorization: Bearer <token>
```

**Create Workspace:**
```bash
POST /api/workspaces
Authorization: Bearer <token>
{
  "name": "My Workspace",
  "description": "Description",
  "color": "blue"
}
```

### Notes

**List Notes:**
```bash
GET /api/notes?workspaceId=<id>
Authorization: Bearer <token>
```

**Create Note:**
```bash
POST /api/notes
Authorization: Bearer <token>
{
  "title": "My Note",
  "content": "Note content",
  "workspaceId": "<id>",
  "tags": ["tag1", "tag2"]
}
```

### Documents

**List Documents:**
```bash
GET /api/documents?workspaceId=<id>
Authorization: Bearer <token>
```

**Upload Document:**
```bash
POST /api/documents
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
title: "Document Title"
workspaceId: "<id>"
tags: ["tag1", "tag2"]
```

### AI

**Chat:**
```bash
POST /api/ai/chat
Authorization: Bearer <token>
{
  "message": "Hello AI",
  "conversationHistory": []
}
```

**Search:**
```bash
GET /api/search?q=query&type=all
Authorization: Bearer <token>
```

---

## 🌐 Multi-Language Support

The system supports:
- ✅ English (LTR)
- ✅ Arabic (RTL)
- ✅ Mixed content

**Language detection:**
- Automatic based on content
- AI responses match input language
- UI adapts to text direction

---

## 📞 Support

If you encounter issues:

1. Check health endpoint: `/api/health`
2. Review test report: `test-production-ready-report.json`
3. Check server logs for detailed errors
4. Verify all environment variables are set correctly

---

## 🎉 Success!

Your Knowledge Workspace is now production-ready!

**Next steps:**
1. Create your first workspace
2. Add notes and documents
3. Try the AI assistant
4. Invite team members
5. Explore advanced features

**Enjoy your AI-powered knowledge management system! 🚀**
