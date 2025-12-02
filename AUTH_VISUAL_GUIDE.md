# 🎨 Auth System - Visual Guide

## 🔄 Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER SIGNUP FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User visits /signup
   │
   ├─► Fills form (name, email, password)
   │
   └─► Clicks "Create Account"
       │
       ├─► Form validation (client-side)
       │   ├─► Name: min 2 chars
       │   ├─► Email: valid format
       │   ├─► Password: min 6 chars
       │   └─► Passwords match
       │
       └─► signup() called in AuthContext
           │
           ├─► POST /api/auth/signup
           │   │
           │   ├─► Validate input
           │   ├─► Check duplicate email
           │   ├─► Hash password (bcrypt)
           │   ├─► Save to MongoDB
           │   └─► Generate JWT token
           │
           └─► Response: { success, token, user }
               │
               ├─► Update AuthContext state
               │   ├─► setUser(user)
               │   └─► setToken(token)
               │
               ├─► Save to localStorage
               │   ├─► localStorage.setItem('user')
               │   └─► localStorage.setItem('token')
               │
               └─► Redirect to /dashboard ✅

┌─────────────────────────────────────────────────────────────┐
│                      USER LOGIN FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User visits /login
   │
   ├─► Fills form (email, password)
   │
   └─► Clicks "Sign In"
       │
       └─► login() called in AuthContext
           │
           ├─► POST /api/auth/login
           │   │
           │   ├─► Find user by email
           │   ├─► Verify password (bcrypt)
           │   └─► Generate JWT token
           │
           └─► Response: { success, token, user }
               │
               ├─► Update AuthContext state
               ├─► Save to localStorage
               └─► Redirect to /dashboard ✅

┌─────────────────────────────────────────────────────────────┐
│                     USER LOGOUT FLOW                         │
└─────────────────────────────────────────────────────────────┘

1. User clicks "Logout"
   │
   └─► logout() called in AuthContext
       │
       ├─► Clear state
       │   ├─► setUser(null)
       │   └─► setToken(null)
       │
       ├─► Clear localStorage
       │   ├─► localStorage.removeItem('user')
       │   └─► localStorage.removeItem('token')
       │
       └─► User logged out ✅
```

## 📁 File Structure

```
project/
│
├── contexts/
│   └── AuthContext.tsx              🔵 Core auth logic
│       ├── AuthProvider             Wraps entire app
│       ├── useAuth() hook           Access auth functions
│       ├── signup()                 Create account
│       ├── login()                  Authenticate
│       ├── logout()                 Clear session
│       └── State: user, token, isAuthenticated
│
├── app/
│   ├── layout.tsx                   🔵 Wraps with AuthProvider
│   │
│   ├── signup/
│   │   └── page.tsx                 🟢 Signup form
│   │       ├── Form validation
│   │       ├── Password strength
│   │       ├── Error handling
│   │       └── Redirect on success
│   │
│   ├── login/
│   │   └── page.tsx                 🟢 Login form
│   │       ├── Email/password
│   │       ├── Remember me
│   │       ├── Error handling
│   │       └── Redirect on success
│   │
│   └── api/
│       └── auth/
│           ├── signup/
│           │   └── route.ts         🔴 Signup API
│           │       ├── Validate input
│           │       ├── Hash password
│           │       ├── Save to DB
│           │       └── Return JWT
│           │
│           └── login/
│               └── route.ts         🔴 Login API
│                   ├── Find user
│                   ├── Verify password
│                   └── Return JWT
│
├── components/
│   └── AuthExample.tsx              📘 Usage example
│
└── types/
    └── index.ts                     📘 TypeScript types
```

## 🎯 Component Usage

```typescript
┌─────────────────────────────────────────────────────────────┐
│                   ANY COMPONENT                              │
└─────────────────────────────────────────────────────────────┘

'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  // 1. Get auth functions and state
  const { 
    signup,           // Function to create account
    login,            // Function to authenticate
    logout,           // Function to clear session
    user,             // Current user object
    token,            // JWT token
    isAuthenticated,  // Boolean: is user logged in?
    loading           // Boolean: initial load state
  } = useAuth();

  // 2. Use signup
  const handleSignup = async () => {
    try {
      const result = await signup(name, email, password);
      if (result.success) {
        console.log('User:', result.user);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // 3. Use login
  const handleLogin = async () => {
    try {
      const result = await login(email, password);
      if (result.success) {
        console.log('User:', result.user);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  // 4. Use logout
  const handleLogout = () => {
    logout();
  };

  // 5. Conditional rendering
  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={handleSignup}>Sign Up</button>
          <button onClick={handleLogin}>Login</button>
        </div>
      )}
    </div>
  );
}
```

## 🔐 Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY FEATURES                         │
└─────────────────────────────────────────────────────────────┘

Frontend (Client)
├─► Input validation
├─► Email format check
├─► Password length check
├─► XSS protection (React escaping)
└─► HTTPS (in production)

Backend (API)
├─► Input validation
├─► Email uniqueness check
├─► Password hashing (bcrypt, 10 rounds)
├─► JWT token generation (7-day expiry)
├─► MongoDB injection protection
└─► Error message sanitization

Database (MongoDB)
├─► Unique email constraint
├─► Password stored as hash only
├─► User roles
└─► Timestamps
```

## 📊 State Management

```
┌─────────────────────────────────────────────────────────────┐
│                   AUTH STATE FLOW                            │
└─────────────────────────────────────────────────────────────┘

Initial Load
├─► Check localStorage
│   ├─► token exists? → setToken(token)
│   └─► user exists? → setUser(user)
└─► setLoading(false)

After Signup/Login
├─► API returns { success, token, user }
├─► Update React state
│   ├─► setToken(token)
│   └─► setUser(user)
├─► Update localStorage
│   ├─► localStorage.setItem('token', token)
│   └─► localStorage.setItem('user', JSON.stringify(user))
└─► isAuthenticated = true

After Logout
├─► Clear React state
│   ├─► setToken(null)
│   └─► setUser(null)
├─► Clear localStorage
│   ├─► localStorage.removeItem('token')
│   └─► localStorage.removeItem('user')
└─► isAuthenticated = false
```

## 🧪 Testing Checklist

```
┌─────────────────────────────────────────────────────────────┐
│                      TEST CASES                              │
└─────────────────────────────────────────────────────────────┘

✅ Signup with valid data
   └─► Should create user and redirect to /dashboard

✅ Signup with duplicate email
   └─► Should show error: "Email already registered"

✅ Signup with invalid email
   └─► Should show error: "Invalid email format"

✅ Signup with short password
   └─► Should show error: "Password must be at least 6 characters"

✅ Login with valid credentials
   └─► Should authenticate and redirect to /dashboard

✅ Login with invalid password
   └─► Should show error: "Invalid email or password"

✅ Login with non-existent email
   └─► Should show error: "Invalid email or password"

✅ Logout
   └─► Should clear session and redirect to login

✅ Protected route access
   └─► Should redirect to login if not authenticated

✅ Token persistence
   └─► Should maintain session after page refresh
```

## 🎨 UI Components

```
┌─────────────────────────────────────────────────────────────┐
│                    SIGNUP PAGE                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Create Account              │
│   Join the AI Knowledge Workspace   │
├─────────────────────────────────────┤
│                                     │
│  👤 Full Name                       │
│  ┌─────────────────────────────┐   │
│  │ John Doe                    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ✉️  Email Address                  │
│  ┌─────────────────────────────┐   │
│  │ you@example.com             │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔒 Password                        │
│  ┌─────────────────────────────┐   │
│  │ ••••••••              👁️    │   │
│  └─────────────────────────────┘   │
│  ▓▓▓▓▓▓░░░░ Medium                 │
│                                     │
│  🔒 Confirm Password                │
│  ┌─────────────────────────────┐   │
│  │ ••••••••              👁️    │   │
│  └─────────────────────────────┘   │
│  ✓ Passwords match                 │
│                                     │
│  ☑️ I agree to Terms & Privacy      │
│                                     │
│  ┌─────────────────────────────┐   │
│  │    Create Account           │   │
│  └─────────────────────────────┘   │
│                                     │
│  Already have an account? Sign in  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          LOGIN PAGE                 │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         Welcome Back                │
│   Sign in to your workspace         │
├─────────────────────────────────────┤
│                                     │
│  ✉️  Email Address                  │
│  ┌─────────────────────────────┐   │
│  │ you@example.com             │   │
│  └─────────────────────────────┘   │
│                                     │
│  🔒 Password                        │
│  ┌─────────────────────────────┐   │
│  │ ••••••••              👁️    │   │
│  └─────────────────────────────┘   │
│                                     │
│  ☑️ Remember me  Forgot password?   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │       Sign In               │   │
│  └─────────────────────────────┘   │
│                                     │
│  Don't have an account? Create one │
└─────────────────────────────────────┘
```

## 🚀 Quick Commands

```bash
# Start development server
npm run dev

# Run auth tests
node test-auth-complete.js

# Test signup page
# Visit: http://localhost:3000/signup

# Test login page
# Visit: http://localhost:3000/login

# Check console logs
# Look for: 🟢 🔵 ✅ ❌
```

---

**Status:** ✅ Production Ready  
**Last Updated:** November 27, 2025
