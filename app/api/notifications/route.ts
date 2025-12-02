/**
 * Notifications API - FIXED
 * GET /api/notifications
 * Returns REAL user notifications from MongoDB
 * 
 * BUG FIX: Removed hardcoded notifications, now fetches from database
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    console.log('🔔 Fetching notifications from database...');
    
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token and extract user ID
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;
    
    console.log('✅ User authenticated:', userId);

    // Connect to MongoDB
    await connectDB();

    // Import Notification model
    const Notification = (await import('@/models/Notification')).default;

    // Fetch REAL notifications from database for this user
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50) // Limit to 50 notifications
      .lean();

    console.log(`✅ Found ${notifications.length} notifications for user ${userId}`);

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notif => ({
      id: notif._id.toString(),
      type: notif.type,
      title: notif.title,
      message: notif.message,
      timestamp: notif.createdAt.toISOString(),
      read: notif.read,
      data: notif.data || {},
    }));

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.read).length;

    console.log(`✅ Unread count: ${unreadCount}`);

    return NextResponse.json(
      {
        success: true,
        data: formattedNotifications,
        unreadCount: unreadCount,
        total: notifications.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Notifications error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}
