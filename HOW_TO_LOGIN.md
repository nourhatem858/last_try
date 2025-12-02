# 🔐 How To Login - Step by Step

## ✅ Your Auth System is Working!

---

## 🚀 Quick Start (3 Steps)

### Step 1: Start Your Server

```bash
npm run dev
```

Wait for: `✓ Ready on http://localhost:3000`

### Step 2: Open Login Page

Visit: **http://localhost:3000/login**

### Step 3: Login

Enter these credentials:
- **Email:** `test@example.com`
- **Password:** `password123`

Click **"Sign In"**

✅ **Done!** You'll be redirected to the dashboard.

---

## 🎯 Alternative: Create Your Own Account

### Step 1: Visit Signup Page

Visit: **http://localhost:3000/signup**

### Step 2: Fill The Form

- **Name:** Your Name
- **Email:** your@email.com
- **Password:** yourpassword (min 6 characters)
- **Confirm Password:** yourpassword

Check: ☑️ "I agree to terms"

### Step 3: Create Account

Click **"Create Account"**

✅ **Done!** You'll be automatically logged in.

---

## 🧪 Test Your Login

### In Browser Console

After logging in, open browser console (F12) and type:

```javascript
// Check if logged in
console.log('Logged in:', localStorage.getItem('token') !== null);

// Get user info
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

You should see:
```
Logged in: true
User: { id: "...", name: "Test User", email: "test@example.com", role: "user" }
```

---

## 🔍 Verify Everything Works

### ✅ Checklist

After logging in, you should see:

- [x] No error messages
- [x] Redirected to `/dashboard`
- [x] User name displayed in UI
- [x] Token in localStorage
- [x] User object in localStorage
- [x] No console errors

### 🧪 Test Commands

```bash
# Check database users
node test-login-debug.js

# Test login API
node test-login-api.js

# Run complete test
node test-auth-complete.js
```

---

## 📋 Available Test Accounts

### Test User (Created by Script)
- **Email:** test@example.com
- **Password:** password123
- **Status:** ✅ Active

### Your Accounts (If Created)
- **Email:** nourhatem.522082@gmail.com
- **Email:** nourhatm.522082@gmail.com
- **Password:** (your password)

---

## 🎨 What You'll See

### Login Page Features

1. **Email Field** - Enter your email
2. **Password Field** - Enter your password
3. **Show/Hide Password** - Toggle visibility
4. **Remember Me** - Stay logged in
5. **Forgot Password** - Reset link
6. **Sign In Button** - Submit form
7. **Create Account Link** - Go to signup

### After Login

1. **Redirect** - Automatically go to `/dashboard`
2. **User Info** - See your name and email
3. **Logout Button** - Sign out anytime
4. **Protected Routes** - Access authenticated pages

---

## 🐛 Troubleshooting

### "Invalid email or password"

**Cause:** Email or password is wrong

**Solution:**
1. Use test credentials: `test@example.com` / `password123`
2. Or create new account at `/signup`
3. Check database: `node test-login-debug.js`

### "Cannot connect to server"

**Cause:** Dev server not running

**Solution:**
```bash
npm run dev
```

### "Page not found"

**Cause:** Wrong URL

**Solution:**
- Login: `http://localhost:3000/login`
- Signup: `http://localhost:3000/signup`

---

## 💻 Code Usage

### Check If User Is Logged In

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.name}!</div>;
}
```

### Login Programmatically

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function CustomLogin() {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login('test@example.com', 'password123');
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  return <button onClick={handleLogin}>Login</button>;
}
```

### Logout

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button onClick={logout}>
      Logout
    </button>
  );
}
```

---

## 🎯 Quick Reference

| Action | URL | Credentials |
|--------|-----|-------------|
| Login | `/login` | test@example.com / password123 |
| Signup | `/signup` | Create new account |
| Dashboard | `/dashboard` | After login |

---

## 📞 Need Help?

### Documentation
- **Full Guide:** `AUTH_SYSTEM_COMPLETE_GUIDE.md`
- **Quick Reference:** `AUTH_QUICK_REFERENCE.md`
- **Summary:** `AUTH_SYSTEM_FIXED_SUMMARY.md`

### Test Scripts
```bash
node create-test-user.js      # Create test user
node test-login-debug.js      # Check database
node test-login-api.js        # Test login API
node test-auth-complete.js    # Complete test
```

---

## ✅ Success!

If you can:
1. ✅ Visit `/login`
2. ✅ Enter credentials
3. ✅ Click "Sign In"
4. ✅ See dashboard

**Your auth system is working perfectly!** 🎉

---

**Test Credentials:**
- Email: `test@example.com`
- Password: `password123`

**Login URL:** `http://localhost:3000/login`

**Status:** ✅ READY TO USE

---

**Last Updated:** January 27, 2025
