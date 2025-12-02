/**
 * Dashboard Summary API
 * GET /api/dashboard/summary - Get real-time counts from database
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

    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const User = (await import('@/models/User')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const Chat = (await import('@/models/Chat')).default;

    const [notes, documents, workspaces, chats, totalMembers] = await Promise.all([
      Note.countDocuments({ author: userId }),
      DocumentModel.countDocuments({ author: userId }),
      Workspace.countDocuments({
        $or: [{ owner: userId }, { 'members.user': userId }],
      }),
      Chat.countDocuments({ participants: userId }),
      Workspace.aggregate([
        { $match: { $or: [{ owner: userId }, { 'members.user': userId }] } },
        { $unwind: '$members' },
        { $group: { _id: '$members.user' } },
        { $count: 'total' },
      ]).then((result) => (result[0]?.total || 0)),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        notes,
        documents,
        members: totalMembers,
        workspaces,
        chats,
      },
    });
  } catch (error: any) {
    console.error('Dashboard summary error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}
