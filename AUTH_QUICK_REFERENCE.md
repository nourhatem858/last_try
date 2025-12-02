# 🔐 Auth System - Quick Reference

## ✅ Status: FULLY WORKING

---

## 🚀 Quick Start

### 1. Login with Test User

```
URL: http://localhost:3000/login
Email: test@example.com
Password: password123
```

### 2. Create New Account

```
URL: http://localhost:3000/signup
Fill form → Submit → Auto-login → Redirect to dashboard
```

---

## 📋 Test Commands

```bash
# Create test user
node create-test-user.js

# Check database users
node test-login-debug.js

# Test login API
node test-login-api.js

# Start dev server
npm run dev
```

---

## 💻 Code Usage

### Get Current User

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated } = useAuth();

if (isAuthenticated) {
  console.log('User:', user.name, user.email);
}
```

### Login Programmatically

```typescript
const { login } = useAuth();

try {
  await login('email@example.com', 'password');
  // Success - user logged in
} catch (error) {
  // Error - show message
}
```

### Signup Programmatically

```typescript
const { signup } = useAuth();

try {
  await signup('Name', 'email@example.com', 'password');
  // Success - user created and logged in
} catch (error) {
  // Error - show message
}
```

### Logout

```typescript
const { logout } = useAuth();

logout(); // Clears user and token
```

---

## 🔧 API Endpoints

### Signup

```bash
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

### Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "eyJ...",
  "user": { "id": "...", "name": "...", "email": "..." }
}
```

---

## 🐛 Common Issues

| Error | Solution |
|-------|----------|
| "Invalid email or password" | User doesn't exist - create account first |
| "Email already registered" | Use different email or login |
| "signup is not a function" | Check AuthProvider in layout.tsx |
| MongoDB connection failed | Check .env.local MONGODB_URI |

---

## 📁 Key Files

```
contexts/AuthContext.tsx       → Auth state management
app/api/auth/signup/route.ts  → Signup API
app/api/auth/login/route.ts   → Login API
app/signup/page.tsx            → Signup page
app/login/page.tsx             → Login page
app/layout.tsx                 → AuthProvider wrapper
models/User.ts                 → User model
lib/mongodb.ts                 → DB connection
.env.local                     → Config
```

---

## ✅ Features

- ✅ User signup with validation
- ✅ User login with authentication
- ✅ Password hashing (bcrypt)
- ✅ JWT token generation
- ✅ LocalStorage persistence
- ✅ Protected routes
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Dark mode support

---

## 🎯 Test Credentials

**Email:** test@example.com  
**Password:** password123

---

**Status:** ✅ Production Ready  
**Last Updated:** January 27, 2025
