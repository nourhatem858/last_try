/**
 * Signup API Route - User Registration
 * POST /api/auth/signup
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, password } = body;

    // Trim and normalize inputs
    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();

    console.log('📝 Signup request:', { name: trimmedName, email: trimmedEmail });

    // Validate required fields
    if (!trimmedName || !trimmedEmail || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'All fields are required',
        },
        { status: 400 }
      );
    }

    // Validate name length
    if (trimmedName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name must be at least 2 characters',
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 6 characters',
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          code: 'EMAIL_EXISTS',
          error: 'This email is already registered',
          message: 'This email is already registered. Please login or reset your password.',
        },
        { status: 409 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
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

    // Return success response with CORS headers
    const response = NextResponse.json(
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
      { status: 201 }
    );

    // Add CORS headers (optional - allows requests from any origin)
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

    return response;
  } catch (error: any) {
    // Log full error stack for debugging
    console.error('❌ Signup error - Full stack trace:');
    console.error(error.stack || error);

    // Handle duplicate key error (MongoDB unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already registered',
        },
        { status: 409 }
      );
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors)
        .map((err: any) => err.message)
        .join(', ');
      return NextResponse.json(
        {
          success: false,
          error: messages,
        },
        { status: 400 }
      );
    }

    // Generic error - return user-friendly message
    return NextResponse.json(
      {
        success: false,
        error: 'An error occurred during signup. Please try again.',
      },
      { status: 500 }
    );
  }
}
