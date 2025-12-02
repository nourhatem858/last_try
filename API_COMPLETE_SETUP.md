# 🚀 Complete Next.js 16 Auth API - Ready to Use

## ✅ What's Included

A fully working authentication system with:
- ✅ Signup API (`/api/auth/signup`)
- ✅ Login API (`/api/auth/login`)
- ✅ MongoDB Atlas connection
- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Full validation
- ✅ Error handling
- ✅ CORS support
- ✅ TypeScript

## 📁 File Structure

```
project/
├── app/
│   └── api/
│       └── auth/
│           ├── signup/
│           │   └── route.ts      ✅ Created
│           └── login/
│               └── route.ts      ✅ Created
├── lib/
│   └── mongodb.ts                ✅ Created
├── models/
│   └── User.ts                   ✅ Created
├── .env.local                    ✅ Updated
└── package.json                  (install dependencies)
```

## 🔧 Setup Instructions

### 1. Install Dependencies

```bash
npm install mongoose bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### 2. Environment Variables

Your `.env.local` is already configured with:
```env
MONGODB_URI=mongodb+srv://nourhatem522082_db_user:dJlfReZEr0fRH4do@cluster0.dvzqg3m.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-use-at-least-32-characters
```

### 3. Start Development Server

```bash
npm run dev
```

## 🧪 Test the APIs

### Test Signup

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (201):**
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

### Test Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
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

## 📊 API Endpoints

### POST /api/auth/signup

**Request Body:**
```json
{
  "name": "string (min 2 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Responses:**
- `201` - Account created successfully
- `400` - Validation error (missing fields, invalid format)
- `409` - Email already registered
- `500` - Server error

### POST /api/auth/login

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Responses:**
- `200` - Login successful
- `400` - Missing fields
- `401` - Invalid credentials
- `500` - Server error

## 🔒 Security Features

### Password Security
- ✅ Hashed with bcrypt (10 rounds)
- ✅ Never stored in plain text
- ✅ Minimum 6 characters required

### JWT Tokens
- ✅ Signed with JWT_SECRET
- ✅ Expires in 7 days
- ✅ Contains: user ID, email, role

### Input Validation
- ✅ All fields required
- ✅ Email format validation
- ✅ Name minimum length (2 chars)
- ✅ Password minimum length (6 chars)
- ✅ Duplicate email detection

### Error Handling
- ✅ Comprehensive error messages
- ✅ Proper HTTP status codes
- ✅ Stack traces logged (server-side only)
- ✅ User-friendly error messages

## 💻 Frontend Integration

### React/Next.js Example

```typescript
// Signup
async function handleSignup(name: string, email: string, password: string) {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Signup failed:', error);
    alert('An error occurred. Please try again.');
  }
}

// Login
async function handleLogin(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Store token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error('Login failed:', error);
    alert('An error occurred. Please try again.');
  }
}
```

### Using Axios

```typescript
import axios from 'axios';

// Signup
const signup = async (name: string, email: string, password: string) => {
  const response = await axios.post('/api/auth/signup', {
    name,
    email,
    password,
  });
  return response.data;
};

// Login
const login = async (email: string, password: string) => {
  const response = await axios.post('/api/auth/login', {
    email,
    password,
  });
  return response.data;
};
```

## 🐛 Troubleshooting

### Error: "MONGODB_URI not defined"
**Solution:** Restart dev server after creating `.env.local`

### Error: "Cannot find module 'bcryptjs'"
**Solution:** 
```bash
npm install bcryptjs jsonwebtoken mongoose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Error: "MongoServerError: bad auth"
**Solution:** Check MongoDB credentials in `.env.local`

### Error: "Email already registered"
**Solution:** This is expected - use a different email or login instead

## 📝 Database Schema

### User Collection

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // Hashed with bcrypt
  role: "user",
  createdAt: ISODate("2024-01-01T00:00:00.000Z"),
  updatedAt: ISODate("2024-01-01T00:00:00.000Z")
}
```

### Indexes
- `email` - Unique index for fast lookups and duplicate prevention

## 🎯 Next Steps

1. **Test the APIs** - Use curl or Postman
2. **Create frontend forms** - Signup and login pages
3. **Add protected routes** - Use JWT token for authentication
4. **Add user profile** - Display user info
5. **Add logout** - Clear token from localStorage

## ✅ Checklist

- [x] MongoDB connection configured
- [x] User model created
- [x] Signup API created
- [x] Login API created
- [x] Password hashing implemented
- [x] JWT tokens implemented
- [x] Validation implemented
- [x] Error handling implemented
- [x] CORS support added
- [x] TypeScript types added

## 🎉 You're Ready!

Your authentication system is complete and ready to use!

```bash
npm run dev
# Visit http://localhost:3000
```

Test the APIs and start building your application! 🚀
