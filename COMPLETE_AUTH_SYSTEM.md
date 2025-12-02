# 🔐 Complete Next.js 13 Authentication System

## Copy-Paste Ready Files

All files below are ready to copy-paste into your Next.js 13 project.

---

## 📁 File 1: `.env.local`

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://nourhatem522082_db_user:dJlfReZEr0fRH4do@cluster0.dvzqg3m.mongodb.net/test?retryWrites=true&w=majority

# JWT Secret (change this to a secure random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars

# Environment
NODE_ENV=development
```

---

## 📁 File 2: `lib/connectDB.ts`

```typescript
/**
 * MongoDB Connection Utility
 * Handles connection to MongoDB Atlas with connection caching
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB
 * Reuses existing connection if available
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Return existing connection if available
  if (cached.conn) {
    console.log('✅ Using existing MongoDB connection');
    return cached.conn;
  }

  // Return existing promise if connection is in progress
  if (cached.promise) {
    console.log('⏳ MongoDB connection in progress...');
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // Create new connection
  const opts = {
    bufferCommands: false,
  };

  console.log('🔌 Creating new MongoDB connection...');

  cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
    console.log('✅ MongoDB connected successfully');
    return mongoose;
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ MongoDB connection failed:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

---

## 📁 File 3: `models/User.ts`

```typescript
/**
 * User Model - MongoDB Schema
 */

import mongoose from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
```

---

## 📁 File 4: `app/api/auth/signup/route.ts`

```typescript
/**
 * Signup API Route - User Registration
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/connectDB';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    console.log('📝 Signup request:', { name, email });

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate name length
    if (name.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Name must be at least 2 characters' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate email format
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { 
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'user',
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User created successfully:', user.email);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Signup error:', error);

    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { 
          status: 409,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        { success: false, error: messages },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Generic error
    return NextResponse.json(
      { success: false, error: 'An error occurred during signup. Please try again.' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
```

---

## 📁 File 5: `app/api/auth/login/route.ts`

```typescript
/**
 * Login API Route - User Authentication
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/connectDB';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login request:', { email });

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in successfully:', user.email);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('❌ Login error:', error);

    return NextResponse.json(
      { success: false, error: 'An error occurred during login. Please try again.' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}
```

---

## 📦 Installation Commands

```bash
# Install required dependencies
npm install mongoose bcryptjs jsonwebtoken

# Install TypeScript types
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## 🧪 Testing Commands

```bash
# Test Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'

# Test Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

---

## 📊 Expected Responses

### Signup Success (201)
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

### Login Success (200)
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

### Error Response (400/401/409/500)
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## ✅ Features Included

- ✅ MongoDB connection with caching
- ✅ User model with validation
- ✅ Signup API with validation
- ✅ Login API with authentication
- ✅ Password hashing (bcrypt)
- ✅ JWT token generation (7 days)
- ✅ Email uniqueness check
- ✅ Proper error handling
- ✅ CORS headers
- ✅ TypeScript support
- ✅ Next.js 13 App Router compatible

---

## 🎯 Quick Start

1. Copy all files to your project
2. Run: `npm install mongoose bcryptjs jsonwebtoken`
3. Run: `npm install -D @types/bcryptjs @types/jsonwebtoken`
4. Create `.env.local` with your MongoDB URI
5. Run: `npm run dev`
6. Test with curl commands above

---

## 🚀 Ready to Use!

All files are production-ready and follow Next.js 13 best practices!
