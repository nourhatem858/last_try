/**
 * Single Note API Route
 * GET /api/notes/[id] - Get note details
 * PATCH /api/notes/[id] - Update note
 * DELETE /api/notes/[id] - Delete note
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
  console.log('🔍 [API] GET /api/notes/[id] - Starting request');
  
  try {
    // ✅ FIX: Handle both Promise and direct params (Next.js 15 compatibility)
    const params = await Promise.resolve(context.params);
    const noteId = params.id;
    console.log('📝 [API] Note ID:', noteId);
    
    // 1. Check authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      console.log('❌ [API] No token provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Authentication token is required'
        }, 
        { status: 401 }
      );
    }

    // 2. Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ [API] Token verified for user:', decoded.id);
    } catch (jwtError: any) {
      console.error('❌ [API] JWT verification failed:', jwtError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid token',
          message: 'Your session has expired. Please login again.'
        }, 
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 3. Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      console.log('❌ [API] Invalid ObjectId format:', noteId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid note ID',
          message: 'The note ID format is invalid'
        }, 
        { status: 400 }
      );
    }

    // 4. Connect to MongoDB
    console.log('🔌 [API] Connecting to MongoDB...');
    try {
      await connectDB();
      console.log('✅ [API] MongoDB connected');
    } catch (dbError: any) {
      console.error('❌ [API] MongoDB connection failed:', dbError.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          message: 'Unable to connect to database. Please try again later.'
        }, 
        { status: 503 }
      );
    }

    // 5. Import models
    const Note = (await import('@/models/Note')).default;
    const Workspace = (await import('@/models/Workspace')).default;

    // 6. Find note
    console.log('🔍 [API] Searching for note:', noteId);
    const note = await Note.findById(noteId)
      .populate('workspace', 'name')
      .populate('author', 'name email')
      .lean();

    if (!note) {
      console.log('❌ [API] Note not found:', noteId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Note not found',
          message: 'This note does not exist or has been deleted'
        }, 
        { status: 404 }
      );
    }

    console.log('✅ [API] Note found:', note.title);

    // 7. Verify workspace access
    console.log('🔐 [API] Checking workspace access...');
    const workspace = await Workspace.findOne({
      _id: note.workspace,
      $or: [{ owner: userId }, { 'members.user': userId }],
    });

    if (!workspace) {
      console.log('❌ [API] Access denied for user:', userId);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Access denied',
          message: 'You do not have permission to view this note'
        }, 
        { status: 403 }
      );
    }

    console.log('✅ [API] Access granted');

    // 8. Return note data with color field
    const responseData = {
      success: true,
      note: {
        id: note._id.toString(),
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        workspace: (note.workspace as any)?.name || 'Unknown',
        workspaceId: note.workspace.toString(),
        author: (note.author as any)?.name || 'Unknown',
        isPinned: note.isPinned || false,
        isArchived: note.isArchived || false,
        color: 'cyan', // Default color for UI
        createdAt: note.createdAt.toISOString(),
        updatedAt: note.updatedAt.toISOString(),
      },
    };

    console.log('✅ [API] Returning note data successfully');
    return NextResponse.json(responseData, { status: 200 });

  } catch (error: any) {
    console.error('❌ [API] Unexpected error:', error);
    console.error('❌ [API] Error stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Server error',
        message: 'An unexpected error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // ✅ FIX: Handle both Promise and direct params (Next.js 15 compatibility)
    const params = await Promise.resolve(context.params);
    const noteId = params.id;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const body = await request.json();
    const { title, content, tags, isPinned } = body;

    await connectDB();

    const Note = (await import('@/models/Note')).default;

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note ID' }, { status: 400 });
    }

    const note = await Note.findOne({ _id: noteId, author: userId });

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found or access denied' }, { status: 404 });
    }

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (isPinned !== undefined) note.isPinned = isPinned;

    await note.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Note updated successfully',
        note: {
          id: note._id.toString(),
          title: note.title,
          content: note.content,
          tags: note.tags,
          isPinned: note.isPinned,
          updatedAt: note.updatedAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Note PATCH error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // ✅ FIX: Handle both Promise and direct params (Next.js 15 compatibility)
    const params = await Promise.resolve(context.params);
    const noteId = params.id;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    await connectDB();

    const Note = (await import('@/models/Note')).default;
    const { searchService } = await import('@/lib/search-service');

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return NextResponse.json({ success: false, error: 'Invalid note ID' }, { status: 400 });
    }

    const note = await Note.findOneAndDelete({ _id: noteId, author: userId });

    if (!note) {
      return NextResponse.json({ success: false, error: 'Note not found or access denied' }, { status: 404 });
    }

    // Remove from search index
    await searchService.removeDocument('note', noteId);

    return NextResponse.json(
      { success: true, message: 'Note deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Note DELETE error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 500 });
  }
}
