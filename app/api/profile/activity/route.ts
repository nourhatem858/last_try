/**
 * Profile Activity API Route
 * GET /api/profile/activity - Get user recent activity
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    await connectDB();

    // Import models
    const Bookmark = (await import('@/models/Bookmark')).default;
    const Card = (await import('@/models/Card')).default;

    // Get recent bookmarks
    const recentBookmarks = await Bookmark.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('cardId', 'title category')
      .lean();

    // Format activities
    const activities = recentBookmarks.map((bookmark: any) => ({
      id: bookmark._id.toString(),
      title: bookmark.cardId?.title || 'Unknown Card',
      type: 'bookmarked' as const,
      timestamp: bookmark.createdAt.toISOString(),
      category: bookmark.cardId?.category || '',
    }));

    // TODO: Add more activity types (views, likes) when implemented

    return NextResponse.json(
      {
        success: true,
        activities,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Profile activity error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
