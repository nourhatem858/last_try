/**
 * Login API Route
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Login attempt for:', email);

    // Validate required fields
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return NextResponse.json(
        {
          success: false,
          error: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    if (!emailRegex.test(trimmedEmail)) {
      console.log('❌ Invalid email format:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected');

    // Find user by email
    console.log('🔍 Looking up user:', trimmedEmail);
    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        {
          success: false,
          code: 'NOT_FOUND',
          error: 'Account not found',
          message: 'No account found with this email address.',
        },
        { status: 404 }
      );
    }

    console.log('✅ User found:', user.email);

    // Verify password
    console.log('🔑 Verifying password...');
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_PASSWORD',
          error: 'Incorrect password',
          message: 'The password you entered is incorrect.',
        },
        { status: 401 }
      );
    }

    console.log('✅ Password verified');

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', user.email);

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
          avatar: user.avatar || '',
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Login error:', error);
    console.error('Error stack:', error.stack);

    // Check for specific error types
    if (error.name === 'MongooseError' || error.name === 'MongoError') {
      console.error('💥 Database error:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection error. Please try again later.',
        },
        { status: 503 }
      );
    }

    if (error.name === 'JsonWebTokenError') {
      console.error('💥 JWT error:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication error. Please try again.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}
