/**
 * Chats API Route
 * GET /api/chats - List all chats for user
 * POST /api/chats - Create new chat
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// GET - List chats
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    await connectDB();

    const Chat = (await import('@/models/Chat')).default;

    const query: any = { participants: userId };
    
    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const chats = await Chat.find(query)
      .populate('workspace', 'name')
      .sort({ lastMessageAt: -1 })
      .lean();

    const formattedChats = chats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title,
      workspace: (chat.workspace as any)?.name || null,
      workspaceId: chat.workspace?.toString() || null,
      isAIConversation: chat.isAIConversation,
      messageCount: chat.messages.length,
      lastMessageAt: chat.lastMessageAt.toISOString(),
      lastMessage: chat.messages.length > 0 
        ? chat.messages[chat.messages.length - 1].content.substring(0, 100)
        : '',
      context: chat.context,
      createdAt: chat.createdAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, data: formattedChats, count: formattedChats.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chats GET error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch chats' }, { status: 500 });
  }
}

// POST - Create chat
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
    const { title, workspaceId, isAIConversation, context } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Chat title is required' }, { status: 400 });
    }

    await connectDB();

    const Chat = (await import('@/models/Chat')).default;
    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;

    // Validate context resources if provided
    if (context) {
      if (context.noteId) {
        const note = await Note.findById(context.noteId);
        if (!note) {
          return NextResponse.json(
            { success: false, error: 'Referenced note not found' },
            { status: 400 }
          );
        }
      }
      if (context.documentId) {
        const doc = await DocumentModel.findById(context.documentId);
        if (!doc) {
          return NextResponse.json(
            { success: false, error: 'Referenced document not found' },
            { status: 400 }
          );
        }
      }
    }

    const newChat = new Chat({
      title: title.trim(),
      workspace: workspaceId || null,
      participants: [userId],
      messages: [],
      context: context || {},
      isAIConversation: isAIConversation || false,
      lastMessageAt: new Date(),
    });

    await newChat.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Chat created successfully',
        data: {
          id: newChat._id.toString(),
          title: newChat.title,
          workspaceId: workspaceId,
          isAIConversation: newChat.isAIConversation,
          context: newChat.context,
          createdAt: newChat.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Chats POST error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create chat: ' + error.message },
      { status: 500 }
    );
  }
}
