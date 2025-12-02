# 🔐 Authentication System - Flow Diagrams

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AUTHENTICATION SYSTEM                        │
│                                                                  │
│  Frontend (React/Next.js)  ←→  Backend (API Routes)  ←→  MongoDB│
│                                                                  │
│  - Login Page              ←→  /api/auth/login        ←→  Users │
│  - Signup Page             ←→  /api/auth/signup       ←→  Users │
│  - Forgot Password Page    ←→  /api/auth/forgot-pwd   ←→  Users │
│  - AuthContext             ←→  /api/auth/verify-otp   ←→  Users │
│                            ←→  /api/auth/reset-pwd    ←→  Users │
│                                                                  │
│  JWT Token Storage: localStorage                                │
│  User State: React Context (AuthContext)                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flow 1: User Signup

```
┌──────────┐
│  User    │
│ visits   │
│ /signup  │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Signup Page (/app/signup/page.tsx)    │
│                                         │
│  1. User fills form:                   │
│     - Name                              │
│     - Email                             │
│     - Password                          │
│     - Confirm Password                  │
│                                         │
│  2. Frontend validation:                │
│     ✓ Name min 2 chars                 │
│     ✓ Email format                     │
│     ✓ Password min 6 chars             │
│     ✓ Passwords match                  │
│                                         │
│  3. Password strength indicator        │
│  4. Show/hide password toggle          │
└────┬────────────────────────────────────┘
     │
     │ POST /api/auth/signup
     │ { name, email, password }
     ▼
┌─────────────────────────────────────────┐
│  Signup API (/api/auth/signup/route)   │
│                                         │
│  1. Validate inputs                     │
│  2. Trim & lowercase email             │
│  3. Connect to MongoDB                 │
│  4. Check duplicate email              │
│  5. Hash password (bcrypt)             │
│  6. Create user in DB                  │
│  7. Generate JWT token                 │
│  8. Return token + user data           │
└────┬────────────────────────────────────┘
     │
     │ Response: { success, token, user }
     ▼
┌─────────────────────────────────────────┐
│  AuthContext (contexts/AuthContext.tsx) │
│                                         │
│  1. Receive token + user               │
│  2. Store in state                     │
│  3. Save to localStorage               │
│  4. Update isAuthenticated = true      │
└────┬────────────────────────────────────┘
     │
     │ Auto-redirect
     ▼
┌──────────┐
│Dashboard │
│  Page    │
└──────────┘
```

---

## 🔑 Flow 2: User Login

```
┌──────────┐
│  User    │
│ visits   │
│ /login   │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Login Page (/app/login/page.tsx)      │
│                                         │
│  1. User enters:                        │
│     - Email                             │
│     - Password                          │
│                                         │
│  2. Frontend validation:                │
│     ✓ Email format                     │
│     ✓ Password not empty               │
│                                         │
│  3. Remember me checkbox               │
│  4. Forgot password link               │
└────┬────────────────────────────────────┘
     │
     │ POST /api/auth/login
     │ { email, password }
     ▼
┌─────────────────────────────────────────┐
│  Login API (/api/auth/login/route)     │
│                                         │
│  1. Validate inputs                     │
│  2. Trim & lowercase email             │
│  3. Connect to MongoDB                 │
│  4. Find user by email                 │
│  5. Compare password (bcrypt)          │
│  6. Generate JWT token                 │
│  7. Return token + user data           │
│                                         │
│  Error cases:                           │
│  - User not found → 401                │
│  - Wrong password → 401                │
│  - Same error message (security)       │
└────┬────────────────────────────────────┘
     │
     │ Response: { success, token, user }
     ▼
┌─────────────────────────────────────────┐
│  AuthContext                            │
│                                         │
│  1. Store token + user                 │
│  2. Save to localStorage               │
│  3. Update isAuthenticated = true      │
└────┬────────────────────────────────────┘
     │
     │ Auto-redirect
     ▼
┌──────────┐
│Dashboard │
└──────────┘
```

---

## 🔓 Flow 3: Forgot Password (Complete 3-Step Process)

### Step 1: Request OTP

```
┌──────────┐
│  User    │
│ clicks   │
│ "Forgot  │
│Password?"│
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────┐
│  Forgot Password Page (Step 1: Email)  │
│                                         │
│  1. User enters email                  │
│  2. Click "Send Verification Code"     │
└────┬────────────────────────────────────┘
     │
     │ POST /api/auth/forgot-password
     │ { email }
     ▼
┌─────────────────────────────────────────┐
│  Forgot Password API                    │
│                                         │
│  1. Validate email                      │
│  2. Find user in DB                    │
│  3. Generate 6-digit OTP               │
│  4. Set expiration (5 minutes)         │
│  5. Save OTP to user record            │
│  6. Send OTP email                     │
│  7. Return success message             │
│                                         │
│  Security: Always return success       │
│  (even if email not found)             │
└────┬────────────────────────────────────┘
     │
     │ Response: { success, message }
     ▼
┌─────────────────────────────────────────┐
│  Email Service (lib/email-service.ts)  │
│                                         │
│  Development: Log OTP to console       │
│  Production: Send via SendGrid/SES     │
│                                         │
│  📧 Email contains:                    │
│  - 6-digit OTP code                    │
│  - Expiration time (5 min)            │
│  - Security warning                    │
└─────────────────────────────────────────┘
```

### Step 2: Verify OTP

```
┌─────────────────────────────────────────┐
│  Forgot Password Page (Step 2: OTP)   │
│                                         │
│  1. User enters 6-digit OTP            │
│  2. Click "Verify Code"                │
│                                         │
│  UI shows:                              │
│  - OTP input (6 digits)                │
│  - Expiration timer                    │
│  - Remaining attempts                  │
└────┬────────────────────────────────────┘
     │
     │ POST /api/auth/verify-otp
     │ { email, otp }
     ▼
┌─────────────────────────────────────────┐
│  Verify OTP API                         │
│                                         │
│  1. Find user by email                 │
│  2. Check if account locked            │
│  3. Verify OTP exists                  │
│  4. Check expiration                   │
│  5. Compare OTP                        │
│                                         │
│  If OTP wrong:                          │
│  - Increment attempts                  │
│  - Lock after 3 attempts (15 min)     │
│  - Return remaining attempts           │
│                                         │
│  If OTP correct:                        │
│  - Generate reset token                │
│  - Set expiration (10 min)            │
│  - Return reset token                  │
└────┬────────────────────────────────────┘
     │
     │ Response: { success, resetToken }
     ▼
┌─────────────────────────────────────────┐
│  Frontend stores resetToken             │
│  Moves to Step 3                        │
└─────────────────────────────────────────┘
```

### Step 3: Reset Password

```
┌─────────────────────────────────────────┐
│  Forgot Password Page (Step 3: Reset)  │
│                                         │
│  1. User enters new password           │
│  2. User confirms password             │
│  3. Click "Reset Password"             │
│                                         │
│  UI shows:                              │
│  - Password requirements checklist     │
│  - Real-time validation                │
│  - Password match indicator            │
└────┬────────────────────────────────────┘
     │
     │ POST /api/auth/reset-password
     │ { email, resetToken, newPassword }
     ▼
┌─────────────────────────────────────────┐
│  Reset Password API                     │
│                                         │
│  1. Validate password strength:        │
│     ✓ Min 12 characters                │
│     ✓ Uppercase letter                 │
│     ✓ Lowercase letter                 │
│     ✓ Number                            │
│     ✓ Symbol                            │
│                                         │
│  2. Verify reset token                 │
│  3. Check token expiration             │
│  4. Check password history             │
│     (prevent reuse of last 3)          │
│  5. Hash new password                  │
│  6. Update user in DB                  │
│  7. Clear reset tokens                 │
│  8. Send confirmation email            │
└────┬────────────────────────────────────┘
     │
     │ Response: { success, message }
     ▼
┌─────────────────────────────────────────┐
│  Success Message                        │
│  Auto-redirect to /login (2 seconds)   │
└─────────────────────────────────────────┘
```

---

## 🔒 Security Flow

```
┌─────────────────────────────────────────┐
│         SECURITY MEASURES               │
└─────────────────────────────────────────┘

1. Password Hashing
   ┌──────────┐
   │ Password │ → bcrypt.hash(password, 10) → │ Hashed │
   └──────────┘                                └────────┘
   
2. JWT Token Generation
   ┌──────────┐
   │ User ID  │ → jwt.sign(payload, secret) → │ Token │
   │ Email    │                                └───────┘
   │ Role     │
   └──────────┘
   
3. Rate Limiting
   Failed Attempt 1 → Warning (2 attempts left)
   Failed Attempt 2 → Warning (1 attempt left)
   Failed Attempt 3 → Lock account (15 minutes)
   
4. OTP Expiration
   Generated → 5 minutes → Expired
   
5. Reset Token Expiration
   Generated → 10 minutes → Expired
   
6. Password History
   Current Password
   Previous Password 1
   Previous Password 2
   Previous Password 3
   ↓
   Check new password against all
   Reject if match found
```

---

## 📱 State Management Flow

```
┌─────────────────────────────────────────┐
│         AuthContext State               │
└─────────────────────────────────────────┘

Initial State:
{
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
}

After Login/Signup:
{
  user: {
    id: "user_id",
    name: "User Name",
    email: "user@example.com",
    role: "user"
  },
  token: "jwt_token_here",
  isAuthenticated: true,
  loading: false
}

Stored in:
1. React State (AuthContext)
2. localStorage (persistence)

After Logout:
{
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false
}
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────┐
│         User Collection (MongoDB)       │
└─────────────────────────────────────────┘

{
  _id: ObjectId,
  name: String (required, min 2),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  role: String (enum: 'user', 'admin'),
  
  // Profile
  bio: String,
  favoriteTopics: [String],
  theme: String (enum: 'light', 'dark'),
  avatar: String,
  
  // Password Reset
  resetOTP: String (6-digit or reset token),
  resetOTPExpires: Date,
  resetAttempts: Number,
  resetLockedUntil: Date,
  
  // Security
  passwordHistory: [String] (last 5 hashed passwords),
  lastPasswordReset: Date,
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}

Indexes:
- email (unique)
- createdAt
```

---

## 🎯 Error Handling Flow

```
┌─────────────────────────────────────────┐
│         Error Handling Strategy         │
└─────────────────────────────────────────┘

Frontend Error:
┌──────────────┐
│ API Request  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Try/Catch    │
└──────┬───────┘
       │
       ├─ Success → Update state → Redirect
       │
       └─ Error → Parse error → Show message
                  │
                  ├─ 400: Validation error
                  ├─ 401: Auth error
                  ├─ 409: Duplicate
                  ├─ 429: Rate limit
                  └─ 500: Server error

Backend Error:
┌──────────────┐
│ API Handler  │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Try/Catch    │
└──────┬───────┘
       │
       ├─ Success → Return JSON
       │
       └─ Error → Log error → Return JSON
                  │
                  ├─ Validation → 400
                  ├─ Auth → 401
                  ├─ Duplicate → 409
                  ├─ Rate limit → 429
                  └─ Unknown → 500
```

---

## 🚀 Complete User Journey

```
New User:
/signup → Create account → Auto-login → /dashboard

Existing User:
/login → Enter credentials → Verify → /dashboard

Forgot Password:
/login → "Forgot password?" → /forgot-password
  → Enter email → Receive OTP → Enter OTP
  → Set new password → /login → Success

Logout:
/dashboard → Logout button → Clear state → /login
```

---

## ✅ Success Criteria

```
✓ User can signup
✓ User can login
✓ User can reset password
✓ Passwords are hashed
✓ JWT tokens work
✓ Email validation works
✓ Rate limiting works
✓ OTP expiration works
✓ Password history works
✓ Error messages are clear
✓ UI is responsive
✓ Auto-redirect works
✓ State persists on refresh
```

---

**This is your complete authentication system architecture! 🎉**
