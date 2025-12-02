/**
 * Stats API Route - PRODUCTION GRADE
 * GET /api/stats
 * Returns REAL counts from MongoDB for sidebar badges
 * 
 * BUG FIX: Replaces hardcoded sidebar counters with real database counts
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching stats from database...');
    
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

    // Import models
    const Workspace = (await import('@/models/Workspace')).default;
    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Notification = (await import('@/models/Notification')).default;

    // Fetch REAL counts using countDocuments() - most efficient method
    const [workspaces, notes, documents, notifications] = await Promise.all([
      // Count workspaces where user is owner or member
      Workspace.countDocuments({
        $or: [
          { owner: userId },
          { 'members.user': userId },
        ],
      }),
      // Count notes authored by user (not archived)
      Note.countDocuments({ 
        author: userId, 
        isArchived: false 
      }),
      // Count documents uploaded by user (not archived)
      DocumentModel.countDocuments({ 
        author: userId, 
        isArchived: false 
      }),
      // Count unread notifications
      Notification.countDocuments({ 
        user: userId, 
        read: false 
      }),
    ]);

    console.log('✅ Real counts from MongoDB:', { 
      workspaces, 
      notes, 
      documents, 
      notifications 
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          workspaces,
          notes,
          documents,
          notifications,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Stats error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
