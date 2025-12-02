/**
 * AI Ask API Route - REAL AI IMPLEMENTATION
 * POST /api/ai/ask - Ask AI a question with context
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { askAI } from '@/lib/ai-service';
import AIConversation from '@/models/AIConversation';
import Note from '@/models/Note';
import DocumentModel from '@/models/DocumentModel';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Parse request body
    const body = await request.json();
    const { question, conversationId } = body;

    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get or create conversation
    let conversation;

    if (conversationId) {
      conversation = await AIConversation.findOne({
        _id: conversationId,
        user: userId,
      });
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        user: userId,
        title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
        messages: [],
        context: {
          relatedNotes: [],
          relatedDocuments: [],
          tags: [],
        },
      });
    }

    // Get relevant context from user's workspace
    const recentNotes = await Note.find({ author: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title content')
      .lean();

    const recentDocs = await DocumentModel.find({ author: userId })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title extractedText summary')
      .lean();

    // Build context string
    const contextParts = [];
    if (recentNotes.length > 0) {
      contextParts.push('Recent Notes:\n' + recentNotes.map(n => `- ${n.title}: ${n.content.substring(0, 200)}`).join('\n'));
    }
    if (recentDocs.length > 0) {
      contextParts.push('Recent Documents:\n' + recentDocs.map(d => `- ${d.title}: ${d.summary?.content || d.extractedText?.substring(0, 200) || ''}`).join('\n'));
    }

    const context = contextParts.join('\n\n');

    // Get AI response
    const aiResult = await askAI(
      question,
      context,
      conversation.messages.slice(-10) // Last 10 messages for context
    );

    // Save messages to conversation
    conversation.messages.push({
      role: 'user',
      content: question,
      timestamp: new Date(),
    });

    conversation.messages.push({
      role: 'assistant',
      content: aiResult.content,
      timestamp: new Date(),
      sources: aiResult.sources,
    });

    await conversation.save();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: conversation._id.toString(),
          content: aiResult.content,
          sources: aiResult.sources || [],
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('AI Ask POST error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get AI response' },
      { status: 500 }
    );
  }
}
