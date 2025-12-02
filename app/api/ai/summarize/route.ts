/**
 * AI Summarization API
 * POST /api/ai/summarize
 */

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB } from '@/lib/mongodb';
import { summarizeDocument } from '@/lib/ai-service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
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

    // Parse request body
    const body = await request.json();
    const { title, content, documentId } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: 'Title and content are required' },
        { status: 400 }
      );
    }

    console.log('✨ Generating AI summary for:', title);

    // Generate summary using AI
    const summary = await summarizeDocument(title, content);

    // If documentId provided, save summary to database
    if (documentId) {
      await connectDB();
      const DocumentModel = (await import('@/models/DocumentModel')).default;
      
      await DocumentModel.findByIdAndUpdate(documentId, {
        summary: {
          content: summary.summary,
          keyPoints: summary.keyPoints,
          topics: summary.topics,
          sentiment: summary.sentiment,
        },
      });
    }

    console.log('✅ Summary generated successfully');

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: summary.summary,
          keyPoints: summary.keyPoints,
          topics: summary.topics,
          sentiment: summary.sentiment,
          keywords: summary.topics,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ AI Summarization error:', error);

    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate summary',
      },
      { status: 500 }
    );
  }
}
