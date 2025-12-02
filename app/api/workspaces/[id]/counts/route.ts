/**
 * Workspace Counts API
 * GET /api/workspaces/[id]/counts - Get real-time counts for specific workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import mongoose from 'mongoose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const workspaceId = params.id;

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

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid workspace ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace not found or access denied' },
        { status: 404 }
      );
    }

    const [notes, documents, members] = await Promise.all([
      Note.countDocuments({ workspace: workspaceId }),
      DocumentModel.countDocuments({ workspace: workspaceId }),
      Promise.resolve(workspace.members.length),
    ]);

    return NextResponse.json({
      success: true,
      counts: {
        notes,
        documents,
        members,
      },
    });
  } catch (error: any) {
    console.error('Workspace counts error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workspace counts' },
      { status: 500 }
    );
  }
}
