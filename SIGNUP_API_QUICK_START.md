# 🚀 Signup API - Quick Start

## ✅ Complete & Ready to Use

Your Next.js 13+ Signup API is **fully implemented** with all requirements met!

## 📁 Files

- ✅ `app/api/auth/signup/route.ts` - Signup endpoint
- ✅ `lib/mongodb.ts` - MongoDB connection (readyState check)
- ✅ `models/User.ts` - User model with validation

## 🎯 Quick Test

### 1. Start Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Next.js
npm run dev
```

### 2. Test API

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Expected Response

```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## 🧪 Run Test Suite

```bash
node test-signup-complete.js
```

Tests:
- ✅ Valid signup (201)
- ✅ Missing fields (400)
- ✅ Short name (400)
- ✅ Short password (400)
- ✅ Invalid email (400)
- ✅ Duplicate email (409)
- ✅ CORS headers
- ✅ JWT token (7 days)

## ✨ Features

### Validation
- ✅ All fields required
- ✅ Name min 2 characters
- ✅ Password min 6 characters
- ✅ Email format validation
- ✅ Duplicate email detection

### Security
- ✅ Password hashing (bcryptjs, 10 rounds)
- ✅ JWT tokens (7 days expiry)
- ✅ MongoDB injection prevention
- ✅ Error sanitization

### Error Handling
- ✅ Full stack trace logging
- ✅ User-friendly error messages
- ✅ Proper status codes (400, 409, 500, 201)

### Performance
- ✅ MongoDB connection caching
- ✅ readyState check before connecting
- ✅ Efficient queries

### CORS
- ✅ OPTIONS handler
- ✅ Allow any origin
- ✅ Proper headers

## 📊 Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Success | Account created |
| 400 | Validation | Password too short |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Database error |

## 🔑 Environment Variables

```env
# .env.local
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

## 📱 Frontend Usage

```typescript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password }),
});

const data = await response.json();

if (data.success) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  router.push('/dashboard');
} else {
  alert(data.error);
}
```

## 🐛 Troubleshooting

### "MONGODB_URI not defined"
```bash
echo "MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace" >> .env.local
```

### "Cannot find module 'bcryptjs'"
```bash
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### "Connection refused"
```bash
# Start MongoDB
mongod
```

## 📚 Documentation

- `SIGNUP_API_COMPLETE_GUIDE.md` - Full documentation
- `test-signup-complete.js` - Test script
- Code comments in all files

## ✅ Requirements Checklist

- [x] Environment variables (MONGODB_URI, JWT_SECRET)
- [x] MongoDB connection with readyState check
- [x] User model (name, email, password, role)
- [x] Signup API route (POST /api/auth/signup)
- [x] All validations (name, email, password)
- [x] Password hashing (bcryptjs)
- [x] Duplicate email check (409)
- [x] JWT token generation (7 days)
- [x] CORS support
- [x] Full error stack logging
- [x] User-friendly error messages
- [x] Proper status codes
- [x] Clean, modern code
- [x] Comprehensive documentation

## 🎉 Ready to Use!

Your Signup API is **complete, tested, and production-ready**!

```bash
# Start using now
npm run dev
# Visit http://localhost:3000/signup
```

For complete documentation, see `SIGNUP_API_COMPLETE_GUIDE.md`
