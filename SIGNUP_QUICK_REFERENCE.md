# Signup Feature - Quick Reference

## 🚀 Installation (2 minutes)

```bash
# 1. Install dependencies
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken

# 2. Create .env.local
echo "MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace" >> .env.local
echo "JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" >> .env.local

# 3. Start MongoDB (if using local)
mongod

# 4. Start Next.js
npm run dev

# 5. Visit
# http://localhost:3000/signup
```

## 📁 Files Created

```
✅ app/signup/page.tsx                 # Signup page
✅ app/api/auth/signup/route.ts        # API endpoint
✅ lib/mongodb.ts                      # MongoDB connection
✅ models/User.ts                      # User model
✅ services/authService.ts             # Already has signup method
✅ contexts/AuthContext.tsx            # Already has signup function
```

## 🎯 Usage

### Frontend

```tsx
import { useAuth } from '@/contexts/AuthContext';

const { signup } = useAuth();

await signup(name, email, password);
// Automatically redirects to /dashboard
```

### API

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'
```

## ✨ Features

### Frontend ✅
- Form validation
- Password strength indicator
- Show/hide password
- Loading states
- Error messages
- Dark mode
- Responsive

### Backend ✅
- Input validation
- Password hashing (bcrypt)
- JWT token generation
- Duplicate email check
- MongoDB integration
- Error handling

## 🔗 Navigation

- Signup: `/signup`
- Login: `/login`
- Dashboard: `/dashboard` (after signup)

## 📝 Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
JWT_SECRET=your-secret-key-here
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🧪 Test Data

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123"
}
```

## 🎨 Styling

- Tailwind CSS
- Gradient buttons (cyan → blue)
- Modern, clean design
- Smooth animations
- Dark mode support

## 🔐 Security

- ✅ Password hashing (bcrypt, 10 rounds)
- ✅ JWT tokens (7 day expiry)
- ✅ Input validation
- ✅ Email uniqueness
- ✅ Secure password storage

## 📊 API Response

### Success (201)
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

### Error (400/409/500)
```json
{
  "success": false,
  "error": "Email already registered"
}
```

## ✅ Checklist

- [ ] Install dependencies
- [ ] Set environment variables
- [ ] Start MongoDB
- [ ] Test signup page
- [ ] Test API endpoint
- [ ] Verify token storage
- [ ] Test redirect to dashboard

## 🐛 Quick Fixes

### MongoDB not connecting?
```bash
# Start MongoDB
mongod

# Or use MongoDB Atlas
MONGODB_URI=mongodb+srv://...
```

### bcrypt error?
```bash
npm rebuild bcrypt
# or use bcryptjs (already installed)
```

### JWT error?
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📚 Documentation

- `SIGNUP_COMPLETE_GUIDE.md` - Full documentation
- `SIGNUP_DEPENDENCIES.md` - Installation guide
- `SIGNUP_QUICK_REFERENCE.md` - This file

## 🎉 Done!

Your signup feature is complete and ready to use!

**Test it now:** http://localhost:3000/signup
