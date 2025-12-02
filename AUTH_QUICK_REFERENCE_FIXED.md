# 🚀 Authentication System - Quick Reference

## 📋 Quick Commands

```bash
# Start development server
npm run dev

# Test authentication system
node test-auth-complete-fixed.js

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🔗 URLs

- **Signup:** http://localhost:3000/signup
- **Login:** http://localhost:3000/login
- **Forgot Password:** http://localhost:3000/forgot-password
- **Dashboard:** http://localhost:3000/dashboard

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login |
| POST | `/api/auth/forgot-password` | ❌ | Request reset |
| POST | `/api/auth/reset-password` | ❌ | Reset password |
| GET | `/api/auth/me` | ✅ | Get user profile |
| GET | `/api/dashboard/summary` | ✅ | Get dashboard data |

## 🔑 Environment Variables

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=your-32-character-secret-key-here
OPENAI_API_KEY=sk-your-key-here
```

## 💻 Code Snippets

### Use Auth in Component
```tsx
import { useAuth } from '@/contexts/AuthContext';

const { user, token, isAuthenticated, login, logout } = useAuth();
```

### Make Authenticated Request
```tsx
const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

### Protect API Route
```typescript
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

const token = extractTokenFromHeader(request.headers.get('Authorization'));
const decoded = verifyToken(token);
if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
```

## ✅ Testing Checklist

- [ ] Signup with new email works
- [ ] Signup with duplicate email fails
- [ ] Login with correct credentials works
- [ ] Login with wrong password fails
- [ ] Dashboard loads after login
- [ ] Dashboard shows user name
- [ ] Forgot password sends OTP
- [ ] Reset password with OTP works
- [ ] Protected routes require token
- [ ] Invalid token returns 401

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Check MONGODB_URI and IP whitelist |
| Invalid token | Clear localStorage and login again |
| Email not sent | Check server logs for OTP (mock service) |
| Dashboard not loading | Verify token in localStorage |

## 📁 Key Files

```
contexts/AuthContext.tsx           - Auth state management
lib/jwt.ts                         - JWT utilities
lib/password.ts                    - Password hashing
lib/email.ts                       - Email service
app/api/auth/signup/route.ts       - Signup API
app/api/auth/login/route.ts        - Login API
app/api/auth/forgot-password/route.ts
app/api/auth/reset-password/route.ts
app/api/auth/me/route.ts           - Get user
app/api/dashboard/summary/route.ts - Dashboard data
```

## 🔒 Security Features

✅ Password hashing (bcrypt)
✅ JWT tokens (7-day expiry)
✅ Protected routes
✅ Rate limiting (password reset)
✅ Email enumeration prevention
✅ Input validation
✅ Error handling

## 📊 Test Results

Run `node test-auth-complete-fixed.js` to see:

```
✅ Signup
✅ Duplicate Signup Prevention
✅ Login
✅ Invalid Login Prevention
✅ Protected Route Access
✅ Unauthorized Access Prevention
✅ Forgot Password
✅ Dashboard Summary

Total: 8/8 tests passed
```

## 🎯 User Flow

1. **New User:** Signup → Dashboard
2. **Existing User:** Login → Dashboard
3. **Forgot Password:** Request OTP → Enter OTP → Reset → Login
4. **Logout:** Clear token → Redirect to login

## 📞 Support

For detailed documentation, see: `AUTH_SYSTEM_COMPLETE_FIXED.md`
