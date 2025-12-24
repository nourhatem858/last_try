/**
 * Single Chat API Route
 * GET /api/chats/[id] - Get chat details with messages
 * POST /api/chats/[id] - Add message to chat
 * DELETE /api/chats/[id] - Delete chat
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
    const chatId = params.id;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    await connectDB();

    const Chat = (await import('@/models/Chat')).default;
    const Note = (await import('@/models/Note')).default;
    const DocumentModel = (await import('@/models/DocumentModel')).default;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ success: false, error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    })
      .populate('workspace', 'name')
      .populate('messages.sender', 'name email')
      .lean();

    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    // Check if referenced resources still exist
    let contextResources: any = {};
    
    if (chat.context?.noteId) {
      const note = await Note.findById(chat.context.noteId).select('title').lean();
      contextResources.note = note ? { id: note._id.toString(), title: note.title } : { isMissing: true };
    }
    
    if (chat.context?.documentId) {
      const doc = await DocumentModel.findById(chat.context.documentId).select('title').lean();
      contextResources.document = doc ? { id: doc._id.toString(), title: doc.title } : { isMissing: true };
    }

    return NextResponse.json(
      {
        success: true,
        chat: {
          id: chat._id.toString(),
          title: chat.title,
          workspace: (chat.workspace as any)?.name || null,
          workspaceId: chat.workspace?.toString() || null,
          isAIConversation: chat.isAIConversation,
          messages: chat.messages.map((msg: any) => ({
            sender: msg.sender?._id?.toString() || msg.sender.toString(),
            senderName: msg.sender?.name || 'Unknown User',
            senderEmail: msg.sender?.email || '',
            content: msg.content,
            type: msg.type,
            metadata: msg.metadata,
            timestamp: msg.timestamp.toISOString(),
          })),
          context: chat.context,
          contextResources,
          lastMessageAt: chat.lastMessageAt.toISOString(),
          createdAt: chat.createdAt.toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chat GET error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch chat' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const chatId = params.id;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    const body = await request.json();
    const { content, type = 'user', metadata } = body;

    if (!content || !content.trim()) {
      return NextResponse.json({ success: false, error: 'Message content is required' }, { status: 400 });
    }

    await connectDB();

    const Chat = (await import('@/models/Chat')).default;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ success: false, error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await Chat.findOne({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    const newMessage = {
      sender: userId,
      content: content.trim(),
      type,
      metadata: metadata || {},
      timestamp: new Date(),
    };

    chat.messages.push(newMessage as any);
    chat.lastMessageAt = new Date();
    await chat.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Message added successfully',
        data: {
          sender: userId,
          content: newMessage.content,
          type: newMessage.type,
          timestamp: newMessage.timestamp.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Chat POST error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to add message' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const params = await Promise.resolve(context.params);
    const chatId = params.id;
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    await connectDB();

    const Chat = (await import('@/models/Chat')).default;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return NextResponse.json({ success: false, error: 'Invalid chat ID' }, { status: 400 });
    }

    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      participants: userId,
    });

    if (!chat) {
      return NextResponse.json({ success: false, error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(
      { success: true, message: 'Chat deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Chat DELETE error:', error);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete chat' }, { status: 500 });
  }
}
