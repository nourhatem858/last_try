# Authentication System - Quick Start

## 🚀 Quick Test

### Signup
```bash
# 1. Visit
http://localhost:3000/signup

# 2. Fill form
Name: Test User
Email: test@example.com
Password: password123
Confirm: password123

# 3. Check "I agree to terms"
# 4. Click "Create Account"
# 5. Should redirect to dashboard
```

### Login
```bash
# 1. Visit
http://localhost:3000/login

# 2. Enter credentials
Email: test@example.com
Password: password123

# 3. Click "Sign In"
# 4. Should redirect to dashboard
```

## 📋 Features

### Signup
- ✓ Name validation (min 2 chars)
- ✓ Email validation
- ✓ Password validation (min 6 chars)
- ✓ Password strength indicator
- ✓ Password match check
- ✓ Show/hide password
- ✓ Duplicate email detection

### Login
- ✓ Email validation
- ✓ Password validation
- ✓ Remember me checkbox
- ✓ Forgot password link
- ✓ Loading states
- ✓ Success/error messages

### Security
- ✓ bcrypt password hashing
- ✓ JWT tokens (7-day expiry)
- ✓ Email enumeration protection
- ✓ Case-insensitive email
- ✓ Input validation

## 🧪 Run Tests

```bash
node test-auth-system.js
```

**Expected:** 12/12 tests pass ✅

## 🔧 API Endpoints

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🐛 Troubleshooting

### Issue: 500 Error
**Solution:**
1. Check MongoDB is running: `mongosh`
2. Check `.env.local` has MONGODB_URI
3. Check server logs for details

### Issue: "Email already registered"
**Solution:**
1. Use different email
2. Or login with existing account
3. Or delete user from database

### Issue: "Invalid email or password"
**Solution:**
1. Verify email is correct
2. Verify password is correct
3. Check caps lock is off
4. Try signup if new user

### Issue: Not redirecting
**Solution:**
1. Check browser console for errors
2. Verify `/dashboard` route exists
3. Check token is stored: `localStorage.getItem('token')`

## ✅ Verification

- [ ] Signup works
- [ ] Login works
- [ ] Token stored in localStorage
- [ ] User data stored in localStorage
- [ ] Redirect to dashboard works
- [ ] Error messages are clear
- [ ] Loading states work
- [ ] All tests pass (12/12)

## 📊 Status

**✅ WORKING**

All features implemented and tested:
- Signup ✓
- Login ✓
- Validation ✓
- Security ✓
- Error handling ✓
- Testing ✓

---

For complete details, see: `AUTH_SYSTEM_COMPLETE.md`
