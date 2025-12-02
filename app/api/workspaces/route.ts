/**
 * Workspaces API Route
 * GET /api/workspaces - List all workspaces for user
 * POST /api/workspaces - Create new workspace
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - List workspaces
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    await connectDB();

    const Workspace = (await import('@/models/Workspace')).default;

    const workspaces = await Workspace.find({
      $or: [
        { owner: userId },
        { 'members.user': userId },
      ],
    })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedWorkspaces = workspaces.map(ws => ({
      id: ws._id.toString(),
      name: ws.name,
      description: ws.description,
      tags: ws.tags || [],
      owner: ws.owner.toString(),
      isOwner: ws.owner.toString() === userId,
      memberCount: ws.members.length,
      settings: ws.settings,
      createdAt: ws.createdAt.toISOString(),
      updatedAt: ws.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, data: formattedWorkspaces, count: formattedWorkspaces.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Workspaces GET error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch workspaces' }, { status: 500 });
  }
}

// POST - Create workspace
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const body = await request.json();
    const { name, description, tags, settings } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Workspace name is required' }, { status: 400 });
    }

    await connectDB();

    const Workspace = (await import('@/models/Workspace')).default;
    const { searchService } = await import('@/lib/search-service');

    const newWorkspace = new Workspace({
      name: name.trim(),
      description: description?.trim() || '',
      owner: userId,
      members: [
        {
          user: userId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
      settings: settings || {
        visibility: 'private',
        allowMemberInvites: false,
        defaultNotePermission: 'edit',
      },
      tags: tags || [],
    });

    await newWorkspace.save();

    // Index for search
    await searchService.indexDocument({
      id: newWorkspace._id.toString(),
      type: 'workspace',
      title: newWorkspace.name,
      content: newWorkspace.description || '',
      userId: userId,
      tags: tags,
      createdAt: newWorkspace.createdAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Workspace created successfully',
        data: {
          id: newWorkspace._id.toString(),
          name: newWorkspace.name,
          description: newWorkspace.description,
          tags: newWorkspace.tags,
          createdAt: newWorkspace.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Workspaces POST error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create workspace: ' + error.message },
      { status: 500 }
    );
  }
}
