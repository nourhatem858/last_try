# ⚡ Quick Environment Setup

## 🚀 3-Step Setup

### Step 1: Generate JWT Secret

```bash
node generate-jwt-secret.js
```

Copy the generated secret.

### Step 2: Update `.env.local`

Open `.env.local` and replace placeholders:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority

# JWT Secret (paste generated secret)
JWT_SECRET=paste-your-generated-secret-here

# API URL (leave empty)
NEXT_PUBLIC_API_URL=

# Environment
NODE_ENV=development
```

### Step 3: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

## 📝 MongoDB Atlas Quick Setup

1. **Go to**: https://cloud.mongodb.com
2. **Sign up** for free account
3. **Create cluster** (free tier)
4. **Create database user**:
   - Username: `myuser`
   - Password: `MySecurePass123`
5. **Whitelist IP**: Click "Allow Access from Anywhere"
6. **Get connection string**: Click "Connect" → "Connect your application"
7. **Copy to `.env.local`**:
   ```env
   MONGODB_URI=mongodb+srv://myuser:MySecurePass123@cluster0.xxxxx.mongodb.net/ai-knowledge-workspace?retryWrites=true&w=majority
   ```

## 🧪 Test It

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Expected: `{"success":true,...}`

## ⚠️ Common Issues

### "MONGODB_URI not defined"
- Restart dev server after creating `.env.local`

### "bad auth"
- Check username/password in connection string
- URL encode special characters in password

### "connect ECONNREFUSED"
- For local: Start MongoDB with `mongod`
- For Atlas: Check IP whitelist

## 📚 Full Guide

See `ENV_SETUP_GUIDE.md` for complete documentation.

---

**Ready?** Update `.env.local` → Restart server → Test signup! 🎉
