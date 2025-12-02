# Complete Signup Feature - Implementation Guide

## 📦 What Was Created

### Frontend
1. **`app/signup/page.tsx`** - Complete signup page with validation
2. **`services/authService.ts`** - Already has signup method

### Backend
1. **`app/api/auth/signup/route.ts`** - Signup API endpoint
2. **`lib/mongodb.ts`** - MongoDB connection utility
3. **`models/User.ts`** - User model schema

### Context
- **`contexts/AuthContext.tsx`** - Already has signup function

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Variables

Create `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-workspace
# or MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Just update MONGODB_URI in .env.local
```

### 4. Test Signup

Navigate to: `http://localhost:3000/signup`

## 📋 Features

### Frontend Features ✅
- **Form Validation**
  - Name (min 2 characters)
  - Email (valid format)
  - Password (min 6 characters)
  - Password confirmation
  - Real-time validation
  
- **Password Strength Indicator**
  - Weak (< 6 chars) - Red
  - Medium (6-9 chars) - Yellow
  - Strong (10+ chars with uppercase & numbers) - Green

- **User Experience**
  - Show/hide password toggle
  - Loading state during signup
  - Error messages from backend
  - Success redirect to dashboard
  - Terms & conditions checkbox
  - Link to login page

- **Styling**
  - Modern gradient design
  - Tailwind CSS
  - Dark mode support
  - Responsive (mobile/tablet/desktop)
  - Smooth animations

### Backend Features ✅
- **Validation**
  - Required fields check
  - Email format validation
  - Password length validation
  - Duplicate email check

- **Security**
  - Password hashing with bcrypt (10 salt rounds)
  - JWT token generation
  - Secure password storage
  - Input sanitization

- **Error Handling**
  - Validation errors (400)
  - Duplicate email (409)
  - Server errors (500)
  - Detailed error messages

- **Database**
  - MongoDB integration
  - User model with schema
  - Indexes for performance
  - Timestamps

## 🔧 API Endpoint

### POST /api/auth/signup

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1234567890",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Password must be at least 6 characters long"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

## 📝 Usage Examples

### Frontend Usage

```tsx
import { useAuth } from '@/contexts/AuthContext';

function SignupForm() {
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(name, email, password);
      // Automatically redirects to /dashboard
    } catch (error) {
      console.error('Signup failed:', error.message);
    }
  };
}
```

### Direct API Call

```tsx
import authService from '@/services/authService';

const handleSignup = async () => {
  try {
    const response = await authService.signup({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securePassword123'
    });
    
    console.log('User:', response.user);
    console.log('Token:', response.token);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

## 🗄️ Database Schema

### User Collection

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // Hashed
  role: "user",
  avatar: null,
  bio: "",
  favoriteTopics: [],
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2024-01-01T00:00:00.000Z")
}
```

### Indexes

```javascript
{ email: 1 } // Unique index
{ createdAt: -1 } // For sorting
```

## 🔐 Security Best Practices

### Password Hashing

```typescript
import bcrypt from 'bcryptjs';

// Hash password
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

// Verify password (for login)
const isMatch = await bcrypt.compare(password, hashedPassword);
```

### JWT Token

```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

## 🧪 Testing

### Manual Testing

1. **Valid Signup**
   - Fill all fields correctly
   - Should create account and redirect

2. **Validation Errors**
   - Leave fields empty
   - Enter invalid email
   - Use short password
   - Mismatched passwords

3. **Duplicate Email**
   - Try signing up with existing email
   - Should show error message

4. **Password Strength**
   - Test weak password (< 6 chars)
   - Test medium password (6-9 chars)
   - Test strong password (10+ with uppercase & numbers)

### API Testing with cURL

```bash
# Successful signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Validation error
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jo",
    "email": "invalid-email",
    "password": "123"
  }'
```

## 🔄 Integration with Existing Code

### AuthContext Integration

The signup function in `AuthContext` automatically:
1. Calls `authService.signup()`
2. Stores JWT token in localStorage
3. Updates user state
4. Redirects to `/dashboard`

```tsx
const signup = async (name: string, email: string, password: string) => {
  try {
    const response = await authService.signup({ name, email, password });
    setUser(response.user);
    router.push('/dashboard');
  } catch (error: any) {
    throw error;
  }
};
```

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Full-width form
- Touch-optimized inputs
- Stacked feature cards

### Tablet (768px - 1024px)
- Centered form
- Optimized spacing
- Readable text sizes

### Desktop (> 1024px)
- Max-width container
- Larger form elements
- Hover effects

## ♿ Accessibility

- ✅ Semantic HTML
- ✅ Form labels
- ✅ Error messages
- ✅ Keyboard navigation
- ✅ Focus states
- ✅ ARIA attributes
- ✅ Screen reader support

## 🐛 Troubleshooting

### Issue: MongoDB connection failed

**Solution:**
```bash
# Check if MongoDB is running
mongod --version

# Start MongoDB
mongod

# Or use MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://...
```

### Issue: JWT_SECRET not defined

**Solution:**
```env
# Add to .env.local
JWT_SECRET=your-secret-key-here
```

### Issue: bcrypt installation error

**Solution:**
```bash
# Rebuild bcrypt
npm rebuild bcrypt

# Or use bcryptjs (pure JavaScript)
npm install bcryptjs
```

### Issue: Duplicate email not detected

**Solution:**
- Ensure MongoDB unique index on email field
- Check database connection
- Verify User model is imported correctly

## 🚀 Deployment

### Environment Variables (Production)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/production
JWT_SECRET=generate-a-secure-random-string-for-production
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Generate Secure JWT Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or online
# https://www.grc.com/passwords.htm
```

## 📊 Next Steps

1. **Email Verification**
   - Send verification email
   - Verify email before login

2. **Social Login**
   - Google OAuth
   - GitHub OAuth

3. **Password Reset**
   - Forgot password flow
   - Reset token generation

4. **Rate Limiting**
   - Prevent brute force attacks
   - Limit signup attempts

5. **CAPTCHA**
   - Add reCAPTCHA
   - Prevent bot signups

## ✅ Checklist

- [x] Signup page created
- [x] Form validation
- [x] Password strength indicator
- [x] API endpoint created
- [x] MongoDB model created
- [x] Password hashing
- [x] JWT token generation
- [x] Error handling
- [x] AuthContext integration
- [x] Responsive design
- [x] Dark mode support
- [x] Documentation

## 🎉 Summary

You now have a complete, production-ready signup feature with:

- ✅ Beautiful, modern UI
- ✅ Comprehensive validation
- ✅ Secure password hashing
- ✅ JWT authentication
- ✅ MongoDB integration
- ✅ Error handling
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Full documentation

**Ready to accept new users!** 🚀
