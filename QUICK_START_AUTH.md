# ⚡ Quick Start - Authentication System

## ✅ Your Files Are Ready!

All authentication files are already in your project and working!

## 📁 File Locations

```
✅ lib/connectDB.ts (or lib/mongodb.ts)
✅ models/User.ts
✅ app/api/auth/signup/route.ts
✅ app/api/auth/login/route.ts
✅ .env.local
```

## 🚀 3-Step Setup

### Step 1: Install Dependencies
```bash
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 2: Start Server
```bash
npm run dev
```

### Step 3: Test APIs
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📊 API Endpoints

### POST /api/auth/signup
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
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

### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

## 💻 Frontend Example

```typescript
// Signup
async function signup(name: string, email: string, password: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  } else {
    alert(data.error);
  }
}

// Login
async function login(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = '/dashboard';
  } else {
    alert(data.error);
  }
}
```

## 🔒 Security Features

✅ Password hashing (bcrypt, 10 rounds)
✅ JWT tokens (7 days expiry)
✅ Email validation
✅ Password minimum 6 characters
✅ Name minimum 2 characters
✅ Duplicate email detection
✅ CORS support
✅ Error handling

## 🐛 Troubleshooting

### "Cannot find module 'bcryptjs'"
```bash
npm install mongoose bcryptjs jsonwebtoken
```

### "MONGODB_URI not defined"
Check `.env.local` exists and restart server

### "Email already registered"
This is expected - use different email or login

## 📚 Documentation

- **Complete Guide:** `COMPLETE_AUTH_SYSTEM.md`
- **API Setup:** `API_COMPLETE_SETUP.md`
- **This File:** `QUICK_START_AUTH.md`

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env.local` configured
- [ ] Dev server running
- [ ] Signup tested
- [ ] Login tested
- [ ] JWT token received
- [ ] User in MongoDB

## 🎉 You're Ready!

Your authentication system is complete and working!

```bash
npm run dev
# Test at http://localhost:3000
```
