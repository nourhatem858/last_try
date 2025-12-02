/**
 * Workspaces Count API Route
 * GET /api/workspaces/count
 * Returns the count of workspaces for the authenticated user
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

    // Check if Workspace model exists, if not return 0
    const Workspace = mongoose.models.Workspace;
    if (!Workspace) {
      return NextResponse.json({ success: true, count: 0 });
    }

    // Count workspaces where user is owner or member
    const count = await Workspace.countDocuments({
      $or: [
        { owner: decoded.id },
        { members: decoded.id }
      ]
    });

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error('❌ Workspaces count error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get workspaces count' },
      { status: 500 }
    );
  }
}
