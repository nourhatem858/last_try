/**
 * Notes Count API Route
 * GET /api/notes/count
 * Returns the count of notes for the authenticated user
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

    // Check if Note model exists, if not return 0
    const Note = mongoose.models.Note;
    if (!Note) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const count = await Note.countDocuments({ userId: decoded.id });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('❌ Notes count error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get notes count' },
      { status: 500 }
    );
  }
}
