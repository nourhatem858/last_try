/**
 * Get Current User API Route
 * GET /api/auth/me
 * Returns the currently authenticated user's profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'No token provided',
        },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find user
    const user = await User.findById(decoded.id).select('-password -resetOTP -resetOTPExpires -passwordHistory');

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          bio: user.bio || '',
          avatar: user.avatar || '',
          theme: user.theme || 'light',
          favoriteTopics: user.favoriteTopics || [],
          createdAt: user.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Get user error:', error);

    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching user data',
      },
      { status: 500 }
    );
  }
}
