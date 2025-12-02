/**
 * Notes API Route
 * GET /api/notes - List all notes for user/workspace
 * POST /api/notes - Create new note
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - List notes
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

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    await connectDB();

    const Note = (await import('@/models/Note')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    const query: any = { author: userId, isArchived: false };
    
    if (workspaceId) {
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{ owner: userId }, { 'members.user': userId }],
      });

      if (!workspace) {
        return NextResponse.json(
          { success: false, error: 'Workspace not found or access denied' },
          { status: 403 }
        );
      }

      query.workspace = workspaceId;
    }

    const notes = await Note.find(query)
      .populate('workspace', 'name')
      .sort({ isPinned: -1, updatedAt: -1 })
      .lean();

    console.log(`✅ [API] Found ${notes.length} notes for user ${userId}`);

    const formattedNotes = notes.map(note => {
      // Safety check for _id
      if (!note._id) {
        console.error('❌ [API] Note missing _id:', note);
        return null;
      }

      return {
        id: note._id.toString(), // ✅ Convert MongoDB _id to string id
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        workspace: (note.workspace as any)?.name || 'Unknown',
        workspaceId: note.workspace.toString(),
        isPinned: note.isPinned || false,
        color: 'cyan', // ✅ Add color field for UI
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      };
    }).filter(Boolean); // Remove any null entries

    console.log(`✅ [API] Returning ${formattedNotes.length} formatted notes`);

    return NextResponse.json(
      { success: true, data: formattedNotes, count: formattedNotes.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Notes GET error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST - Create note
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
    let { title, content, workspaceId, tags } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Note title is required' }, { status: 400 });
    }

    await connectDB();

    const Note = (await import('@/models/Note')).default;
    const Workspace = (await import('@/models/Workspace')).default;
    const { searchService } = await import('@/lib/search-service');

    // If no workspaceId provided, find or create Personal workspace
    let workspace;
    if (!workspaceId) {
      workspace = await Workspace.findOne({ 
        owner: userId, 
        name: 'Personal' 
      });

      if (!workspace) {
        workspace = await Workspace.create({
          name: 'Personal',
          description: 'Personal workspace',
          owner: userId,
          members: [{ user: userId, role: 'owner' }],
        });
      }
      workspaceId = workspace._id.toString();
    } else {
      workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [{ owner: userId }, { 'members.user': userId }],
      });

      if (!workspace) {
        return NextResponse.json(
          { success: false, error: 'Workspace not found or access denied' },
          { status: 403 }
        );
      }
    }

    const newNote = new Note({
      title: title.trim(),
      content: content || '',
      workspace: workspaceId,
      author: userId,
      tags: tags || [],
      isPinned: false,
      isArchived: false,
      collaborators: [],
      version: 1,
      aiGenerated: false,
    });

    await newNote.save();

    // Index for search
    await searchService.indexDocument({
      id: newNote._id.toString(),
      type: 'note',
      title: newNote.title,
      content: newNote.content,
      workspaceId: workspaceId,
      userId: userId,
      tags: tags,
      createdAt: newNote.createdAt,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Note created successfully',
        data: {
          id: newNote._id.toString(), // ✅ Convert _id to string
          title: newNote.title,
          content: newNote.content,
          tags: newNote.tags,
          workspace: workspace.name,
          workspaceId: workspaceId,
          isPinned: false,
          color: 'cyan', // ✅ Add color field
          createdAt: newNote.createdAt.toISOString(),
          updatedAt: newNote.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Notes POST error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create note: ' + error.message },
      { status: 500 }
    );
  }
}
