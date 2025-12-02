/**
 * Chats Count API Route
 * GET /api/chats/count
 * Returns the count of chats for the authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { verifyToken, extractTokenFromHeader } from '@/lib/jwt';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Extract and verify token
    const authHeader = request.headers.get('Authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if Chat model exists, if not return 0
    const Chat = mongoose.models.Chat;
    if (!Chat) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const count = await Chat.countDocuments({ userId: decoded.id });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('❌ Chats count error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get chats count' },
      { status: 500 }
    );
  }
}
